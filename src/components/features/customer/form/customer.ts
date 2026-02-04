import z from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const customerUpdateSchema = customerCreateSchema.extend({
  id: z.string().min(1),
});

export const customerFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});