import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { updateProfileSchema } from "~/components/features/profile/form/profile";

export const profileRouter = createTRPCRouter({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
    return user;
  }),

  updateMyProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const existing = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, password: true },
      });

      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });

      if (input.username !== existing.username) {
        const usernameTaken = await ctx.db.user.findFirst({
          where: { username: input.username },
          select: { id: true },
        });

        if (usernameTaken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username sudah digunakan, coba yang lain.",
          });
        }
      }

      const wantsChangePassword =
        !!input.newPassword || !!input.confirmNewPassword || !!input.currentPassword;

      let nextPassword: string | undefined = undefined;

      if (wantsChangePassword) {
        const ok = input.currentPassword == existing.password;

        if (!ok) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password lama salah.",
          });
        }

        nextPassword = input.newPassword!;
      }

      const updated = await ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          username: input.username,
          ...(nextPassword ? { password: nextPassword } : {}),
        },
        select: {
          id: true,
          name: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updated;
    }),
});
