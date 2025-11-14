import z from "zod";
import bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { passwordSchema, usernameSchema } from "~/schemas/auth";

export const authRouter = createTRPCRouter({
  authMe: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: { token: input.token, tokenExpiresAt: { gt: new Date() } },
      });

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  login: publicProcedure
    .input(z.object({ username: usernameSchema, password: passwordSchema }))
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;

      const user = await ctx.db.user.findFirst({ where: { username } });

      if (!user || !(await bcrypt.compare(password!, user.password ?? ""))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Username atau password salah!",
        });
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

      await ctx.db.user.update({
        where: { id: user.id },
        data: { token, tokenExpiresAt: expiresAt },
      });

      const { password: _, ...userWithoutPassword } = user;
      return { token, user: userWithoutPassword };
    }),

  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Clear token in DB for the token provided by client
      const user = await ctx.db.user.findFirst({
        where: { token: input.token },
      });
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.db.user.update({
        where: { id: user.id },
        data: { token: null, tokenExpiresAt: null },
      });

      return { success: true };
    }),
});
