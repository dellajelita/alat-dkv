import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const COOKIE_NAME = "alatdkv_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 jam

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Variabel lingkungan SESSION_SECRET belum diatur atau terlalu pendek.",
    );
  }
  return secret;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Variabel lingkungan ADMIN_PASSWORD belum diatur.");
  }
  return password;
}

function safeEqualText(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword) return false;
  return safeEqualText(inputPassword, getAdminPassword());
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  });
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPayload(encodedPayload);
  if (!safeEqualText(signature, expectedSignature)) {
    return false;
  }

  try {
    const raw = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { role?: string; exp?: number };
    if (parsed.role !== "admin" || typeof parsed.exp !== "number") {
      return false;
    }
    await connection();
    const nowSec = Math.floor(Date.now() / 1000);
    return parsed.exp > nowSec;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return await verifySessionToken(token);
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = createSessionToken();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
