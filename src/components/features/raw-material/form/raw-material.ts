import z from "zod";

export const rawMaterialFormSchema = z.object({
  id: z.string().optional(),
  supplierId: z
    .string({
      message: "Supplier harus dipilih!",
    })
    .min(1, "Supplier harus dipilih!"),
  userId: z.string(),
  name: z
    .string({
      message: "Nama Bahan Baku harus diisi!",
    })
    .min(1, "Bahan Baku harus lebih dari 1 karakter")
    .max(50, "Bahan Baku harus kurang dari 50 karakter"),
  qty: z.coerce.number().positive("Qty must be greater than 0"),
  materialType: z
    .string({
      message: "Jenis barang baku harus diisi!",
    })
    .min(1, "Jenis barang baku harus diisi!"),
  supplierPrice: z
    .number({
      message: "Harga dari supplier harus diisi!",
    })
    .min(1, "Harga dari supplier tidak boleh nol!"),
});

export type RawMaterialFormSchema = z.infer<typeof rawMaterialFormSchema>;
