import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL, ADMIN_OPEN_ID } from "./adminAuth";
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

export type AdminDashboardSnapshot = {
  refreshedAt: string;
  totalUsers: number;
  activeUsers: number;
  totalCvUploads: number;
  totalJobs: number;
  totalAdmins: number;
  recentUsers: Array<User & { cvUploads: number }>;
  recentJobs: Job[];
  recentUploads: Array<
    CvUpload & {
      userName: string | null;
      userEmail: string | null;
    }
  >;
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
    } satisfies User;
  }

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

  const supabase = getSupabase();
  if (!supabase) return emptySnapshot;

  const countRows = async (
    tableName: string,
    configure?: (query: any) => any,
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
    countRows("users", (query) =>
      query.gte("last_signed_in", thirtyDaysAgo.toISOString()),
    ),
    countRows("cv_uploads"),
    countRows("jobs"),
    countRows("users", (query) => query.eq("role", "admin")),
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
    console.error("[Supabase] Failed to fetch recent users:", recentUsersResult.error);
  }
  if (recentJobsResult.error) {
    console.error("[Supabase] Failed to fetch recent jobs:", recentJobsResult.error);
  }
  if (recentUploadsResult.error) {
    console.error("[Supabase] Failed to fetch recent CV uploads:", recentUploadsResult.error);
  }

  const recentUsers = ((recentUsersResult.data ?? []) as DbRow[]).map((row) => mapUser(row));
  const recentJobs = ((recentJobsResult.data ?? []) as DbRow[]).map((row) => mapJob(row));
  const recentUploads = ((recentUploadsResult.data ?? []) as DbRow[]).map((row) => mapCvUpload(row));
  const userIds = recentUsers.map((user) => user.id);
  const uploadUserIds = recentUploads.map((upload) => upload.userId);
  const visibleUserIds = Array.from(new Set([...userIds, ...uploadUserIds]));

  let cvUploadCounts = new Map<number, number>();
  let usersById = new Map<number, User>();

  if (visibleUserIds.length > 0) {
    const [userUploadsResult, uploadUsersResult] = await Promise.all([
      supabase
        .from("cv_uploads")
        .select("user_id")
        .in("user_id", visibleUserIds),
      supabase
        .from("users")
        .select("*")
        .in("id", visibleUserIds),
    ]);

    if (userUploadsResult.error) {
      console.error("[Supabase] Failed to fetch CV upload counts:", userUploadsResult.error);
    } else {
      cvUploadCounts = ((userUploadsResult.data ?? []) as DbRow[]).reduce((counts, row) => {
        const userId = asNumber(row.user_id);
        counts.set(userId, (counts.get(userId) ?? 0) + 1);
        return counts;
      }, new Map<number, number>());
    }

    if (uploadUsersResult.error) {
      console.error("[Supabase] Failed to fetch upload users:", uploadUsersResult.error);
    } else {
      usersById = ((uploadUsersResult.data ?? []) as DbRow[]).reduce((users, row) => {
        const user = mapUser(row);
        users.set(user.id, user);
        return users;
      }, new Map<number, User>());
    }
  }

  return {
    refreshedAt: new Date().toISOString(),
    totalUsers,
    activeUsers,
    totalCvUploads,
    totalJobs,
    totalAdmins,
    recentUsers: recentUsers.map((user) => ({
      ...user,
      cvUploads: cvUploadCounts.get(user.id) ?? 0,
    })),
    recentJobs,
    recentUploads: recentUploads.map((upload) => {
      const uploadUser = usersById.get(upload.userId) ?? null;
      return {
        ...upload,
        userName: uploadUser?.name ?? null,
        userEmail: uploadUser?.email ?? null,
      };
    }),
  };
}
