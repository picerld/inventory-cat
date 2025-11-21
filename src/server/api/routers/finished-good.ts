import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { finishedGoodFormSchema } from "~/components/features/finished/form/finished-good";

export const finishedGoodRouter = createTRPCRouter({
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

      const where: Prisma.FinishedGoodWhereInput = {
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      };

      const totalItems = await ctx.db.finishedGood.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.finishedGood.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          user: true,
          finishedGoodDetails: {
            include: {
              rawMaterial: true,
            },
          },
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
    const totalFinishedGoods = await ctx.db.finishedGood.count();

    const thisYearFinishedGoods = await ctx.db.finishedGood.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const thisMonthFinishedGoods = await ctx.db.finishedGood.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalDetails = await ctx.db.finishedGoodDetail.count();

    const finishedGoodsWithDetails = await ctx.db.finishedGood.findMany({
      include: {
        finishedGoodDetails: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    const avgRawMaterialsPerGood =
      totalFinishedGoods === 0
        ? 0
        : (totalDetails / totalFinishedGoods).toFixed(1);

    const growth =
      totalFinishedGoods === 0
        ? 0
        : ((thisYearFinishedGoods / totalFinishedGoods) * 100).toFixed(1);

    const rawMaterialUsage: Record<string, number> = {};
    finishedGoodsWithDetails.forEach((sfg) => {
      sfg.finishedGoodDetails.forEach((detail) => {
        rawMaterialUsage[detail.rawMaterialId] =
          (rawMaterialUsage[detail.rawMaterialId] || 0) + 1;
      });
    });

    const mostUsedRawMaterialId = Object.entries(rawMaterialUsage).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];

    const mostUsedRawMaterial = mostUsedRawMaterialId
      ? await ctx.db.rawMaterial.findUnique({
          where: { id: mostUsedRawMaterialId },
          select: { name: true },
        })
      : null;

    return {
      totalFinishedGoods,
      thisYearFinishedGoods,
      thisMonthFinishedGoods,
      growth: Number(growth),
      totalDetails,
      avgRawMaterialsPerGood: Number(avgRawMaterialsPerGood),
      mostUsedRawMaterial: mostUsedRawMaterial?.name ?? null,
      mostUsedCount: mostUsedRawMaterialId
        ? rawMaterialUsage[mostUsedRawMaterialId]
        : 0,
    };
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.finishedGood.findMany({
      include: {
        finishedGoodDetails: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.finishedGood.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.finishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          finishedGoodDetails: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const finished = await tx.finishedGood.create({
          data: {
            userId: input.userId,
            name: input.name,
            qty: input.qty,
            productionCode: input.productionCode,
            batchNumber: input.batchNumber,
            quality: input.quality,
            dateProduced: input.dateProduced,
            finishedGoodDetails: {
              create: input.materials.map((material) => ({
                rawMaterialId: material.rawMaterialId,
                qty: material.qty,
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
            },
          },
          include: {
            user: true,
            finishedGoodDetails: {
              include: {
                rawMaterial: true,
              },
            },
          },
        });

        for (const material of input.materials) {
          await tx.rawMaterial.update({
            where: { id: material.rawMaterialId },
            data: {
              qty: {
                decrement: material.qty,
              },
            },
          });
        }

        return finished;
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.finishedGoodDetail.deleteMany({
          where: { finishedGoodId: input.id },
        });

        return await ctx.db.finishedGood.delete({
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
              "Tidak dapat menghapus barang jadi karena terdapat relasi di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.finishedGoodDetail.deleteMany({
        where: { finishedGoodId: { in: input.ids } },
      });

      return ctx.db.finishedGood.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  update: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID is required for update operation",
        });
      }

      await ctx.db.finishedGoodDetail.deleteMany({
        where: { finishedGoodId: input.id },
      });

      return ctx.db.finishedGood.update({
        where: { id: input.id },
        data: {
          userId: input.userId,
          name: input.name,
          qty: input.qty,
          productionCode: input.productionCode,
          batchNumber: input.batchNumber,
          quality: input.quality,
          dateProduced: input.dateProduced,
          finishedGoodDetails: {
            create: input.materials.map((material) => ({
              rawMaterialId: material.rawMaterialId,
              qty: material.qty,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          },
        },
        include: {
          user: true,
          finishedGoodDetails: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });
    }),
});
