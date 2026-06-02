/**
 * storage.ts — Supabase S3-compatible storage via AWS SDK v3
 *
 * Endpoint:  https://<project>.storage.supabase.co/storage/v1/s3
 * Public URL: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>
 *
 * The bucket ("images") must have its visibility set in Supabase dashboard:
 *  - Public  → storagePut returns a permanent public URL (no expiry, no auth needed)
 *  - Private → storagePut returns /storage-proxy/<key>; storageGetSignedUrl generates
 *              a 1-hour presigned GET URL via the AWS SDK
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_client) return _client;

  if (!ENV.s3AccessKeyId || !ENV.s3SecretAccessKey || !ENV.s3Endpoint) {
    throw new Error(
      "Supabase S3 config missing. Check S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT in your .env file."
    );
  }

  _client = new S3Client({
    region: ENV.s3Region,
    endpoint: ENV.s3Endpoint,
    credentials: {
      accessKeyId: ENV.s3AccessKeyId,
      secretAccessKey: ENV.s3SecretAccessKey,
    },
    forcePathStyle: true, // Required for S3-compatible endpoints
  });

  return _client;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function encodeKeyPath(key: string): string {
  return key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
}

function decodeKeyPath(key: string): string {
  return key
    .split("/")
    .map(segment => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/**
 * Permanent public URL for a file in a public Supabase bucket.
 * Works without authentication and never expires.
 * Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>
 */
function publicUrlForBucket(bucket: string, key: string): string {
  const projectBase = ENV.s3Endpoint.replace(/\/storage\/v1\/s3\/?$/, "").replace(
    ".storage.supabase.co",
    ".supabase.co"
  );
  return `${projectBase}/storage/v1/object/public/${bucket}/${key}`;
}

/**
 * Permanent public URL for a file in a public Supabase bucket.
 * Works without authentication and never expires.
 * Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>
 */
function publicUrl(key: string): string {
  return publicUrlForBucket(ENV.s3Bucket, key);
}

/**
 * Internal proxy path — used as a fallback when public URL is not available.
 * The Next.js route at /storage-proxy/[...key] will redirect to a signed URL.
 */
function proxyPath(key: string): string {
  return `/storage-proxy/${encodeKeyPath(key)}`;
}

export function storageProxyPath(relKey: string): string {
  return proxyPath(normalizeKey(relKey));
}

export function storageUrlToProxyPath(
  value: string | null | undefined,
  bucket = ENV.s3Bucket
): string | null {
  const rawValue = value?.trim();
  if (!rawValue) return null;

  const isSupabaseObjectUrl = rawValue.includes("/storage/v1/object/");
  if (
    rawValue.startsWith("data:") ||
    rawValue.startsWith("blob:") ||
    ((rawValue.startsWith("http://") || rawValue.startsWith("https://")) &&
      !isSupabaseObjectUrl)
  ) {
    return rawValue;
  }

  try {
    const url = new URL(rawValue, "http://app.local");
    const path = url.pathname;
    const proxyPrefixes = ["/storage-proxy/", "/manus-storage/"];

    for (const prefix of proxyPrefixes) {
      if (path.startsWith(prefix)) {
        return storageProxyPath(decodeKeyPath(path.slice(prefix.length)));
      }
    }

    const publicPrefix = `/storage/v1/object/public/${bucket}/`;
    const signedPrefix = `/storage/v1/object/sign/${bucket}/`;

    if (path.startsWith(publicPrefix)) {
      return storageProxyPath(decodeKeyPath(path.slice(publicPrefix.length)));
    }

    if (path.startsWith(signedPrefix)) {
      return storageProxyPath(decodeKeyPath(path.slice(signedPrefix.length)));
    }
  } catch {
    // Treat non-URL values as possible raw storage keys below.
  }

  if (
    rawValue.startsWith("job-images/") ||
    rawValue.startsWith("post-images/") ||
    rawValue.startsWith("profile-images/")
  ) {
    return storageProxyPath(rawValue);
  }

  return rawValue;
}

// ---------------------------------------------------------------------------
// Public API (matches the original interface expected by routers.ts)
// ---------------------------------------------------------------------------

/**
 * Upload a file to Supabase S3 storage.
 * Returns { key, url } where url is the permanent public URL of the object.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const key = appendHashSuffix(normalizeKey(relKey));

  const body =
    typeof data === "string"
      ? Buffer.from(data, "utf-8")
      : Buffer.from(data as Uint8Array);

  const command = new PutObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);

  const url = storageProxyPath(key);
  console.log(`[Storage] Uploaded → ${url}`);

  return { key, url };
}

/**
 * Upload a CV file to the Supabase S3 cvs storage bucket.
 * Returns { key, url } where url is the permanent public URL of the object.
 */
export async function storagePutCv(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const key = appendHashSuffix(normalizeKey(relKey));

  const body =
    typeof data === "string"
      ? Buffer.from(data, "utf-8")
      : Buffer.from(data as Uint8Array);

  const command = new PutObjectCommand({
    Bucket: ENV.s3CvBucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);

  const url = publicUrlForBucket(ENV.s3CvBucket, key);
  console.log(`[Storage CV] Uploaded → ${url}`);

  return { key, url };
}


/**
 * Return the logical paths for a stored key (no network call).
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(key) };
}

/**
 * Generate a short-lived presigned GET URL for a private object.
 * Expires in 1 hour (3600 seconds).
 */
export async function storageGetSignedUrl(
  relKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: ENV.s3Bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

/**
 * Check whether a key exists in the bucket (HEAD request — no download).
 */
export async function storageExists(relKey: string): Promise<boolean> {
  const s3 = getS3Client();
  const key = normalizeKey(relKey);

  try {
    await s3.send(new HeadObjectCommand({ Bucket: ENV.s3Bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
