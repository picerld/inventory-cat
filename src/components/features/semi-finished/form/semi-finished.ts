import z from "zod";

export const semiFinishedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  paintGradeId: z
    .string({
      message: "Grade harus dipilih!",
    })
    .min(1, "Grade harus dipilih!"),
  name: z
    .string({
      message: "Nama Barang Setengah Jadi harus diisi!",
    })
    .min(1, "Nama Barang Setengah Jadi harus lebih dari 1 karakter")
    .max(50, "Nama Barang Setengah Jadi harus kurang dari 50 karakter"),
  qty: z.coerce
    .number({
      invalid_type_error: "Qty harus berupa angka",
    })
    .positive("Qty harus lebih besar dari 0")
    .finite("Qty harus berupa angka yang valid"),
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string(),
        qty: z.coerce
          .number({
            invalid_type_error: "Qty harus berupa angka",
          })
          .positive("Qty harus lebih besar dari 0")
          .finite("Qty harus berupa angka yang valid"),
      }),
    )
    .min(1, "Minimal 1 bahan baku harus dipilih"),
});

export type SemiFinishedGoodFormSchema = z.infer<
  typeof semiFinishedGoodFormSchema
>;

export const updateQtySchema = z.object({
  id: z.string(),
  userId: z.string(),
  materials: z
    .array(
      z.object({
        rawMaterialId: z.string(),
        qty: z
          .number({
            invalid_type_error: "Qty harus berupa angka",
          })
          .positive("Qty harus lebih besar dari 0")
          .finite("Qty harus berupa angka yang valid"),
      }),
    )
    .min(1, "Minimal 1 bahan baku harus dipilih"),
});

export type UpdateQtySchema = z.infer<typeof updateQtySchema>;
