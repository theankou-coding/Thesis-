import { NextRequest, NextResponse } from "next/server";
import { storageGetSignedUrl } from "../../../../server/storage";

type Params = {
  params: Promise<{ key: string[] }>;
};

/**
 * GET /storage-proxy/[...key]
 *
 * Alias for /manus-storage/[...key].
 * Generates a 1-hour presigned S3 URL and issues a 307 redirect.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { key } = await params;
  const relKey = key.join("/");

  try {
    const signedUrl = await storageGetSignedUrl(relKey, 3600);
    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error("[Storage proxy] Failed to generate signed URL for:", relKey, error);
    return NextResponse.json(
      { error: "Failed to resolve file. It may not exist or the bucket may be misconfigured." },
      { status: 500 }
    );
  }
}
