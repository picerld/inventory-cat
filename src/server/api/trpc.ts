import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { parse } from "cookie";
import { db } from "~/server/db";
import { generateToken, isTokenExpired, refreshTokenCookie } from "~/utils/auth";

export const createTRPCContext = async ({ req, res }: CreateNextContextOptions) => {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies["auth.token"] ?? null;

  let user = null;

  if (token) {
    user = await db.user.findFirst({
      where: { token, tokenExpiresAt: { gt: new Date() } },
    });

    if (user && isTokenExpired(user.tokenExpiresAt ?? new Date(), 1)) {
      const newToken = await generateToken(user.id);
      refreshTokenCookie(res, newToken);
      user = await db.user.findFirst({ where: { id: user.id } });
    }
  }

  // Auto-clear invalid cookie
  if (!user && token) {
    res.setHeader("Set-Cookie", "auth.token=; Max-Age=0; Path=/; SameSite=Lax");
  }

  return { db, user, res };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware
const timingMiddleware = t.middleware(async ({ next }) => {
  return next();
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  const ADMIN_ID = process.env.ADMIN_USER_ID;
  if (!ctx.user || ctx.user.id !== ADMIN_ID) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admins only" });
  }
  return next();
});

// Exports
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(timingMiddleware).use(authMiddleware);
export const adminProcedure = t.procedure.use(timingMiddleware).use(authMiddleware).use(adminMiddleware);
export const createCallerFactory = t.createCallerFactory;
