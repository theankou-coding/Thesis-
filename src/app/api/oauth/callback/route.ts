import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../../../../../server/db";
import { sdk } from "../../../../../server/_core/sdk";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "code and state are required" }, { status: 400 });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      return NextResponse.json({ error: "openId missing from user info" }, { status: 400 });
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: Math.floor(ONE_YEAR_MS / 1000),
    });

    return response;
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    return NextResponse.json({ error: "OAuth callback failed" }, { status: 500 });
  }
}
