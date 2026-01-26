import z from "zod";

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmNewPassword: z.string().min(1, "Konfirmasi wajib diisi"),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh huruf/angka/._-"),

    currentPassword: z.string().optional().nullable(),
    newPassword: z.string().optional().nullable(),
    confirmNewPassword: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    const wantsChangePassword =
      !!val.newPassword || !!val.confirmNewPassword || !!val.currentPassword;

    if (!wantsChangePassword) return;

    if (!val.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Password lama wajib diisi untuk mengganti password",
      });
    }

    if (!val.newPassword || val.newPassword.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Password baru minimal 6 karakter",
      });
    }

    if (val.newPassword !== val.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Konfirmasi password tidak sama",
      });
    }
  });

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
