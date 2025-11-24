import z from "zod";

export const accessoriesFormSchema = z.object({
  id: z.string().optional(),
  supplierId: z.string({
    message: "Supplier harus dipilih!",
  }).min(1, "Supplier harus dipilih!"),
  userId: z.string(),
  name: z
    .string({
      message: "Nama Aksesoris harus diisi!",
    })
    .min(1, "Nama Aksesoris harus lebih dari 1 karakter")
    .max(50, "Nama Aksesoris harus kurang dari 50 karakter"),
  qty: z.number({
    message: "Kuantiti harus diisi!",
  }).min(1, "Kuantiti harus diisi"),
  supplierPrice: z.number({
    message: "Harga dari supplier harus diisi!",
  }).min(1, "Harga dari supplier tidak boleh nol!"),
  sellingPrice: z.number({
    message: "Harga jual harus diisi!",
  }).min(1, "Harga jual tidak boleh nol!"),
});

export type AccessoriesFormSchema = z.infer<typeof accessoriesFormSchema>;
