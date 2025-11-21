import z from "zod";

export const semiFinishedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z
    .string({
      message: "Nama Barang Setengah Jadi harus diisi!",
    })
    .min(1, "Nama Barang Setengah Jadi harus lebih dari 1 karakter")
    .max(50, "Nama Barang Setengah Jadi harus kurang dari 50 karakter"),
  qty: z.number().min(1, "Kuantitas minimal 1"),
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string(),
        qty: z.number().min(1, "Kuantitas minimal 1"),
      }),
    )
    .min(1, "Minimal harus memilih 1 bahan baku"),
});

export type SemiFinishedGoodFormSchema = z.infer<
  typeof semiFinishedGoodFormSchema
>;
