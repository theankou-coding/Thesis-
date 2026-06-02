import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL, ADMIN_OPEN_ID } from "./adminAuth";
import { ENV } from "./_core/env";
import { storageUrlToProxyPath } from "./storage";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: string;
  lastSignedIn: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  profileImageUrl: string | null;
};

export type InsertUser = {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string | null;
  lastSignedIn?: Date | string | null;
  profileImageUrl?: string | null;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  description: string;
  skills: string;
  salary: string;
  createdAt: string | null;
};

export type JobImage = {
  id: number;
  jobId: number;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string | null;
};

export type CvUpload = {
  id: number;
  userId: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
};

export type InsertCvUpload = {
  userId: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

export type AdminDashboardSnapshot = {
  refreshedAt: string;
  totalUsers: number;
  activeUsers: number;
  totalCvUploads: number;
  totalJobs: number;
  totalAdmins: number;
  recentUsers: Array<User & { cvUploads: number }>;
  recentJobs: Array<Job & { coverImage: string | null; images: JobImage[] }>;
  recentUploads: Array<
    CvUpload & {
      userName: string | null;
      userEmail: string | null;
    }
  >;
};

type DbRow = Record<string, unknown>;

let _supabase: SupabaseClient | null | undefined;
let _supabaseAdmin: SupabaseClient | null | undefined;

export function getSupabase() {
  if (_supabase !== undefined) return _supabase;

  if (!ENV.supabaseUrl || !ENV.supabaseKey) {
    console.warn(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
    _supabase = null;
    return _supabase;
  }

  _supabase = createClient(ENV.supabaseUrl, ENV.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabase;
}

export function getSupabaseAdmin() {
  if (_supabaseAdmin !== undefined) return _supabaseAdmin;

  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    if (!ENV.supabaseServiceRoleKey) {
      console.warn(
        "[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY. Server database writes may fail when RLS is enabled."
      );
    }
    _supabaseAdmin = null;
    return _supabaseAdmin;
  }

  _supabaseAdmin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}

function getDatabaseSupabase() {
  return getSupabaseAdmin() ?? getSupabase();
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function splitStoredName(value: string | null) {
  if (!value) return { name: null, imageUrl: null };

  const [name, imageUrl] = value.split(":::");
  return {
    name: name || null,
    imageUrl: imageUrl || null,
  };
}

function normalizeStoredImageUrl(value: string | null) {
  return storageUrlToProxyPath(value);
}

function mapUser(row: DbRow): User {
  const storedName = splitStoredName(asNullableString(row.name));

  return {
    id: asNumber(row.id),
    openId: asString(row.open_id),
    name: storedName.name,
    email: asNullableString(row.email),
    loginMethod: asNullableString(row.login_method),
    role: asString(row.role, "user"),
    lastSignedIn: asNullableString(row.last_signed_in),
    createdAt: asNullableString(row.created_at),
    updatedAt: asNullableString(row.updated_at),
    profileImageUrl: normalizeStoredImageUrl(
      asNullableString(row.profile_image_url) ?? storedName.imageUrl
    ),
  };
}

function mapJob(row: DbRow): Job {
  return {
    id: asNumber(row.id),
    title: asString(row.title),
    company: asString(row.company),
    location: asString(row.location),
    type: asString(row.type),
    level: asString(row.level),
    description: asString(row.description),
    skills: asString(row.skills),
    salary: asString(row.salary),
    createdAt: asNullableString(row.created_at),
  };
}

function mapCvUpload(row: DbRow): CvUpload {
  return {
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    fileName: asString(row.file_name),
    fileKey: asString(row.file_key),
    fileUrl: asString(row.file_url),
    mimeType: asString(row.mime_type),
    fileSize: asNumber(row.file_size),
    createdAt: asString(row.created_at, new Date(0).toISOString()),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const now = new Date().toISOString();
  const storedName = splitStoredName(user.name ?? null);
  const row: Record<string, any> = {
    open_id: user.openId,
    name: storedName.name,
    email: user.email ?? null,
    login_method: user.loginMethod ?? null,
    last_signed_in: normalizeDate(user.lastSignedIn) ?? now,
    updated_at: now,
  };

  if (user.role) {
    row.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    row.role = "admin";
  }

  if (user.profileImageUrl !== undefined) {
    row.profile_image_url = user.profileImageUrl ?? storedName.imageUrl;
  }

  const { error } = await supabase
    .from("users")
    .upsert(row, { onConflict: "open_id" });

  if (error) {
    console.error("[Supabase] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  if (openId === ADMIN_OPEN_ID) {
    const now = new Date().toISOString();
    return {
      id: 1,
      openId: ADMIN_OPEN_ID,
      name: "Admin",
      email: ADMIN_EMAIL,
      loginMethod: "password",
      role: "admin",
      lastSignedIn: now,
      createdAt: now,
      updatedAt: now,
      profileImageUrl: null,
    } satisfies User;
  }

  const supabase = getDatabaseSupabase();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch user:", error);
    return undefined;
  }

  return data ? mapUser(data as DbRow) : undefined;
}

export async function getUserById(id: number): Promise<User | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch user by id:", error);
    return null;
  }

  return data ? mapUser(data as DbRow) : null;
}

export async function getJobs(search?: string) {
  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      [
        `title.ilike.${term}`,
        `company.ilike.${term}`,
        `location.ilike.${term}`,
        `type.ilike.${term}`,
        `level.ilike.${term}`,
        `description.ilike.${term}`,
        `skills.ilike.${term}`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] Failed to fetch jobs:", error);
    return [];
  }

  return (data ?? []).map(row => mapJob(row as DbRow));
}

export async function getAllJobs() {
  return getJobs();
}

export async function getJobById(id: number): Promise<Job | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch job by id:", error);
    return null;
  }

  return data ? mapJob(data as DbRow) : null;
}

export async function createCvUpload(data: InsertCvUpload): Promise<CvUpload> {
  const supabase = getDatabaseSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data: row, error } = await supabase
    .from("cv_uploads")
    .insert({
      user_id: data.userId,
      file_name: data.fileName,
      file_key: data.fileKey,
      file_url: data.fileUrl,
      mime_type: data.mimeType,
      file_size: data.fileSize,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to create CV upload:", error);
    throw error;
  }

  return mapCvUpload(row as DbRow);
}

export async function getUserCvUploads(userId: number) {
  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cv_uploads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch CV uploads:", error);
    return [];
  }

  return (data ?? []).map(row => mapCvUpload(row as DbRow));
}

export async function getCvUploadById(id: number): Promise<CvUpload | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("cv_uploads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch CV upload:", error);
    return null;
  }

  return data ? mapCvUpload(data as DbRow) : null;
}

export async function deleteCvUpload(
  userId: number,
  cvUploadId: number
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("cv_uploads")
    .delete()
    .eq("id", cvUploadId)
    .eq("user_id", userId);

  if (error) {
    console.error("[Supabase] Failed to delete CV upload:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Extended Feature Types & Mappers
// ---------------------------------------------------------------------------

export type InsertJobImage = {
  jobId: number;
  imageUrl: string;
  isPrimary?: boolean;
};

export type HrUser = {
  id: number;
  userId: number;
  company: string;
  jobTitle: string | null;
  verified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InsertHrUser = {
  userId: number;
  company: string;
  jobTitle?: string | null;
  verified?: boolean;
};

export type JobApplication = {
  id: number;
  userId: number;
  jobId: number;
  status: string;
  appliedAt: string | null;
};

export type HrJobApplication = JobApplication & {
  applicantName: string | null;
  applicantEmail: string | null;
  applicantProfileImageUrl: string | null;
  job: Job;
  cvUrl: string | null;
  cvFileName: string | null;
};

export type InsertJobApplication = {
  userId: number;
  jobId: number;
  status?: string;
};

export type SavedJob = {
  id: number;
  userId: number;
  jobId: number;
  savedAt: string | null;
};

export type InsertSavedJob = {
  userId: number;
  jobId: number;
};

function mapJobImage(row: DbRow): JobImage {
  return {
    id: asNumber(row.id),
    jobId: asNumber(row.job_id),
    imageUrl: normalizeStoredImageUrl(asString(row.image_url)) ?? "",
    isPrimary: typeof row.is_primary === "boolean" ? row.is_primary : false,
    createdAt: asNullableString(row.created_at),
  };
}

function mapHrUser(row: DbRow): HrUser {
  return {
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    company: asString(row.company),
    jobTitle: asNullableString(row.job_title),
    verified: typeof row.verified === "boolean" ? row.verified : false,
    createdAt: asNullableString(row.created_at),
    updatedAt: asNullableString(row.updated_at),
  };
}

function mapJobApplication(row: DbRow): JobApplication {
  return {
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    jobId: asNumber(row.job_id),
    status: asString(row.status, "applied"),
    appliedAt: asNullableString(row.applied_at),
  };
}

function mapSavedJob(row: DbRow): SavedJob {
  return {
    id: asNumber(row.id),
    userId: asNumber(row.user_id),
    jobId: asNumber(row.job_id),
    savedAt: asNullableString(row.saved_at),
  };
}

// ---------------------------------------------------------------------------
// Extended Feature Database Operations
// ---------------------------------------------------------------------------

export async function addJobImages(images: InsertJobImage[]): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const rows = images.map(img => ({
    job_id: img.jobId,
    image_url: img.imageUrl,
    is_primary: img.isPrimary ?? false,
  }));

  const { error } = await supabase.from("job_images").insert(rows);
  if (error) {
    console.error("[Supabase] Failed to add job images:", error);
    throw error;
  }
}

export async function getJobImages(jobId: number): Promise<JobImage[]> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("job_images")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Supabase] Failed to fetch job images:", error);
    return [];
  }

  return (data ?? []).map(row => mapJobImage(row as DbRow));
}

export async function upsertHrUser(hr: InsertHrUser): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const now = new Date().toISOString();
  const row = {
    user_id: hr.userId,
    company: hr.company,
    job_title: hr.jobTitle ?? null,
    verified: hr.verified ?? false,
    updated_at: now,
  };

  const { error } = await supabase
    .from("hr_users")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.error("[Supabase] Failed to upsert HR user:", error);
    throw error;
  }
}

export async function getHrUserByUserId(
  userId: number
): Promise<HrUser | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("hr_users")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch HR user by userId:", error);
    return null;
  }

  return data ? mapHrUser(data as DbRow) : null;
}

export async function getHrUserByCompany(
  company: string
): Promise<HrUser | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("hr_users")
    .select("*")
    .ilike("company", company)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch HR user by company:", error);
    return null;
  }

  return data ? mapHrUser(data as DbRow) : null;
}

export async function createJobApplication(
  app: InsertJobApplication
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("job_applications").insert({
    user_id: app.userId,
    job_id: app.jobId,
    status: app.status ?? "applied",
  });

  if (error) {
    console.error("[Supabase] Failed to create job application:", error);
    throw error;
  }
}

export async function deleteJobApplication(
  userId: number,
  jobId: number
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) {
    console.error("[Supabase] Failed to delete job application:", error);
    throw error;
  }
}

export async function getUserApplications(
  userId: number
): Promise<JobApplication[]> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[Supabase] Failed to fetch user applications:", error);
    return [];
  }

  return (data ?? []).map(row => mapJobApplication(row as DbRow));
}

export async function getHrJobApplications(
  company: string
): Promise<HrJobApplication[]> {
  const jobs = (await getAllJobs()).filter(
    job => job.company.toLowerCase() === company.toLowerCase()
  );

  if (jobs.length === 0) return [];

  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  const jobsById = new Map(jobs.map(job => [job.id, job]));
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .in("job_id", jobs.map(job => job.id))
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch HR applications:", error);
    return [];
  }

  const applications = (data ?? []).map(row =>
    mapJobApplication(row as DbRow)
  );
  const userIds = Array.from(new Set(applications.map(app => app.userId)));
  let usersById = new Map<number, User>();
  let latestCvByUserId = new Map<number, CvUpload>();

  if (userIds.length > 0) {
    // Fetch users details
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);

    if (usersError) {
      console.error("[Supabase] Failed to fetch application users:", usersError);
    } else {
      usersById = ((users ?? []) as DbRow[]).reduce((map, row) => {
        const user = mapUser(row);
        map.set(user.id, user);
        return map;
      }, new Map<number, User>());
    }

    // Fetch user CV uploads
    const { data: cvs, error: cvsError } = await supabase
      .from("cv_uploads")
      .select("*")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    if (cvsError) {
      console.error("[Supabase] Failed to fetch applicant CVs:", cvsError);
    } else {
      ((cvs ?? []) as DbRow[]).forEach(row => {
        const cv = mapCvUpload(row);
        // Since list is ordered by created_at desc, the first CV encountered for a userId is their latest.
        if (!latestCvByUserId.has(cv.userId)) {
          latestCvByUserId.set(cv.userId, cv);
        }
      });
    }
  }

  return applications
    .map(app => {
      const job = jobsById.get(app.jobId);
      if (!job) return null;

      const applicant = usersById.get(app.userId) ?? null;
      const latestCv = latestCvByUserId.get(app.userId) ?? null;

      return {
        ...app,
        applicantName: applicant?.name ?? null,
        applicantEmail: applicant?.email ?? null,
        applicantProfileImageUrl: applicant?.profileImageUrl ?? null,
        job,
        cvUrl: latestCv?.fileUrl ?? null,
        cvFileName: latestCv?.fileName ?? null,
      };
    })
    .filter((app): app is HrJobApplication => app !== null);
}

export async function getJobApplicationById(
  applicationId: number
): Promise<JobApplication | null> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to fetch job application:", error);
    return null;
  }

  return data ? mapJobApplication(data as DbRow) : null;
}

export async function updateJobApplicationStatus(
  applicationId: number,
  status: "accepted" | "rejected"
): Promise<JobApplication> {
  const supabase = getDatabaseSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to update job application:", error);
    throw error;
  }

  return mapJobApplication(data as DbRow);
}

export async function createSavedJob(saved: InsertSavedJob): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("saved_jobs").insert({
    user_id: saved.userId,
    job_id: saved.jobId,
  });

  if (error) {
    console.error("[Supabase] Failed to save job:", error);
    throw error;
  }
}

export async function deleteSavedJob(
  userId: number,
  jobId: number
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) {
    console.error("[Supabase] Failed to unsave job:", error);
    throw error;
  }
}

export async function getUserSavedJobs(userId: number): Promise<SavedJob[]> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[Supabase] Failed to fetch saved jobs:", error);
    return [];
  }

  return (data ?? []).map(row => mapSavedJob(row as DbRow));
}

export async function createJob(
  job: Omit<Job, "id" | "createdAt">
): Promise<Job> {
  const supabase = getDatabaseSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      level: job.level,
      description: job.description,
      skills: job.skills,
      salary: job.salary,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to create job:", error);
    throw error;
  }

  return mapJob(data as DbRow);
}

export async function deleteJob(id: number): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  await supabase.from("job_images").delete().eq("job_id", id);
  await supabase.from("job_applications").delete().eq("job_id", id);
  await supabase.from("saved_jobs").delete().eq("job_id", id);

  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] Failed to delete job:", error);
    throw error;
  }
}

export async function updateJob(
  id: number,
  job: Omit<Job, "id" | "createdAt">
): Promise<Job> {
  const supabase = getDatabaseSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("jobs")
    .update({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      level: job.level,
      description: job.description,
      skills: job.skills,
      salary: job.salary,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to update job:", error);
    throw error;
  }

  return mapJob(data as DbRow);
}

export async function replaceJobImages(
  jobId: number,
  imageUrls: string[]
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error: deleteError } = await supabase
    .from("job_images")
    .delete()
    .eq("job_id", jobId);

  if (deleteError) {
    console.error("[Supabase] Failed to replace job images:", deleteError);
    throw deleteError;
  }

  const rows = imageUrls
    .map(url => url.trim())
    .filter(Boolean)
    .map((imageUrl, index) => ({
      job_id: jobId,
      image_url: imageUrl,
      is_primary: index === 0,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("job_images").insert(rows);
  if (error) {
    console.error("[Supabase] Failed to add replacement job images:", error);
    throw error;
  }
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("[Supabase] Failed to update user role:", error);
    throw error;
  }
}

export async function updateAdminUser(
  userId: number,
  user: Pick<User, "name" | "email" | "role" | "profileImageUrl">
): Promise<User> {
  const supabase = getDatabaseSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("users")
    .update({
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image_url: user.profileImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to update user:", error);
    throw error;
  }

  return mapUser(data as DbRow);
}

export async function deleteUser(userId: number): Promise<void> {
  const supabase = getDatabaseSupabase();
  if (!supabase) return;

  await supabase.from("cv_uploads").delete().eq("user_id", userId);
  await supabase.from("job_applications").delete().eq("user_id", userId);
  await supabase.from("saved_jobs").delete().eq("user_id", userId);
  await supabase.from("hr_users").delete().eq("user_id", userId);

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    console.error("[Supabase] Failed to delete user:", error);
    throw error;
  }
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const emptySnapshot: AdminDashboardSnapshot = {
    refreshedAt: new Date().toISOString(),
    totalUsers: 0,
    activeUsers: 0,
    totalCvUploads: 0,
    totalJobs: 0,
    totalAdmins: 0,
    recentUsers: [],
    recentJobs: [],
    recentUploads: [],
  };

  const supabase = getDatabaseSupabase();
  if (!supabase) return emptySnapshot;

  const countRows = async (
    tableName: string,
    configure?: (query: any) => any
  ) => {
    const baseQuery = supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });
    const query = configure ? configure(baseQuery) : baseQuery;
    const { count, error } = await query;

    if (error) {
      console.error(`[Supabase] Failed to count ${tableName}:`, error);
      return 0;
    }

    return count ?? 0;
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    totalCvUploads,
    totalJobs,
    totalAdmins,
    recentUsersResult,
    recentJobsResult,
    recentUploadsResult,
  ] = await Promise.all([
    countRows("users"),
    countRows("users", query =>
      query.gte("last_signed_in", thirtyDaysAgo.toISOString())
    ),
    countRows("cv_uploads"),
    countRows("jobs"),
    countRows("users", query => query.eq("role", "admin")),
    supabase
      .from("users")
      .select("*")
      .order("last_signed_in", { ascending: false })
      .limit(5),
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("cv_uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (recentUsersResult.error) {
    console.error(
      "[Supabase] Failed to fetch recent users:",
      recentUsersResult.error
    );
  }
  if (recentJobsResult.error) {
    console.error(
      "[Supabase] Failed to fetch recent jobs:",
      recentJobsResult.error
    );
  }
  if (recentUploadsResult.error) {
    console.error(
      "[Supabase] Failed to fetch recent CV uploads:",
      recentUploadsResult.error
    );
  }

  const recentUsers = ((recentUsersResult.data ?? []) as DbRow[]).map(row =>
    mapUser(row)
  );
  const recentJobs = ((recentJobsResult.data ?? []) as DbRow[]).map(row =>
    mapJob(row)
  );
  const recentUploads = ((recentUploadsResult.data ?? []) as DbRow[]).map(row =>
    mapCvUpload(row)
  );
  const jobIds = recentJobs.map(job => job.id);
  const userIds = recentUsers.map(user => user.id);
  const uploadUserIds = recentUploads.map(upload => upload.userId);
  const visibleUserIds = Array.from(new Set([...userIds, ...uploadUserIds]));

  let cvUploadCounts = new Map<number, number>();
  let usersById = new Map<number, User>();
  let imagesByJobId = new Map<number, JobImage[]>();

  if (visibleUserIds.length > 0 || jobIds.length > 0) {
    const [userUploadsResult, uploadUsersResult, jobImagesResult] =
      await Promise.all([
        visibleUserIds.length > 0
          ? supabase
              .from("cv_uploads")
              .select("user_id")
              .in("user_id", visibleUserIds)
          : Promise.resolve({ data: [], error: null }),
        visibleUserIds.length > 0
          ? supabase.from("users").select("*").in("id", visibleUserIds)
          : Promise.resolve({ data: [], error: null }),
        jobIds.length > 0
          ? supabase
              .from("job_images")
              .select("*")
              .in("job_id", jobIds)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (userUploadsResult.error) {
      console.error(
        "[Supabase] Failed to fetch CV upload counts:",
        userUploadsResult.error
      );
    } else {
      cvUploadCounts = ((userUploadsResult.data ?? []) as DbRow[]).reduce(
        (counts, row) => {
          const userId = asNumber(row.user_id);
          counts.set(userId, (counts.get(userId) ?? 0) + 1);
          return counts;
        },
        new Map<number, number>()
      );
    }

    if (uploadUsersResult.error) {
      console.error(
        "[Supabase] Failed to fetch upload users:",
        uploadUsersResult.error
      );
    } else {
      usersById = ((uploadUsersResult.data ?? []) as DbRow[]).reduce(
        (users, row) => {
          const user = mapUser(row);
          users.set(user.id, user);
          return users;
        },
        new Map<number, User>()
      );
    }

    if (jobImagesResult.error) {
      console.error(
        "[Supabase] Failed to fetch job images:",
        jobImagesResult.error
      );
    } else {
      imagesByJobId = ((jobImagesResult.data ?? []) as DbRow[]).reduce(
        (images, row) => {
          const image = mapJobImage(row);
          const jobImages = images.get(image.jobId) ?? [];
          jobImages.push(image);
          images.set(image.jobId, jobImages);
          return images;
        },
        new Map<number, JobImage[]>()
      );
    }
  }

  return {
    refreshedAt: new Date().toISOString(),
    totalUsers,
    activeUsers,
    totalCvUploads,
    totalJobs,
    totalAdmins,
    recentUsers: recentUsers.map(user => ({
      ...user,
      cvUploads: cvUploadCounts.get(user.id) ?? 0,
    })),
    recentJobs: recentJobs.map(job => {
      const images = imagesByJobId.get(job.id) ?? [];
      const primaryImage = images.find(image => image.isPrimary) ?? images[0];
      return {
        ...job,
        coverImage: primaryImage?.imageUrl ?? null,
        images,
      };
    }),
    recentUploads: recentUploads.map(upload => {
      const uploadUser = usersById.get(upload.userId) ?? null;
      return {
        ...upload,
        userName: uploadUser?.name ?? null,
        userEmail: uploadUser?.email ?? null,
      };
    }),
  };
}
