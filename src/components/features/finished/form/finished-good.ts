import z from "zod";

export const finishedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paintGradeId: z.string({
    message: "Grade harus dipilih!",
  }).min(1, "Grade harus dipilih!"),
  name: z
    .string({
      message: "Nama Barang Jadi harus diisi!",
    })
    .min(1, "Nama Barang Jadi harus lebih dari 1 karakter")
    .max(50, "Nama Barang Jadi harus kurang dari 50 karakter"),
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
  dateProduced: z.date().optional(),
  sourceType: z.enum(["raw_material", "semi_finished"], {
    message: "Tipe sumber harus dipilih!",
  }),
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string(),
        qty: z.number().min(1, "Kuantitas minimal 1"),
      }),
    )
    .optional(),
  semiFinishedGoods: z
    .array(
      z.object({
        semiFinishedGoodId: z.string(),
        qty: z.number().min(1, "Kuantitas minimal 1"),
      }),
    )
    .optional(),
}).refine(
  (data) => {
    if (data.sourceType === "raw_material") {
      return data.materials && data.materials.length > 0;
    }
    if (data.sourceType === "semi_finished") {
      return data.semiFinishedGoods && data.semiFinishedGoods.length > 0;
    }
    return false;
  },
  {
    message: "Minimal harus memilih 1 item berdasarkan tipe sumber yang dipilih",
    path: ["sourceType"],
  }
);

export type FinishedGoodFormSchema = z.infer<typeof finishedGoodFormSchema>;
