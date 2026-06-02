import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import {
  ADMIN_EMAIL,
  ADMIN_OPEN_ID,
  isAdminCredentials,
} from "../../../../../server/adminAuth";
import * as db from "../../../../../server/db";
import { sdk } from "../../../../../server/_core/sdk";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "Invalid admin credentials" },
      { status: 401 }
    );
  }

  try {
    await db.upsertUser({
      openId: ADMIN_OPEN_ID,
      name: "Admin",
      email: ADMIN_EMAIL,
      loginMethod: "password",
      role: "admin",
      lastSignedIn: new Date(),
    });
  } catch (error) {
    console.warn(
      "[Admin] Could not persist admin user; using session fallback",
      error
    );
  }

  const sessionToken = await sdk.createSessionToken(ADMIN_OPEN_ID, {
    name: "Admin",
    expiresInMs: ONE_YEAR_MS,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: Math.floor(ONE_YEAR_MS / 1000),
  });

  return response;
}
