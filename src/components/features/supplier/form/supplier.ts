import z from "zod";

export const supplierFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      message: "Supplier name is required",
    })
    .min(1, "Supplier name is required")
    .max(50, "Supplier name must be less than 50 characters"),
  description: z.string().optional(),
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;
