import { db } from "~/server/db";
import crypto from "crypto";

export async function generateToken(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.user.update({
    where: { id: userId },
    data: { token, tokenExpiresAt: expiresAt },
  });

  return { token, expiresAt };
}

export function setTokenCookie(res: any, tokenObj: { token: string; expiresAt: Date }) {
  res.setHeader("Set-Cookie", [
    `auth.token=${tokenObj.token}; Path=/; HttpOnly; SameSite=Lax; Expires=${tokenObj.expiresAt.toUTCString()}`
  ]);
}

export function refreshTokenCookie(res: any, tokenObj: { token: string; expiresAt: Date }) {
  setTokenCookie(res, tokenObj);
}

export function clearTokenCookie(res: any) {
  res.setHeader("Set-Cookie", `auth.token=; Path=/; Max-Age=0; SameSite=Lax`);
}

export function isTokenExpired(date: Date, daysThreshold = 1) {
  const diff = date.getTime() - Date.now();
  return diff < daysThreshold * 24 * 60 * 60 * 1000;
}
