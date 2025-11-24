import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { accessoriesFormSchema } from "~/components/features/accessories/form/accessories";

export const accessoriesRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search } = input;

      const where: Prisma.PaintAccessoriesWhereInput = {
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      };

      const totalItems = await ctx.db.paintAccessories.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.paintAccessories.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          supplier: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        data,
        meta: {
          currentPage: page,
          lastPage,
          perPage,
          totalItems,
        },
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalAccessories = await ctx.db.paintAccessories.count();

    const thisYearAccessories = await ctx.db.paintAccessories.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const totalQty = await ctx.db.paintAccessories.aggregate({
      _sum: {
        qty: true,
      },
    });

    const lowStockCount = await ctx.db.paintAccessories.count({
      where: {
        qty: {
          lt: 10,
        },
      },
    });

    const inventoryValue = await ctx.db.paintAccessories.findMany({
      select: {
        qty: true,
        supplierPrice: true,
      },
    });

    const totalInventoryValue = inventoryValue.reduce(
      (sum, item) => sum + item.qty * item.supplierPrice,
      0,
    );

    const potentialProfit = inventoryValue.reduce(
      (sum, item) => sum + item.qty * item.supplierPrice,
      0,
    );

    const rawAccessoriesWithProfit = await ctx.db.paintAccessories.findMany({
      select: {
        qty: true,
        supplierPrice: true,
        sellingPrice: true,
      },
    });

    const totalPotentialProfit = rawAccessoriesWithProfit.reduce(
      (sum, item) => sum + item.qty * (item.sellingPrice - item.supplierPrice),
      0,
    );

    const avgSupplierPrice = await ctx.db.paintAccessories.aggregate({
      _avg: {
        supplierPrice: true,
      },
    });

    const avgSellingPrice = await ctx.db.paintAccessories.aggregate({
      _avg: {
        sellingPrice: true,
      },
    });

    const thisMonthAccessories = await ctx.db.paintAccessories.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const supplierCount = await ctx.db.paintAccessories.groupBy({
      by: ["supplierId"],
      _count: true,
    });

    const growth =
      totalAccessories === 0
        ? 0
        : ((thisYearAccessories / totalAccessories) * 100).toFixed(1);

    return {
      totalAccessories,
      thisYearAccessories,
      thisMonthAccessories,
      growth: Number(growth),
      totalQty: totalQty._sum.qty ?? 0,
      lowStockCount,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalPotentialProfit: Math.round(totalPotentialProfit),
      avgSupplierPrice: Math.round(avgSupplierPrice._avg.supplierPrice ?? 0),
      avgSellingPrice: Math.round(avgSellingPrice._avg.sellingPrice ?? 0),
      uniqueSuppliers: supplierCount.length,
    };
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.paintAccessories.findMany({
      include: {
        supplier: true,
      }
    });
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.paintAccessories.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.paintAccessories.findUnique({ where: { id: input.id } });
    }),

  create: protectedProcedure
    .input(accessoriesFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.paintAccessories.create({
        data: {
          supplierId: input.supplierId,
          userId: input.userId,
          name: input.name,
          qty: input.qty,
          supplierPrice: input.supplierPrice,
          sellingPrice: input.sellingPrice,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.paintAccessories.delete({
          where: { id: input.id },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2003"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tidak dapat menghapus aksesoris karena terdapat item di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.paintAccessories.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  update: protectedProcedure
    .input(accessoriesFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.paintAccessories.update({
        where: { id: input.id },
        data: {
          supplierId: input.supplierId,
          userId: input.userId,
          name: input.name,
          qty: input.qty,
          supplierPrice: input.supplierPrice,
          sellingPrice: input.sellingPrice,
        },
      });
    }),
});
