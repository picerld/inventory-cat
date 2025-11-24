import z from "zod";

export const returnedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  finishedGoodId: z
    .string({
      message: "Barang Setengah Jadi harus dipilih!",
    })
    .min(1, "Barang Setengah Jadi harus dipilih!"),
  qty: z
    .number({
      message: "Jumlah harus diisi!",
    })
    .min(1, "Jumlah harus lebih dari 0!"),
  from: z
    .string({
      message: "Dari harus diisi!",
    })
    .min(1, "Dari harus diisi!"),
  description: z.string().optional(),
});

export type ReturnedGoodFormSchema = z.infer<typeof returnedGoodFormSchema>;
