import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { semiFinishedGoodFormSchema } from "~/components/features/semi-finished/form/semi-finished";

export const semiFinishedGoodRouter = createTRPCRouter({
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

      const where: Prisma.SemiFinishedGoodWhereInput = {
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      };

      const totalItems = await ctx.db.semiFinishedGood.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.semiFinishedGood.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          user: true,
          SemiFinishedGoodDetail: {
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
    const totalSemiFinishedGoods = await ctx.db.semiFinishedGood.count();

    const thisYearSemiFinishedGoods = await ctx.db.semiFinishedGood.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const thisMonthSemiFinishedGoods = await ctx.db.semiFinishedGood.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalDetails = await ctx.db.semiFinishedGoodDetail.count();

    const semiFinishedGoodsWithDetails = await ctx.db.semiFinishedGood.findMany(
      {
        include: {
          SemiFinishedGoodDetail: {
            include: {
              rawMaterial: true,
            },
          },
        },
      },
    );

    const avgRawMaterialsPerGood =
      totalSemiFinishedGoods === 0
        ? 0
        : (totalDetails / totalSemiFinishedGoods).toFixed(1);

    const growth =
      totalSemiFinishedGoods === 0
        ? 0
        : ((thisYearSemiFinishedGoods / totalSemiFinishedGoods) * 100).toFixed(
            1,
          );

    const rawMaterialUsage: Record<string, number> = {};
    semiFinishedGoodsWithDetails.forEach((sfg) => {
      sfg.SemiFinishedGoodDetail.forEach((detail) => {
        rawMaterialUsage[detail.rawMaterialId] =
          (rawMaterialUsage[detail.rawMaterialId] ?? 0) + 1;
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
      totalSemiFinishedGoods,
      thisYearSemiFinishedGoods,
      thisMonthSemiFinishedGoods,
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
    return ctx.db.semiFinishedGood.findMany({
      include: {
        SemiFinishedGoodDetail: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });
  }),

  getQRData: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.semiFinishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          SemiFinishedGoodDetail: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Barang setengah jadi tidak ditemukan",
        });
      }

      const qrData = {
        id: item.id,
        name: item.name,
        qty: item.qty,
        type: "SEMI_FINISHED_GOOD",
        createdAt: item.createdAt.toISOString(),
        userId: item.userId,
      };

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}`
          : "http://localhost:3000";

      const previewLink = `${baseUrl}/qr/semi-finished/${item.id}`;

      return {
        item,
        // qrValue: JSON.stringify(qrData),
        qrValue: previewLink,
        previewLink,
      };
    }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.semiFinishedGood.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.semiFinishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          SemiFinishedGoodDetail: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const semiFinished = await tx.semiFinishedGood.create({
          data: {
            userId: input.userId,
            name: input.name,
            qty: input.qty,
            SemiFinishedGoodDetail: {
              create: input.materials.map((material) => ({
                rawMaterialId: material.rawMaterialId,
                qty: material.qty,
              })),
            },
          },
          include: {
            user: true,
            SemiFinishedGoodDetail: {
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

        return semiFinished;
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.semiFinishedGoodDetail.deleteMany({
          where: { semiFinishedGoodId: input.id },
        });

        return await ctx.db.semiFinishedGood.delete({
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
              "Tidak dapat menghapus barang setengah jadi karena terdapat relasi di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.semiFinishedGoodDetail.deleteMany({
        where: { semiFinishedGoodId: { in: input.ids } },
      });

      return ctx.db.semiFinishedGood.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  update: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID is required for update operation",
        });
      }

      await ctx.db.semiFinishedGoodDetail.deleteMany({
        where: { semiFinishedGoodId: input.id },
      });

      return ctx.db.semiFinishedGood.update({
        where: { id: input.id },
        data: {
          userId: input.userId,
          name: input.name,
          SemiFinishedGoodDetail: {
            create: input.materials.map((material) => ({
              rawMaterialId: material.rawMaterialId,
              qty: material.qty,
            })),
          },
        },
        include: {
          user: true,
          SemiFinishedGoodDetail: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });
    }),
});
