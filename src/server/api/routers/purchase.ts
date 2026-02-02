import z from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { purchaseRawMaterialFormSchema } from "~/components/features/purchases/raw-material/form/purchase-raw-material";
import { purchaseAccessoriesFormSchema } from "~/components/features/purchases/accessories/form/purchase-accessories";

const purchaseStatusEnum = z.enum(["DRAFT", "ONGOING", "FINISHED", "CANCELED"]);
type PurchaseStatus = z.infer<typeof purchaseStatusEnum>;

export const purchaseRouter = createTRPCRouter({
  getRawMaterialPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(4),
        search: z.string().optional().default(""),
        status: purchaseStatusEnum.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status } = input;

      const where: Prisma.PurchaseWhereInput = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { purchaseNo: { contains: search, mode: "insensitive" } },
                { receivedNote: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  supplier: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        items: { some: { itemType: "RAW_MATERIAL" } },
      };

      const totalItems = await ctx.db.purchase.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.purchase.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { purchasedAt: "desc" },
        include: {
          supplier: true,
          user: true,
          items: {
            where: { itemType: "RAW_MATERIAL" },
            include: { rawMaterial: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const mapped = data.map((p) => {
        const totalAmount = p.items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );
        const totalQty = p.items.reduce((sum, it) => sum + Number(it.qty), 0);
        const totalItemsLine = p.items.length;

        return {
          ...p,
          summary: {
            totalAmount,
            totalQty,
            totalItemsLine,
          },
        };
      });

      return {
        data: mapped,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getAccessoriesPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(10),
        search: z.string().optional().default(""),
        status: purchaseStatusEnum.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status } = input;

      const where: Prisma.PurchaseWhereInput = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { purchaseNo: { contains: search, mode: "insensitive" } },
                { receivedNote: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  supplier: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        items: { some: { itemType: "PAINT_ACCESSORIES" } },
      };

      const totalItems = await ctx.db.purchase.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.purchase.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { purchasedAt: "desc" },
        include: {
          supplier: true,
          user: true,
          items: {
            where: { itemType: "PAINT_ACCESSORIES" },
            include: { accessory: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const mapped = data.map((p) => {
        const totalAmount = p.items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );
        const totalQty = p.items.reduce((sum, it) => sum + Number(it.qty), 0);
        const totalItemsLine = p.items.length;

        return { ...p, summary: { totalAmount, totalQty, totalItemsLine } };
      });

      return {
        data: mapped,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
        status: purchaseStatusEnum.optional(),
        supplierId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, supplierId } = input;

      const where: Prisma.PurchaseWhereInput = {
        ...(search
          ? {
              OR: [
                { purchaseNo: { contains: search, mode: "insensitive" } },
                { receivedNote: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  supplier: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
        ...(supplierId ? { supplierId } : {}),
      };

      const totalItems = await ctx.db.purchase.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.purchase.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          supplier: true,
          user: true,
          items: {
            include: {
              rawMaterial: { include: { supplier: true, paintGrade: true } },
              accessory: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.purchase.findMany({
      include: {
        supplier: true,
        user: true,
        items: {
          include: {
            rawMaterial: { include: { supplier: true } },
            accessory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByIdRawMaterial: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: {
          supplier: true,
          user: true,
          items: {
            where: { itemType: "RAW_MATERIAL" },
            include: { rawMaterial: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!purchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase not found",
        });
      }

      if (purchase.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Purchase ini bukan pembelian bahan baku (RAW_MATERIAL).",
        });
      }

      const totalAmount = purchase.items.reduce(
        (sum, it) => sum + (it.subtotal ?? 0),
        0,
      );
      const totalQty = purchase.items.reduce(
        (sum, it) => sum + Number(it.qty),
        0,
      );

      return { purchase, summary: { totalAmount, totalQty } };
    }),

  getByIdAccessories: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: {
          supplier: true,
          user: true,
          items: {
            where: { itemType: "PAINT_ACCESSORIES" },
            include: { accessory: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!purchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase not found",
        });
      }

      if (purchase.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Purchase ini bukan pembelian accessories (PAINT_ACCESSORIES).",
        });
      }

      const totalAmount = purchase.items.reduce(
        (sum, it) => sum + (it.subtotal ?? 0),
        0,
      );
      const totalQty = purchase.items.reduce(
        (sum, it) => sum + Number(it.qty),
        0,
      );

      return { purchase, summary: { totalAmount, totalQty } };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        include: {
          supplier: true,
          user: true,
          items: {
            orderBy: { createdAt: "asc" },
            include: {
              rawMaterial: { include: { supplier: true, paintGrade: true } },
              accessory: true,
            },
          },
        },
      });

      if (!purchase)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase tidak ditemukan",
        });
      return purchase;
    }),

  create: protectedProcedure
    .input(purchaseRawMaterialFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      const exists = await ctx.db.purchase.findUnique({
        where: { purchaseNo: input.purchaseNo },
        select: { id: true },
      });
      if (exists)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor pembelian sudah digunakan.",
        });

      if (!input.items || input.items.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 bahan baku.",
        });
      }

      const rawMaterialIds = input.items.map((i) => i.rawMaterialId);
      const rms = await ctx.db.rawMaterial.findMany({
        where: { id: { in: rawMaterialIds } },
        select: { id: true },
      });
      if (rms.length !== rawMaterialIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada bahan baku yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.purchase.create({
        data: {
          purchaseNo: input.purchaseNo,
          supplierId: input.supplierId,
          receivedNote: input.receivedNote ?? null,
          notes: input.notes ?? null,
          status: "DRAFT",
          userId,
          items: {
            create: input.items.map((it) => {
              const qty = Number(it.qty);
              const unitPrice = Number(it.unitPrice);
              return {
                itemType: "RAW_MATERIAL",
                rawMaterialId: it.rawMaterialId,
                accessoryId: null,
                qty,
                unitPrice,
                subtotal: qty * unitPrice,
              };
            }),
          },
        },
        include: { supplier: true, user: true, items: true },
      });
    }),

  createAccessories: protectedProcedure
    .input(purchaseAccessoriesFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      const exists = await ctx.db.purchase.findUnique({
        where: { purchaseNo: input.purchaseNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor pembelian sudah digunakan.",
        });
      }

      if (!input.items || input.items.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 accessories.",
        });
      }

      const accessoryIds = input.items.map((i) => i.accessoryId);
      const accs = await ctx.db.paintAccessories.findMany({
        where: { id: { in: accessoryIds } },
        select: { id: true },
      });
      if (accs.length !== accessoryIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada accessories yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.purchase.create({
        data: {
          purchaseNo: input.purchaseNo,
          supplierId: input.supplierId,
          receivedNote: input.receivedNote ?? null,
          notes: input.notes ?? null,
          status: "DRAFT",
          userId,
          items: {
            create: input.items.map((it) => {
              const qty = Number(it.qty);
              const unitPrice = Number(it.unitPrice);
              return {
                itemType: "PAINT_ACCESSORIES",
                rawMaterialId: null,
                accessoryId: it.accessoryId,
                qty,
                unitPrice,
                subtotal: qty * unitPrice,
              };
            }),
          },
        },
        include: { supplier: true, user: true, items: true },
      });
    }),

  update: protectedProcedure
    .input(purchaseRawMaterialFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID purchase wajib.",
        });

      const existing = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        select: { id: true, status: true },
      });
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase tidak ditemukan",
        });

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya purchase DRAFT yang boleh diedit.",
        });
      }

      if (!input.items || input.items.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 bahan baku.",
        });
      }

      const rawMaterialIds = input.items.map((i) => i.rawMaterialId);
      const rms = await ctx.db.rawMaterial.findMany({
        where: { id: { in: rawMaterialIds } },
        select: { id: true },
      });
      if (rms.length !== rawMaterialIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada bahan baku yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.purchaseItem.deleteMany({ where: { purchaseId: input.id! } });

        return tx.purchase.update({
          where: { id: input.id! },
          data: {
            supplierId: input.supplierId,
            receivedNote: input.receivedNote ?? null,
            notes: input.notes ?? null,
            items: {
              create: input.items.map((it) => {
                const qty = Number(it.qty);
                const unitPrice = Number(it.unitPrice);
                return {
                  itemType: "RAW_MATERIAL",
                  rawMaterialId: it.rawMaterialId,
                  accessoryId: null,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: {
            supplier: true,
            user: true,
            items: {
              include: { rawMaterial: { include: { supplier: true } } },
            },
          },
        });
      });
    }),

  updateAccessories: protectedProcedure
    .input(purchaseAccessoriesFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID purchase wajib.",
        });
      }

      const existing = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        select: { id: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase tidak ditemukan",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya purchase DRAFT yang boleh diedit.",
        });
      }

      if (!input.items || input.items.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 accessories.",
        });
      }

      const accessoryIds = input.items.map((i) => i.accessoryId);

      const accs = await ctx.db.paintAccessories.findMany({
        where: { id: { in: accessoryIds } },
        select: { id: true, supplierId: true },
      });

      if (accs.length !== accessoryIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada accessories yang tidak valid / tidak ditemukan.",
        });
      }

      const mismatch = accs.some((a) => a.supplierId !== input.supplierId);
      if (mismatch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Accessories yang dipilih tidak sesuai dengan supplier yang dipilih.",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.purchaseItem.deleteMany({ where: { purchaseId: input.id! } });

        return tx.purchase.update({
          where: { id: input.id! },
          data: {
            supplierId: input.supplierId,
            receivedNote: input.receivedNote ?? null,
            notes: input.notes ?? null,
            items: {
              create: input.items.map((it) => {
                const qty = Number(it.qty);
                const unitPrice = Number(it.unitPrice);
                return {
                  itemType: "PAINT_ACCESSORIES",
                  rawMaterialId: null,
                  accessoryId: it.accessoryId,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: {
            supplier: true,
            user: true,
            items: { include: { accessory: true } },
          },
        });
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: purchaseStatusEnum,
        notes: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const { id, status, notes } = input;

      return ctx.db.$transaction(async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id },
          include: {
            items: true,
          },
        });

        if (!purchase)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Purchase not found",
          });

        const from = purchase.status as PurchaseStatus;

        if (from === "FINISHED" || from === "CANCELED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Purchase ${from} tidak bisa diubah lagi.`,
          });
        }

        const allowed: Record<PurchaseStatus, PurchaseStatus[]> = {
          DRAFT: ["DRAFT", "ONGOING", "CANCELED"],
          ONGOING: ["ONGOING", "FINISHED", "CANCELED"],
          FINISHED: ["FINISHED"],
          CANCELED: ["CANCELED"],
        };

        if (!allowed[from].includes(status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Transisi status tidak valid: ${from} -> ${status}`,
          });
        }

        if (status === "FINISHED") {
          if (!purchase.items.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Purchase tidak memiliki item.",
            });
          }

          for (const item of purchase.items) {
            if (item.itemType === "RAW_MATERIAL") {
              if (!item.rawMaterialId) continue;

              await tx.rawMaterial.update({
                where: { id: item.rawMaterialId },
                data: { qty: { increment: item.qty } },
              });

              await tx.stockMovement.create({
                data: {
                  type: "PURCHASE_IN",
                  itemType: "RAW_MATERIAL",
                  itemId: item.rawMaterialId,
                  qty: item.qty,
                  refPurchaseId: purchase.id,
                  userId: userId || purchase.userId,
                },
              });
            }

            if (item.itemType === "PAINT_ACCESSORIES") {
              if (!item.accessoryId) continue;

              await tx.paintAccessories.update({
                where: { id: item.accessoryId },
                data: { qty: { increment: item.qty } },
              });

              await tx.stockMovement.create({
                data: {
                  type: "PURCHASE_IN",
                  itemType: "PAINT_ACCESSORIES",
                  itemId: item.accessoryId,
                  qty: item.qty,
                  refPurchaseId: purchase.id,
                  userId: userId || purchase.userId,
                },
              });
            }
          }
        }

        return tx.purchase.update({
          where: { id },
          data: {
            status,
            ...(typeof notes !== "undefined" ? { notes } : {}),
          },
        });
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.id },
        select: { id: true, status: true },
      });

      if (!purchase)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase tidak ditemukan",
        });

      if (purchase.status === "FINISHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Purchase FINISHED tidak bisa dibatalkan.",
        });
      }

      if (purchase.status === "CANCELED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Purchase sudah CANCELED.",
        });
      }

      return ctx.db.purchase.update({
        where: { id: input.id },
        data: { status: "CANCELED" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const purchase = await ctx.db.purchase.findUnique({
          where: { id: input.id },
          select: { status: true },
        });

        if (!purchase)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Purchase tidak ditemukan",
          });
        if (purchase.status !== "DRAFT") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Hanya purchase DRAFT yang bisa dihapus.",
          });
        }

        return await ctx.db.purchase.delete({ where: { id: input.id } });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2003"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tidak dapat menghapus purchase karena masih dipakai relasi lain.",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.purchase.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),
});
