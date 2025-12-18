import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { rawMaterialFormSchema } from "~/components/features/raw-material/form/raw-material";

export const rawMaterialRouter = createTRPCRouter({
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

      const where: Prisma.RawMaterialWhereInput = {
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      };

      const totalItems = await ctx.db.rawMaterial.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.rawMaterial.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          supplier: true,
          user: true,
          paintGrade: true,
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
    const totalRawMaterials = await ctx.db.rawMaterial.count();

    const thisYearRawMaterials = await ctx.db.rawMaterial.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const totalQty = await ctx.db.rawMaterial.aggregate({
      _sum: {
        qty: true,
      },
    });

    const lowStockCount = await ctx.db.rawMaterial.count({
      where: {
        qty: {
          lt: 10,
        },
      },
    });

    const inventoryValue = await ctx.db.rawMaterial.findMany({
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

    const rawMaterialsWithProfit = await ctx.db.rawMaterial.findMany({
      select: {
        qty: true,
        supplierPrice: true,
      },
    });

    const totalPotentialProfit = rawMaterialsWithProfit.reduce(
      (sum, item) => sum + item.qty * (item.supplierPrice - item.supplierPrice),
      0,
    );

    const avgSupplierPrice = await ctx.db.rawMaterial.aggregate({
      _avg: {
        supplierPrice: true,
      },
    });

    const avgSellingPrice = await ctx.db.rawMaterial.aggregate({
      _avg: {
        supplierPrice: true,
      },
    });

    const thisMonthRawMaterials = await ctx.db.rawMaterial.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const supplierCount = await ctx.db.rawMaterial.groupBy({
      by: ["supplierId"],
      _count: true,
    });

    const growth =
      totalRawMaterials === 0
        ? 0
        : ((thisYearRawMaterials / totalRawMaterials) * 100).toFixed(1);

    return {
      totalRawMaterials,
      thisYearRawMaterials,
      thisMonthRawMaterials,
      growth: Number(growth),
      totalQty: totalQty._sum.qty ?? 0,
      lowStockCount,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalPotentialProfit: Math.round(totalPotentialProfit),
      avgSupplierPrice: Math.round(avgSupplierPrice._avg.supplierPrice ?? 0),
      avgSellingPrice: Math.round(avgSellingPrice._avg.supplierPrice ?? 0),
      uniqueSuppliers: supplierCount.length,
    };
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.rawMaterial.findMany({
      include: {
        supplier: true,
        paintGrade: true,
      }
    });
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.rawMaterial.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.rawMaterial.findUnique({ where: { id: input.id } });
    }),

  create: protectedProcedure
    .input(rawMaterialFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.rawMaterial.create({
        data: {
          supplierId: input.supplierId,
          userId: input.userId,
          name: input.name,
          qty: input.qty,
          materialType: input.materialType,
          supplierPrice: input.supplierPrice,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.rawMaterial.delete({
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
              "Tidak dapat menghapus bahan baku karena terdapat item di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.rawMaterial.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  update: protectedProcedure
    .input(rawMaterialFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rawMaterial.update({
        where: { id: input.id },
        data: {
          supplierId: input.supplierId,
          userId: input.userId,
          name: input.name,
          qty: input.qty,
          materialType: input.materialType,
          supplierPrice: input.supplierPrice,
        },
      });
    }),
});
