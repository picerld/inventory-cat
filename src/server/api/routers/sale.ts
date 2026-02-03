import z from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { saleFinishedGoodFormSchema } from "~/components/features/sales/finished-good/form/sale-finished-good";

const saleStatusEnum = z.enum(["DRAFT", "ONGOING", "FINISHED", "CANCELED"]);
type SaleStatus = z.infer<typeof saleStatusEnum>;

const toNumber = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return Number(v ?? 0);
};

export const saleRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
        status: saleStatusEnum.optional(),
        customerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, customerId } = input;

      const where: Prisma.SaleWhereInput = {
        ...(search
          ? {
              OR: [
                { saleNo: { contains: search, mode: "insensitive" } },
                { orderNo: { contains: search, mode: "insensitive" } },
                { invoiceNo: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  customer: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
      };

      const totalItems = await ctx.db.sale.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.sale.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              finishedGood: { include: { paintGrade: true } },
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

  getFinishedGoodPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(10),
        search: z.string().optional().default(""),
        status: saleStatusEnum.optional(),
        customerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, customerId } = input;

      const where: Prisma.SaleWhereInput = {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(search
          ? {
              OR: [
                { saleNo: { contains: search, mode: "insensitive" } },
                { orderNo: { contains: search, mode: "insensitive" } },
                { invoiceNo: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  customer: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        items: { some: { itemType: "FINISHED_GOOD" } },
      };

      const totalItems = await ctx.db.sale.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.sale.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { soldAt: "desc" },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "FINISHED_GOOD" },
            include: {
              finishedGood: { include: { paintGrade: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const mapped = data.map((s) => {
        const totalAmount = s.items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );
        const totalQty = s.items.reduce((sum, it) => sum + Number(it.qty), 0);
        const totalItemsLine = s.items.length;

        return { ...s, summary: { totalAmount, totalQty, totalItemsLine } };
      });

      return {
        data: mapped,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getByIdFinishedGood: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "FINISHED_GOOD" },
            include: {
              finishedGood: { include: { paintGrade: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (sale.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale ini bukan penjualan barang jadi (FINISHED_GOOD).",
        });
      }

      const totalAmount = sale.items.reduce(
        (sum, it) => sum + (it.subtotal ?? 0),
        0,
      );
      const totalQty = sale.items.reduce((sum, it) => sum + Number(it.qty), 0);

      return { sale, summary: { totalAmount, totalQty } };
    }),

  createFinishedGood: protectedProcedure
    .input(saleFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      // unique saleNo
      const exists = await ctx.db.sale.findUnique({
        where: { saleNo: input.saleNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor penjualan sudah digunakan.",
        });
      }

      // optional unique invoiceNo (your schema: invoiceNo String? @unique)
      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      const finishedGoodIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: finishedGoodIds } },
        select: { id: true },
      });
      if (fgs.length !== finishedGoodIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.sale.create({
        data: {
          saleNo: input.saleNo,
          customerId: input.customerId,
          orderNo: input.orderNo ?? null,
          invoiceNo: input.invoiceNo ?? null,
          notes: input.notes ?? null,
          status: "DRAFT",
          userId,
          items: {
            create: input.items.map((it) => {
              const qty = toNumber(it.qty);
              const unitPrice = toNumber(it.unitPrice);
              return {
                itemType: "FINISHED_GOOD",
                finishedGoodId: it.finishedGoodId,
                accessoryId: null,
                qty,
                unitPrice,
                subtotal: qty * unitPrice,
              };
            }),
          },
        },
        include: { customer: true, user: true, items: true },
      });
    }),

  updateFinishedGood: protectedProcedure
    .input(saleFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID sale wajib." });
      }

      const existing = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { id: true, status: true, invoiceNo: true },
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya sale DRAFT yang boleh diedit.",
        });
      }

      // unique invoiceNo if changed
      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo, NOT: { id: input.id } },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      const finishedGoodIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: finishedGoodIds } },
        select: { id: true },
      });
      if (fgs.length !== finishedGoodIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.saleItem.deleteMany({ where: { saleId: input.id! } });

        return tx.sale.update({
          where: { id: input.id! },
          data: {
            customerId: input.customerId,
            orderNo: input.orderNo ?? null,
            invoiceNo: input.invoiceNo ?? null,
            notes: input.notes ?? null,
            items: {
              create: input.items.map((it) => {
                const qty = toNumber(it.qty);
                const unitPrice = toNumber(it.unitPrice);
                return {
                  itemType: "FINISHED_GOOD",
                  finishedGoodId: it.finishedGoodId,
                  accessoryId: null,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: {
            customer: true,
            user: true,
            items: { include: { finishedGood: true } },
          },
        });
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: saleStatusEnum,
        notes: z.string().optional().nullable(),
        shippedAt: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const { id, status, notes, shippedAt } = input;

      return ctx.db.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!sale)
          throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

        const from = sale.status as SaleStatus;

        if (from === "FINISHED" || from === "CANCELED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Sale ${from} tidak bisa diubah lagi.`,
          });
        }

        const allowed: Record<SaleStatus, SaleStatus[]> = {
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

        // ✅ when FINISHED: decrement finished good stock + create stock movement
        if (status === "FINISHED") {
          const lines = sale.items.filter(
            (x) => x.itemType === "FINISHED_GOOD",
          );

          if (!lines.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Sale tidak memiliki item.",
            });
          }

          // validate stock first
          const fgIds = lines
            .map((l) => l.finishedGoodId)
            .filter(Boolean) as string[];
          const fgs = await tx.finishedGood.findMany({
            where: { id: { in: fgIds } },
            select: { id: true, qty: true },
          });

          const fgMap = new Map(fgs.map((x) => [x.id, Number(x.qty)]));

          for (const l of lines) {
            if (!l.finishedGoodId) continue;
            const need = Number(l.qty);
            const have = fgMap.get(l.finishedGoodId) ?? 0;

            if (have < need) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok barang jadi tidak cukup untuk item ${l.finishedGoodId}. Stok: ${have}, butuh: ${need}`,
              });
            }
          }

          // apply stock decrement + movements
          for (const l of lines) {
            if (!l.finishedGoodId) continue;

            await tx.finishedGood.update({
              where: { id: l.finishedGoodId },
              data: { qty: { decrement: l.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "SALE_OUT",
                itemType: "FINISHED_GOOD",
                itemId: l.finishedGoodId,
                qty: l.qty,
                refSaleId: sale.id,
                userId: userId || sale.userId,
                refFinishedGoodId: l.finishedGoodId,
              },
            });
          }
        }

        return tx.sale.update({
          where: { id },
          data: {
            status,
            ...(typeof notes !== "undefined" ? { notes } : {}),
            ...(typeof shippedAt !== "undefined" ? { shippedAt } : {}),
          },
        });
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { id: true, status: true },
      });

      if (!sale)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });

      if (sale.status === "FINISHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale FINISHED tidak bisa dibatalkan.",
        });
      }
      if (sale.status === "CANCELED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale sudah CANCELED.",
        });
      }

      return ctx.db.sale.update({
        where: { id: input.id },
        data: { status: "CANCELED" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { status: true },
      });

      if (!sale)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      if (sale.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya sale DRAFT yang bisa dihapus.",
        });
      }

      return ctx.db.sale.delete({ where: { id: input.id } });
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.sale.deleteMany({ where: { id: { in: input.ids } } });
    }),

  checkoutFinishedGood: protectedProcedure
    .input(
      saleFinishedGoodFormSchema.extend({
        shippedAt: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const shippedAt = input.shippedAt ?? new Date();

      // unique saleNo
      const exists = await ctx.db.sale.findUnique({
        where: { saleNo: input.saleNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor penjualan sudah digunakan.",
        });
      }

      // unique invoiceNo (optional)
      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      if (!input.items?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 barang jadi.",
        });
      }

      // 1) validate FG exist + stock enough (sebelum transaksi create)
      const fgIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: fgIds } },
        select: { id: true, qty: true },
      });

      if (fgs.length !== fgIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      const fgMap = new Map(fgs.map((x) => [x.id, Number(x.qty)]));

      for (const it of input.items) {
        const need = toNumber(it.qty);
        const have = fgMap.get(it.finishedGoodId) ?? 0;
        if (have < need) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Stok tidak cukup untuk FG ${it.finishedGoodId}. Stok: ${have}, butuh: ${need}`,
          });
        }
      }

      // 2) Transaction: create sale FINISHED + decrement + stock movement
      return ctx.db.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            saleNo: input.saleNo,
            customerId: input.customerId,
            orderNo: input.orderNo ?? null,
            invoiceNo: input.invoiceNo ?? null,
            notes: input.notes ?? null,
            status: "FINISHED",
            shippedAt,
            userId,
            items: {
              create: input.items.map((it) => {
                const qty = toNumber(it.qty);
                const unitPrice = toNumber(it.unitPrice);
                return {
                  itemType: "FINISHED_GOOD",
                  finishedGoodId: it.finishedGoodId,
                  accessoryId: null,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: { items: true, customer: true, user: true },
        });

        // apply stock decrement + movements
        for (const line of sale.items) {
          if (line.itemType !== "FINISHED_GOOD") continue;
          if (!line.finishedGoodId) continue;

          await tx.finishedGood.update({
            where: { id: line.finishedGoodId },
            data: { qty: { decrement: line.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "SALE_OUT",
              itemType: "FINISHED_GOOD",
              itemId: line.finishedGoodId,
              qty: line.qty,
              refSaleId: sale.id,
              userId: userId || sale.userId,
              refFinishedGoodId: line.finishedGoodId,
            },
          });
        }

        return sale;
      });
    }),
});
