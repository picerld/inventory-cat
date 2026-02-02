import z from "zod";

export const purchaseAccessoriesFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  purchaseNo: z.string().min(1, "Nomor pembelian wajib diisi"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  receivedNote: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  items: z
    .array(
      z.object({
        accessoryId: z.string().min(1, "Accessory wajib dipilih"),
        qty: z.union([z.string(), z.number()]),
        unitPrice: z.union([z.string(), z.number()]),
      }),
    )
    .min(1, "Minimal pilih 1 accessories"),
});

export type PurchaseAccessoriesFormInput = z.infer<
  typeof purchaseAccessoriesFormSchema
>;
