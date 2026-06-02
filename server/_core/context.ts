import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { User } from "../db";
import * as db from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: Request;
  responseHeaders: Headers;
  user: User | null;
};

export type CreateContextOptions = {
  req: Request;
  responseHeaders?: Headers;
};

function getCookie(req: Request, name: string) {
  const header = req.headers.get("cookie") ?? undefined;
  if (!header) return undefined;
  return parseCookieHeader(header)[name];
}

export function expireSessionCookie(ctx: TrpcContext) {
  const isSecure = new URL(ctx.req.url).protocol === "https:";
  const cookie = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");

  ctx.responseHeaders.append(
    "set-cookie",
    cookie,
  );
}

export function setSessionCookie(ctx: TrpcContext, sessionToken: string) {
  const isSecure = new URL(ctx.req.url).protocol === "https:";
  const cookie = [
    `${COOKIE_NAME}=${sessionToken}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(ONE_YEAR_MS / 1000)}`,
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");

  ctx.responseHeaders.append(
    "set-cookie",
    cookie,
  );
}

export async function createContext({
  req,
  responseHeaders = new Headers(),
}: CreateContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const sessionCookie = getCookie(req, COOKIE_NAME);
    const session = await sdk.verifySession(sessionCookie);

    if (session) {
      user = (await db.getUserByOpenId(session.openId)) ?? null;
    }
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req,
    responseHeaders,
    user,
  };
}
