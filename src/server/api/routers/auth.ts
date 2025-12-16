import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { clearTokenCookie, generateToken, setTokenCookie } from "~/utils/auth";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { username: input.username },
      });

      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }

      const token = await generateToken(user.id);
      setTokenCookie(ctx.res, token);

      const { password, ...safeUser } = user;
      return { token, user: safeUser };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.user!.id },
      data: { token: null, tokenExpiresAt: null },
    });

    clearTokenCookie(ctx.res);
    return { success: true };
  }),

  authMe: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const { password, ...safeUser } = ctx.user;
    return safeUser;
  }),
});
