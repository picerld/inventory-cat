import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { finishedGoodFormSchema } from "~/components/features/finished/form/finished-good";
import { toNumber } from "~/lib/utils";
import { calculateFinishedGoodCost } from "~/server/service/costing";

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
          paintGrade: true,
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
    finishedGoodsWithDetails.forEach((fg) => {
      fg.finishedGoodDetails.forEach((detail) => {
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
        paintGrade: true,
        finishedGoodDetails: {
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
      const item = await ctx.db.finishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          paintGrade: {
            select: {
              id: true,
              name: true,
            },
          },
          finishedGoodDetails: {
            include: {
              semiFinishedGood: {
                select: {
                  name: true,
                  qty: true,
                },
              },
              rawMaterial: {
                select: {
                  name: true,
                  supplier: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Barang jadi tidak ditemukan",
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}`
        : "http://localhost:3000";

      const previewLink = `${baseUrl}/qr/finished-good/${item.id}`;

      return {
        item,
        qrValue: previewLink,
        previewLink,
      };
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
          paintGrade: true,
          finishedGoodDetails: {
            include: {
              rawMaterial: true,
            },
          },
        },
      });
    }),

  getByProductionCode: protectedProcedure
    .input(z.object({ productionCode: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const fg = await ctx.db.finishedGood.findUnique({
        where: { productionCode: input.productionCode },
        include: { paintGrade: true },
      });

      if (!fg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Barang jadi tidak ditemukan dari barcode/productionCode.",
        });
      }
      return fg;
    }),

  getCostPrice: protectedProcedure
    .input(z.object({ finishedGoodId: z.string() }))
    .query(async ({ input }) => {
      const cost = await calculateFinishedGoodCost(input.finishedGoodId);
      return { cost };
    }),

  create: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(async (tx) => {
        const sourceTypeUpper = input.sourceType.toUpperCase() as
          | "RAW_MATERIAL"
          | "SEMI_FINISHED";

        let aggregatedMaterials: { rawMaterialId: string; qty: number }[] = [];

        let consumedSemiFinished: {
          semiFinishedGoodId: string;
          qty: number;
        }[] = [];

        if (input.sourceType === "raw_material") {
          if (!input.materials?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Materials wajib untuk source raw_material",
            });
          }

          for (const m of input.materials) {
            const rm = await tx.rawMaterial.findUnique({
              where: { id: m.rawMaterialId },
              select: { id: true, name: true, qty: true },
            });
            if (!rm) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Raw material tidak ditemukan",
              });
            }
            if (toNumber(rm.qty) < toNumber(m.qty)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
              });
            }
          }

          aggregatedMaterials = input.materials.map((m) => ({
            rawMaterialId: m.rawMaterialId,
            qty: toNumber(m.qty),
          }));
        }

        if (input.sourceType === "semi_finished") {
          if (!input.semiFinishedGoods?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "semiFinishedGoods wajib untuk source semi_finished",
            });
          }

          for (const sf of input.semiFinishedGoods) {
            const sfg = await tx.semiFinishedGood.findUnique({
              where: { id: sf.semiFinishedGoodId },
              select: { id: true, name: true, qty: true },
            });
            if (!sfg) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Semi finished good tidak ditemukan",
              });
            }
            if (toNumber(sfg.qty) < toNumber(sf.qty)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok ${sfg.name} tidak cukup. Tersedia ${sfg.qty}, butuh ${sf.qty}`,
              });
            }
          }

          consumedSemiFinished = input.semiFinishedGoods.map((sf) => ({
            semiFinishedGoodId: sf.semiFinishedGoodId,
            qty: toNumber(sf.qty),
          }));

          const sfgIds = input.semiFinishedGoods.map(
            (x) => x.semiFinishedGoodId,
          );

          const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
            where: { id: { in: sfgIds } },
            include: { SemiFinishedGoodDetail: true },
          });

          const rmMap = new Map<string, number>();

          for (const sf of input.semiFinishedGoods) {
            const sfg = semiFinishedWithDetails.find(
              (x) => x.id === sf.semiFinishedGoodId,
            );
            if (!sfg) continue;

            for (const d of sfg.SemiFinishedGoodDetail) {
              const add = toNumber(d.qty) * toNumber(sf.qty);
              rmMap.set(
                d.rawMaterialId,
                (rmMap.get(d.rawMaterialId) ?? 0) + add,
              );
            }
          }

          aggregatedMaterials = Array.from(rmMap.entries()).map(
            ([rawMaterialId, qty]) => ({
              rawMaterialId,
              qty: qty,
            }),
          );
        }

        const finished = await tx.finishedGood.create({
          data: {
            userId: input.userId,
            paintGradeId: input.paintGradeId,
            name: input.name,
            qty: input.qty,
            productionCode: input.productionCode,
            batchNumber: input.batchNumber,
            dateProduced: input.dateProduced,
            sourceType: sourceTypeUpper,
            finishedGoodDetails: {
              create: aggregatedMaterials.map((m) => ({
                rawMaterialId: m.rawMaterialId,
                qty: m.qty,
              })),
            },
          },
          include: {
            user: true,
            paintGrade: true,
            finishedGoodDetails: { include: { rawMaterial: true } },
          },
        });

        if (input.sourceType === "raw_material") {
          for (const m of aggregatedMaterials) {
            await tx.rawMaterial.update({
              where: { id: m.rawMaterialId },
              data: { qty: { decrement: m.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "PRODUCTION_OUT",
                itemType: "RAW_MATERIAL",
                itemId: m.rawMaterialId,
                qty: m.qty,
                userId,
                refFinishedGoodId: finished.id,
              },
            });
          }
        }

        if (input.sourceType === "semi_finished") {
          for (const sf of consumedSemiFinished) {
            await tx.semiFinishedGood.update({
              where: { id: sf.semiFinishedGoodId },
              data: { qty: { decrement: sf.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "PRODUCTION_OUT",
                itemType: "SEMI_FINISHED_GOOD",
                itemId: sf.semiFinishedGoodId,
                qty: sf.qty,
                userId,
                refFinishedGoodId: finished.id,
                refSemiFinishedGoodId: sf.semiFinishedGoodId,
              },
            });
          }
        }

        await tx.stockMovement.create({
          data: {
            type: "PRODUCTION_IN",
            itemType: "FINISHED_GOOD",
            itemId: finished.id,
            qty: toNumber(input.qty),
            userId,
            refFinishedGoodId: finished.id,
          },
        });

        return finished;
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

      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(async (tx) => {
        const existing = await tx.finishedGood.findUnique({
          where: { id: input.id },
          include: {
            finishedGoodDetails: true,
          },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Finished good not found",
          });
        }

        for (const d of existing.finishedGoodDetails) {
          await tx.rawMaterial.update({
            where: { id: d.rawMaterialId },
            data: { qty: { increment: d.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "RAW_MATERIAL",
              itemId: d.rawMaterialId,
              qty: d.qty,
              userId,
              refFinishedGoodId: existing.id,
            },
          });
        }

        if (existing.sourceType === "SEMI_FINISHED") {
          const oldSfMoves = await tx.stockMovement.findMany({
            where: {
              refFinishedGoodId: existing.id,
              itemType: "SEMI_FINISHED_GOOD",
              type: "PRODUCTION_OUT",
            },
            select: { itemId: true, qty: true },
          });

          for (const mv of oldSfMoves) {
            await tx.semiFinishedGood.update({
              where: { id: mv.itemId },
              data: { qty: { increment: mv.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "ADJUSTMENT",
                itemType: "SEMI_FINISHED_GOOD",
                itemId: mv.itemId,
                qty: mv.qty,
                userId,
                refFinishedGoodId: existing.id,
                refSemiFinishedGoodId: mv.itemId,
              },
            });
          }
        }

        await tx.finishedGoodDetail.deleteMany({
          where: { finishedGoodId: input.id },
        });

        const sourceTypeUpper = input.sourceType.toUpperCase() as
          | "RAW_MATERIAL"
          | "SEMI_FINISHED";

        let aggregatedMaterials: { rawMaterialId: string; qty: number }[] = [];
        let consumedSemiFinished: {
          semiFinishedGoodId: string;
          qty: number;
        }[] = [];

        if (input.sourceType === "raw_material") {
          if (!input.materials?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Materials wajib untuk source raw_material",
            });
          }

          for (const m of input.materials) {
            const rm = await tx.rawMaterial.findUnique({
              where: { id: m.rawMaterialId },
              select: { id: true, name: true, qty: true },
            });
            if (!rm)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Raw material not found",
              });

            if (toNumber(rm.qty) < toNumber(m.qty)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
              });
            }
          }

          aggregatedMaterials = input.materials.map((m) => ({
            rawMaterialId: m.rawMaterialId,
            qty: toNumber(m.qty),
          }));
        }

        if (input.sourceType === "semi_finished") {
          if (!input.semiFinishedGoods?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "semiFinishedGoods wajib untuk source semi_finished",
            });
          }

          for (const sf of input.semiFinishedGoods) {
            const sfg = await tx.semiFinishedGood.findUnique({
              where: { id: sf.semiFinishedGoodId },
              select: { id: true, name: true, qty: true },
            });
            if (!sfg)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Semi finished not found",
              });

            if (toNumber(sfg.qty) < toNumber(sf.qty)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok ${sfg.name} tidak cukup. Tersedia ${sfg.qty}, butuh ${sf.qty}`,
              });
            }
          }

          consumedSemiFinished = input.semiFinishedGoods.map((sf) => ({
            semiFinishedGoodId: sf.semiFinishedGoodId,
            qty: toNumber(sf.qty),
          }));

          const sfgIds = input.semiFinishedGoods.map(
            (x) => x.semiFinishedGoodId,
          );

          const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
            where: { id: { in: sfgIds } },
            include: { SemiFinishedGoodDetail: true },
          });

          const rmMap = new Map<string, number>();
          for (const sf of input.semiFinishedGoods) {
            const sfg = semiFinishedWithDetails.find(
              (x) => x.id === sf.semiFinishedGoodId,
            );
            if (!sfg) continue;

            for (const d of sfg.SemiFinishedGoodDetail) {
              const add = toNumber(d.qty) * toNumber(sf.qty);
              rmMap.set(
                d.rawMaterialId,
                (rmMap.get(d.rawMaterialId) ?? 0) + add,
              );
            }
          }

          aggregatedMaterials = Array.from(rmMap.entries()).map(
            ([rawMaterialId, qty]) => ({
              rawMaterialId,
              qty,
            }),
          );
        }

        const updated = await tx.finishedGood.update({
          where: { id: input.id },
          data: {
            userId: input.userId,
            paintGradeId: input.paintGradeId,
            name: input.name,
            qty: input.qty,
            productionCode: input.productionCode,
            batchNumber: input.batchNumber,
            dateProduced: input.dateProduced,
            sourceType: sourceTypeUpper,
            finishedGoodDetails: {
              create: aggregatedMaterials.map((m) => ({
                rawMaterialId: m.rawMaterialId,
                qty: m.qty,
              })),
            },
          },
          include: {
            user: true,
            paintGrade: true,
            finishedGoodDetails: { include: { rawMaterial: true } },
          },
        });

        if (input.sourceType === "raw_material") {
          for (const m of aggregatedMaterials) {
            await tx.rawMaterial.update({
              where: { id: m.rawMaterialId },
              data: { qty: { decrement: m.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "PRODUCTION_OUT",
                itemType: "RAW_MATERIAL",
                itemId: m.rawMaterialId,
                qty: m.qty,
                userId,
                refFinishedGoodId: updated.id,
              },
            });
          }
        }

        if (input.sourceType === "semi_finished") {
          for (const sf of consumedSemiFinished) {
            await tx.semiFinishedGood.update({
              where: { id: sf.semiFinishedGoodId },
              data: { qty: { decrement: sf.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "PRODUCTION_OUT",
                itemType: "SEMI_FINISHED_GOOD",
                itemId: sf.semiFinishedGoodId,
                qty: sf.qty,
                userId,
                refFinishedGoodId: updated.id,
                refSemiFinishedGoodId: sf.semiFinishedGoodId,
              },
            });
          }
        }

        await tx.stockMovement.create({
          data: {
            type: "PRODUCTION_IN",
            itemType: "FINISHED_GOOD",
            itemId: updated.id,
            qty: toNumber(input.qty),
            userId,
            refFinishedGoodId: updated.id,
          },
        });

        return updated;
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
});
