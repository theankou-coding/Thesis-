import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { expireSessionCookie, setSessionCookie } from "./_core/context";
import { z } from "zod";
import {
  getJobs,
  getAllJobs,
  getJobById,
  createCvUpload,
  getUserCvUploads,
  getSupabase,
  upsertUser,
  getUserByOpenId,
  getJobImages,
  addJobImages,
  upsertHrUser,
  getHrUserByUserId,
  createJobApplication,
  deleteJobApplication,
  getUserApplications,
  createSavedJob,
  deleteSavedJob,
  getUserSavedJobs,
  createJob,
  deleteJob,
  updateUserRole,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut, storagePutCv } from "./storage";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";

// Helper: normalize text for keyword matching
function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
}

// Helper: keyword-based recommendation scoring
function scoreJobs(cvText: string, jobList: Awaited<ReturnType<typeof getAllJobs>>) {
  const text = normalize(cvText);
  return jobList.map((job) => {
    const skills = job.skills.split(",").map(s => s.trim());
    const matchedSkills = skills.filter((skill) => text.includes(normalize(skill)));
    const missingSkills = skills.filter((skill) => !text.includes(normalize(skill))).slice(0, 5);
    const baseScore = matchedSkills.length / skills.length;
    const titleBoost = normalize(job.title).split(" ").filter(w => w.length > 3).some(w => text.includes(w)) ? 0.12 : 0;
    const score = Math.min(98, Math.round((baseScore + titleBoost) * 100));
    return { ...job, score, matchedSkills, missingSkills };
  }).sort((a, b) => b.score - a.score);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      expireSessionCookie(ctx);
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
          profileImageContent: z.string().min(1, "Profile image is required"),
          profileImageName: z.string(),
          profileImageMime: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const supabase = getSupabase();
        if (!supabase) {
          throw new Error("Supabase is not configured");
        }

        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              name: input.name,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error("Sign up failed: User creation returned empty");
        }

        // Upload profile image to S3
        const buffer = Buffer.from(input.profileImageContent, "base64");
        const fileKey = `profile-images/${data.user.id}/${Date.now()}-${input.profileImageName}`;
        const { url: imageUrl } = await storagePut(fileKey, buffer, input.profileImageMime);

        // Upsert the user into the local database with Name:::AvatarUrl
        await upsertUser({
          openId: data.user.id,
          name: `${input.name}:::${imageUrl}`,
          email: input.email,
          loginMethod: "email",
          lastSignedIn: null, // User has not signed in yet (must confirm email first)
          profileImageUrl: imageUrl,
        });

        return { success: true, email: input.email, needsConfirmation: true };
      }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          profileImageContent: z.string().optional(),
          profileImageName: z.string().optional(),
          profileImageMime: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        let avatarUrl = ctx.user.profileImageUrl || "";
        
        if (!avatarUrl && ctx.user.name && ctx.user.name.includes(":::")) {
          avatarUrl = ctx.user.name.split(":::")[1] || "";
        }
        
        if (input.profileImageContent && input.profileImageName && input.profileImageMime) {
          const buffer = Buffer.from(input.profileImageContent, "base64");
          const fileKey = `profile-images/${ctx.user.openId}/${Date.now()}-${input.profileImageName}`;
          const { url } = await storagePut(fileKey, buffer, input.profileImageMime);
          avatarUrl = url;
        }
        
        const fullName = `${input.name}:::${avatarUrl}`;
        await upsertUser({
          openId: ctx.user.openId,
          name: fullName,
          email: ctx.user.email,
          loginMethod: ctx.user.loginMethod,
          lastSignedIn: ctx.user.lastSignedIn ? new Date(ctx.user.lastSignedIn) : null,
          profileImageUrl: avatarUrl,
        });
        
        return { success: true, name: fullName };
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const supabase = getSupabase();
        if (!supabase) {
          throw new Error("Supabase is not configured");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error("Sign in failed: User returned empty");
        }

        // Check if user exists in local database, otherwise upsert
        let dbUser = await getUserByOpenId(data.user.id);
        const name = dbUser?.name || data.user.user_metadata?.name || input.email.split("@")[0];

        await upsertUser({
          openId: data.user.id,
          name,
          email: input.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(data.user.id, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });

        setSessionCookie(ctx, sessionToken);

        return { success: true, user: { email: data.user.email, id: data.user.id } };
      }),
  }),

  jobs: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const results = await getJobs(input?.search);
        const jobsWithImages = await Promise.all(results.map(async (job) => {
          const images = await getJobImages(job.id);
          const primaryImage = images.find(img => img.isPrimary) || images[0];
          return { ...job, coverImage: primaryImage?.imageUrl || null };
        }));
        return { jobs: jobsWithImages, total: jobsWithImages.length };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const job = await getJobById(input.id);
        if (!job) return null;
        const images = await getJobImages(input.id);
        return { ...job, images };
      }),
  }),

  cv: router({
    recommend: publicProcedure
      .input(z.object({ cvText: z.string().min(10) }))
      .mutation(async ({ input }) => {
        const jobList = await getAllJobs();
        const recommendations = scoreJobs(input.cvText, jobList);
        const detectedSkills = Array.from(new Set(
          jobList.flatMap(j => j.skills.split(",").map(s => s.trim()))
            .filter(skill => normalize(input.cvText).includes(normalize(skill)))
        )).slice(0, 20);
        return { recommendations, detectedSkills, analyzedAt: new Date().toISOString() };
      }),

    analyzeLLM: publicProcedure
      .input(z.object({ cvText: z.string().min(10) }))
      .mutation(async ({ input }) => {
        const jobList = await getAllJobs();
        const topJobs = scoreJobs(input.cvText, jobList).slice(0, 4);
        const jobContext = topJobs.map(j => `- ${j.title} at ${j.company} (${j.score}% match, matched: ${j.matchedSkills.join(", ")})`).join("\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a professional career advisor. Analyze the CV text provided and return a JSON object with exactly these fields:
- "skillSummary": A paragraph summarizing the candidate's key technical and soft skills.
- "careerProfile": A paragraph describing their career trajectory, strengths, and potential.
- "recommendations": An array of objects, one for each job listed below, each with "jobTitle", "company", and "rationale" (a 2-3 sentence explanation of why this role fits or what gaps exist).

Jobs to evaluate:
${jobContext}

Return ONLY valid JSON, no markdown fences.`
            },
            { role: "user", content: input.cvText }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "cv_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  skillSummary: { type: "string", description: "Summary of candidate skills" },
                  careerProfile: { type: "string", description: "Career trajectory analysis" },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        jobTitle: { type: "string" },
                        company: { type: "string" },
                        rationale: { type: "string" }
                      },
                      required: ["jobTitle", "company", "rationale"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["skillSummary", "careerProfile", "recommendations"],
                additionalProperties: false
              }
            }
          }
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "{}";
        try {
          return JSON.parse(content);
        } catch {
          return { skillSummary: content, careerProfile: "", recommendations: [] };
        }
      }),

    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64 encoded
        mimeType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileContent, "base64");
        const fileKey = `cv-uploads/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePutCv(fileKey, buffer, input.mimeType);
        await createCvUpload({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
        });
        return { success: true, url, fileName: input.fileName };
      }),

    myUploads: protectedProcedure.query(async ({ ctx }) => {
      return getUserCvUploads(ctx.user.id);
    }),
  }),

  hr: router({
    register: protectedProcedure
      .input(
        z.object({
          company: z.string().min(1),
          jobTitle: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await upsertHrUser({
          userId: ctx.user.id,
          company: input.company,
          jobTitle: input.jobTitle || null,
          verified: true, // Default to true for thesis dev ease
        });
        await updateUserRole(ctx.user.id, "hr");
        return { success: true };
      }),
    me: protectedProcedure.query(async ({ ctx }) => {
      return getHrUserByUserId(ctx.user.id);
    }),
    postJob: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          location: z.string().min(1),
          type: z.string().min(1),
          level: z.string().min(1),
          description: z.string().min(10),
          skills: z.string().min(1),
          salary: z.string().min(1),
          images: z.array(
            z.object({
              content: z.string(), // base64
              name: z.string(),
              mime: z.string(),
              isPrimary: z.boolean().optional(),
            })
          ).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const hr = await getHrUserByUserId(ctx.user.id);
        if (!hr) {
          throw new Error("User is not registered as HR");
        }

        const job = await createJob({
          title: input.title,
          company: hr.company,
          location: input.location,
          type: input.type,
          level: input.level,
          description: input.description,
          skills: input.skills,
          salary: input.salary,
        });

        if (input.images && input.images.length > 0) {
          const imageRows = await Promise.all(
            input.images.map(async (img) => {
              const buffer = Buffer.from(img.content, "base64");
              const fileKey = `job-images/${job.id}/${Date.now()}-${img.name}`;
              const { url } = await storagePut(fileKey, buffer, img.mime);
              return {
                jobId: job.id,
                imageUrl: url,
                isPrimary: img.isPrimary || false,
              };
            })
          );
          await addJobImages(imageRows);
        }

        return { success: true, jobId: job.id };
      }),
    myJobs: protectedProcedure.query(async ({ ctx }) => {
      const hr = await getHrUserByUserId(ctx.user.id);
      if (!hr) return [];
      
      const allJobs = await getAllJobs();
      const filtered = allJobs.filter((job) => job.company.toLowerCase() === hr.company.toLowerCase());
      
      return Promise.all(
        filtered.map(async (job) => {
          const images = await getJobImages(job.id);
          const primaryImage = images.find(img => img.isPrimary) || images[0];
          return { ...job, coverImage: primaryImage?.imageUrl || null, images };
        })
      );
    }),
    deleteJob: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const hr = await getHrUserByUserId(ctx.user.id);
        if (!hr) {
          throw new Error("Unauthorized");
        }
        const job = await getJobById(input.id);
        if (!job || job.company.toLowerCase() !== hr.company.toLowerCase()) {
          throw new Error("Unauthorized or Job not found");
        }
        await deleteJob(input.id);
        return { success: true };
      }),
  }),

  applications: router({
    submit: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await createJobApplication({
          userId: ctx.user.id,
          jobId: input.jobId,
          status: "applied",
        });
        return { success: true };
      }),
    cancel: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteJobApplication(ctx.user.id, input.jobId);
        return { success: true };
      }),
    myApplications: protectedProcedure.query(async ({ ctx }) => {
      const apps = await getUserApplications(ctx.user.id);
      const list = await Promise.all(
        apps.map(async (app) => {
          const job = await getJobById(app.jobId);
          if (!job) return null;
          const images = await getJobImages(job.id);
          const primaryImage = images.find(img => img.isPrimary) || images[0];
          return {
            ...app,
            job: {
              ...job,
              coverImage: primaryImage?.imageUrl || null,
            },
          };
        })
      );
      return list.filter((item): item is NonNullable<typeof item> => item !== null);
    }),
  }),

  saved: router({
    save: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await createSavedJob({
          userId: ctx.user.id,
          jobId: input.jobId,
        });
        return { success: true };
      }),
    unsave: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteSavedJob(ctx.user.id, input.jobId);
        return { success: true };
      }),
    mySaved: protectedProcedure.query(async ({ ctx }) => {
      const saved = await getUserSavedJobs(ctx.user.id);
      const list = await Promise.all(
        saved.map(async (s) => {
          const job = await getJobById(s.jobId);
          if (!job) return null;
          const images = await getJobImages(job.id);
          const primaryImage = images.find(img => img.isPrimary) || images[0];
          return {
            ...s,
            job: {
              ...job,
              coverImage: primaryImage?.imageUrl || null,
            },
          };
        })
      );
      return list.filter((item): item is NonNullable<typeof item> => item !== null);
    }),
  }),

});

export type AppRouter = typeof appRouter;
