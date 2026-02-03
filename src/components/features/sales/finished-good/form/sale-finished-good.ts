import z from "zod";

export const saleFinishedGoodFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  saleNo: z.string().min(1, "Nomor penjualan wajib"),
  customerId: z.string().min(1, "Customer wajib"),
  orderNo: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        finishedGoodId: z.string().min(1, "Barang jadi wajib"),
        qty: z.union([z.number(), z.string()]),
        unitPrice: z.union([z.number(), z.string()]),
      }),
    )
    .min(1, "Minimal pilih 1 barang jadi"),
});
