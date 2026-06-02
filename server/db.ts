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
};

export type InsertUser = {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string | null;
  lastSignedIn?: Date | string | null;
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

function getSupabase() {
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
  const row = {
    open_id: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    login_method: user.loginMethod ?? null,
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    last_signed_in: normalizeDate(user.lastSignedIn) ?? now,
    updated_at: now,
  };

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
