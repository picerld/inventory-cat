import z from "zod";

export const gradeFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      message: "Grade name is required",
    })
    .min(1, "Grade name is required")
    .max(50, "Grade name must be less than 50 characters"),
  description: z.string().optional(),
});

export type GradeFormSchema = z.infer<typeof gradeFormSchema>;
