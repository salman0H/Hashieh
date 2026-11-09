import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
export const COOKIE = "atlas-session";
const ttl = 60 * 60 * 24 * 7;
export function configured() {
  return !!(
    process.env.SITE_PASSWORD &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32
  );
}
export function localDevelopment() {
  return process.env.NODE_ENV === "development";
}
export function same(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
function signature(value: string) {
  return createHmac(
    "sha256",
    `${process.env.SESSION_SECRET}:${process.env.SITE_PASSWORD}`,
  )
    .update(value)
    .digest("hex");
}
export function issueSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + ttl);
  return `${expiry}.${signature(expiry)}`;
}
export async function authorized() {
  if (localDevelopment()) return true;
  if (!configured()) return false;
  const token = (await cookies()).get(COOKIE)?.value || "";
  const [expiry, sig] = token.split(".");
  return (
    !!expiry &&
    !!sig &&
    /^\d+$/.test(expiry) &&
    Number(expiry) > Date.now() / 1000 &&
    same(sig, signature(expiry))
  );
}

// Next can normalize request.url to its internal hostname behind a proxy.
// Match against the incoming Host instead, while preserving the external scheme.
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get("host") || target.host;
    const scheme =
      request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      target.protocol.replace(":", "");
    return (
      parsed.host === host &&
      parsed.protocol === `${scheme}:` &&
      ["http:", "https:"].includes(parsed.protocol)
    );
  } catch {
    return false;
  }
}
