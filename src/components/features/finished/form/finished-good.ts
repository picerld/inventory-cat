import z from "zod";

export const finishedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z
    .string({
      message: "Nama Barang Setengah Jadi harus diisi!",
    })
    .min(1, "Nama Barang Setengah Jadi harus lebih dari 1 karakter")
    .max(50, "Nama Barang Setengah Jadi harus kurang dari 50 karakter"),
  productionCode: z
    .string({
      message: "Kode Produksi harus diisi!",
    })
    .min(1, "Kode Produksi harus diisi"),
  qty: z.number().min(1, "Kuantitas minimal 1"),
  batchNumber: z
    .string({
      message: "Nomor Batch harus diisi!",
    })
    .min(1, "Nomor Batch harus diisi"),
  quality: z
    .string({
      message: "Kualitas harus diisi!",
    })
    .min(1, "Kualitas harus diisi"),
  dateProduced: z.date().optional(),
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string(),
        qty: z.number().min(1, "Kuantitas minimal 1"),
      }),
    )
    .min(1, "Minimal harus memilih 1 bahan baku"),
});

export type FinishedGoodFormSchema = z.infer<typeof finishedGoodFormSchema>;
