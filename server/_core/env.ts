export const ENV = {
<<<<<<< HEAD
  appId: process.env.NEXT_PUBLIC_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "super-secret-fallback-for-dev-use-proper-one-in-prod",
=======
  appId: process.env.NEXT_PUBLIC_APP_ID ?? "jobcv-next",
  cookieSecret: process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "jobcv-next-dev-secret",
>>>>>>> d468b1cd210411139bf111209d11bdbd4d3525ec
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Supabase S3-compatible storage
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "images",
  s3CvBucket: process.env.S3_CV_BUCKET ?? "cvs",
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3Region: process.env.S3_REGION ?? "ap-southeast-1",
};

