import { NextRequest, NextResponse } from "next/server";
import { storageGetSignedUrl } from "../../../../server/storage";

type Params = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { key } = await params;
  const relKey = key.join("/");

  try {
    const signedUrl = await storageGetSignedUrl(relKey);
    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error("[Storage] Failed to resolve file", error);
    return NextResponse.json({ error: "Failed to resolve file" }, { status: 500 });
  }
}
