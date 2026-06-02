import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { expireSessionCookie } from "./_core/context";
import { z } from "zod";
import { getJobs, getAllJobs, createCvUpload, getUserCvUploads } from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

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
  }),

  jobs: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const results = await getJobs(input?.search);
        return { jobs: results, total: results.length };
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
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
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
});

export type AppRouter = typeof appRouter;
