import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { db } from "~/server/db";
import { verifyToken } from "~/server/auth/jwt";

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;
  const token = req.cookies["auth.token"] ?? null;

  if (!token) return { req, res, db, user: null };

  // 1) verify JWT signature & expiry
  const payload = await verifyToken(token);

  if (!payload) {
    // optional: clear cookie
    try {
      res.setHeader("Set-Cookie", "auth.token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
    } catch {}
    return { req, res, db, user: null };
  }

  // obtain user id from payload
  const userId = payload.sub ?? payload.id ?? payload.userId;

  if (!userId) return { req, res, db, user: null };

  // 2) check DB token and expiry
  const user = await db.user.findUnique({
    where: { id: String(userId) },
  });

  if (!user) {
    try {
      res.setHeader("Set-Cookie", "auth.token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
    } catch {}
    return { req, res, db, user: null };
  }

  if (!user.token || user.token !== token || !user.tokenExpiresAt || user.tokenExpiresAt <= new Date()) {
    try {
      res.setHeader("Set-Cookie", "auth.token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
    } catch {}
    return { req, res, db, user: null };
  }

  // optionally auto-refresh if near expiry (e.g., <2 days)
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const daysLeft = (user.tokenExpiresAt.getTime() - Date.now()) / MS_PER_DAY;

  if (daysLeft < 2) {
    // re-issue token (new JWT + DB token + cookie)
    const { signToken } = await import("~/server/auth/jwt");
    const newToken = await signToken({ sub: user.id }, 60 * 60 * 24 * 7);
    const newExpire = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await db.user.update({
      where: { id: user.id },
      data: { token: newToken, tokenExpiresAt: newExpire },
    });

    // set cookie on response
    try {
      res.setHeader(
        "Set-Cookie",
        `auth.token=${newToken}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax;${process.env.NODE_ENV === "production" ? " Secure" : ""}`
      );
    } catch {}
    // update user object for return
    user.token = newToken;
    user.tokenExpiresAt = newExpire;
  }

  const { password: _, ...userSafe } = user;

  return { req, res, db, user: userSafe };
}
