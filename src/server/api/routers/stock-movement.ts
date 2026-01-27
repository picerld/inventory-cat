import z from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const itemTypeEnum = z.enum([
  "RAW_MATERIAL",
  "SEMI_FINISHED_GOOD",
  "FINISHED_GOOD",
  "PAINT_ACCESSORIES",
]);

const movementTypeEnum = z.enum([
  "PURCHASE_IN",
  "SALE_OUT",
  "PRODUCTION_IN",
  "PRODUCTION_OUT",
  "RETURN_IN",
  "ADJUSTMENT",
]);

export const stockMovementRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),

        search: z.string().optional().default(""),

        // ✅ filter tambahan
        type: movementTypeEnum.optional(),
        itemType: itemTypeEnum.optional(),
        itemId: z.string().optional(),

        refPurchaseId: z.string().optional(),
        refSaleId: z.string().optional(),
        refReturnId: z.string().optional(),

        // ✅ NEW
        refSemiFinishedGoodId: z.string().optional(),
        refFinishedGoodId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search } = input;

      const where: Prisma.StockMovementWhereInput = {
        ...(input.type ? { type: input.type } : {}),
        ...(input.itemType ? { itemType: input.itemType } : {}),
        ...(input.itemId ? { itemId: input.itemId } : {}),

        ...(input.refPurchaseId ? { refPurchaseId: input.refPurchaseId } : {}),
        ...(input.refSaleId ? { refSaleId: input.refSaleId } : {}),
        ...(input.refReturnId ? { refReturnId: input.refReturnId } : {}),

        // ✅ NEW
        ...(input.refSemiFinishedGoodId
          ? { refSemiFinishedGoodId: input.refSemiFinishedGoodId }
          : {}),
        ...(input.refFinishedGoodId
          ? { refFinishedGoodId: input.refFinishedGoodId }
          : {}),

        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },

                // cari by purchaseNo/saleNo/etc kalau include relasi ada
                {
                  refPurchase: {
                    purchaseNo: { contains: search, mode: "insensitive" },
                  },
                },
                {
                  refSale: {
                    saleNo: { contains: search, mode: "insensitive" },
                  },
                },

                // NEW: cari by sfg/fg name
                {
                  refSemiFinishedGood: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
                {
                  refFinishedGood: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      };

      const totalItems = await ctx.db.stockMovement.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.stockMovement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,

          // ✅ include ref lama
          refPurchase: { select: { id: true, purchaseNo: true } },
          refSale: { select: { id: true, saleNo: true } },
          refReturn: { select: { id: true } },

          // ✅ include ref baru
          refSemiFinishedGood: { select: { id: true, name: true } },
          refFinishedGood: {
            select: { id: true, name: true, productionCode: true },
          },
        },
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const m = await ctx.db.stockMovement.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          refPurchase: { select: { id: true, purchaseNo: true } },
          refSale: { select: { id: true, saleNo: true } },
          refReturn: { select: { id: true } },
          refSemiFinishedGood: { select: { id: true, name: true } },
          refFinishedGood: {
            select: { id: true, name: true, productionCode: true },
          },
        },
      });

      if (!m) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stock movement not found",
        });
      }

      // optional: itemName fallback biar UI enak
      const itemName =
        m.refFinishedGood?.name ??
        m.refSemiFinishedGood?.name ??
        m.refPurchase?.purchaseNo ??
        m.refSale?.saleNo ??
        null;

      return { ...m, itemName };
    }),
});
