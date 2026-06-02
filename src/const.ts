export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const OAUTH_PORTAL_URL = process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL ?? "";
const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "";

// Generate the login URL at runtime so the redirect URI matches the current origin.
export const getLoginUrl = () => {
  if (typeof window === "undefined") return "/login";

  if (!OAUTH_PORTAL_URL || !APP_ID) {
    return "/login";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL.replace(/\/+$/, "")}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
