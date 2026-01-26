import z from "zod";

export const purchaseRawMaterialFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  purchaseNo: z
    .string({ message: "Nomor pembelian harus diisi!" })
    .min(1, "Nomor pembelian harus diisi"),
  supplierId: z
    .string({ message: "Supplier harus dipilih!" })
    .min(1, "Supplier harus dipilih"),
  receivedNote: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  items: z
    .array(
      z.object({
        rawMaterialId: z.string().min(1),
        qty: z.coerce
          .number({ invalid_type_error: "Qty harus berupa angka" })
          .positive("Qty minimal > 0"),
        unitPrice: z.coerce
          .number({ invalid_type_error: "Harga harus berupa angka" })
          .nonnegative("Harga tidak boleh negatif"),
      }),
    )
    .min(1, "Minimal pilih 1 bahan baku"),
});

export type PurchaseRawMaterialFormSchema = z.infer<typeof purchaseRawMaterialFormSchema>;
