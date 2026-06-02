import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

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

type DbRow = Record<string, unknown>;

let _supabase: SupabaseClient | null | undefined;

export function getSupabase() {
  if (_supabase !== undefined) return _supabase;

  if (!ENV.supabaseUrl || !ENV.supabaseKey) {
    console.warn("[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
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

function mapUser(row: DbRow): User {
  return {
    id: asNumber(row.id),
    openId: asString(row.open_id),
    name: asNullableString(row.name),
    email: asNullableString(row.email),
    loginMethod: asNullableString(row.login_method),
    role: asString(row.role, "user"),
    lastSignedIn: asNullableString(row.last_signed_in),
    createdAt: asNullableString(row.created_at),
    updatedAt: asNullableString(row.updated_at),
    profileImageUrl: asNullableString(row.profile_image_url),
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

  const supabase = getSupabase();
  if (!supabase) return;

  const now = new Date().toISOString();
  const row: Record<string, any> = {
    open_id: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    login_method: user.loginMethod ?? null,
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    last_signed_in: normalizeDate(user.lastSignedIn) ?? now,
    updated_at: now,
  };

  if (user.profileImageUrl !== undefined) {
    row.profile_image_url = user.profileImageUrl;
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
  const supabase = getSupabase();
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

export async function getJobs(search?: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

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
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] Failed to fetch jobs:", error);
    return [];
  }

  return (data ?? []).map((row) => mapJob(row as DbRow));
}

export async function getAllJobs() {
  return getJobs();
}

export async function getJobById(id: number): Promise<Job | null> {
  const supabase = getSupabase();
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

export async function createCvUpload(data: InsertCvUpload) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("cv_uploads").insert({
    user_id: data.userId,
    file_name: data.fileName,
    file_key: data.fileKey,
    file_url: data.fileUrl,
    mime_type: data.mimeType,
    file_size: data.fileSize,
  });

  if (error) {
    console.error("[Supabase] Failed to create CV upload:", error);
    throw error;
  }
}

export async function getUserCvUploads(userId: number) {
  const supabase = getSupabase();
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

  return (data ?? []).map((row) => mapCvUpload(row as DbRow));
}

// ---------------------------------------------------------------------------
// Extended Feature Types & Mappers
// ---------------------------------------------------------------------------

export type JobImage = {
  id: number;
  jobId: number;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string | null;
};

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
    imageUrl: asString(row.image_url),
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
  const supabase = getSupabase();
  if (!supabase) return;

  const rows = images.map((img) => ({
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
  const supabase = getSupabase();
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

  return (data ?? []).map((row) => mapJobImage(row as DbRow));
}

export async function upsertHrUser(hr: InsertHrUser): Promise<void> {
  const supabase = getSupabase();
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

export async function getHrUserByUserId(userId: number): Promise<HrUser | null> {
  const supabase = getSupabase();
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

export async function createJobApplication(app: InsertJobApplication): Promise<void> {
  const supabase = getSupabase();
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

export async function deleteJobApplication(userId: number, jobId: number): Promise<void> {
  const supabase = getSupabase();
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

export async function getUserApplications(userId: number): Promise<JobApplication[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[Supabase] Failed to fetch user applications:", error);
    return [];
  }

  return (data ?? []).map((row) => mapJobApplication(row as DbRow));
}

export async function createSavedJob(saved: InsertSavedJob): Promise<void> {
  const supabase = getSupabase();
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

export async function deleteSavedJob(userId: number, jobId: number): Promise<void> {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[Supabase] Failed to fetch saved jobs:", error);
    return [];
  }

  return (data ?? []).map((row) => mapSavedJob(row as DbRow));
}

export async function createJob(job: Omit<Job, "id" | "createdAt">): Promise<Job> {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] Failed to delete job:", error);
    throw error;
  }
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const supabase = getSupabase();
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
