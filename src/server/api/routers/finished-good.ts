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
                }
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

  create: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        if (input.sourceType === "raw_material" && input.materials) {
          const finished = await tx.finishedGood.create({
            data: {
              userId: input.userId,
              paintGradeId: input.paintGradeId,
              name: input.name,
              qty: input.qty,
              productionCode: input.productionCode,
              batchNumber: input.batchNumber,
              dateProduced: input.dateProduced,
              sourceType: input.sourceType.toUpperCase() as "RAW_MATERIAL",
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
              paintGrade: true,
              finishedGoodDetails: {
                include: {
                  rawMaterial: true,
                },
              },
            },
          });

          // Decrement raw material stock
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
        }

        // Handle semi-finished source
        if (input.sourceType === "semi_finished" && input.semiFinishedGoods) {
          // Get all raw materials from semi-finished goods
          const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
            where: {
              id: {
                in: input.semiFinishedGoods.map((sf) => sf.semiFinishedGoodId),
              },
            },
            include: {
              SemiFinishedGoodDetail: {
                include: {
                  rawMaterial: true,
                },
              },
            },
          });

          // Aggregate raw materials from all semi-finished goods
          const rawMaterialMap = new Map<string, number>();

          for (const sfgInput of input.semiFinishedGoods) {
            const sfg = semiFinishedWithDetails.find(
              (s) => s.id === sfgInput.semiFinishedGoodId,
            );
            if (!sfg) continue;

            // For each semi-finished good, add its raw materials proportionally
            for (const detail of sfg.SemiFinishedGoodDetail) {
              const proportionalQty = (detail.qty / sfg.qty) * sfgInput.qty;
              const currentQty = rawMaterialMap.get(detail.rawMaterialId) ?? 0;
              rawMaterialMap.set(
                detail.rawMaterialId,
                currentQty + proportionalQty,
              );
            }
          }

          // Convert map to array
          const aggregatedMaterials = Array.from(rawMaterialMap.entries()).map(
            ([rawMaterialId, qty]) => ({
              rawMaterialId,
              qty: Math.ceil(qty), // Round up to ensure we have enough
            }),
          );

          const finished = await tx.finishedGood.create({
            data: {
              userId: input.userId,
              paintGradeId: input.paintGradeId,
              name: input.name,
              qty: input.qty,
              productionCode: input.productionCode,
              sourceType: input.sourceType.toUpperCase() as "SEMI_FINISHED",
              batchNumber: input.batchNumber,
              dateProduced: input.dateProduced,
              finishedGoodDetails: {
                create: aggregatedMaterials.map((material) => ({
                  rawMaterialId: material.rawMaterialId,
                  qty: material.qty,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
              },
            },
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

          // Decrement semi-finished goods stock
          for (const sfg of input.semiFinishedGoods) {
            await tx.semiFinishedGood.update({
              where: { id: sfg.semiFinishedGoodId },
              data: {
                qty: {
                  decrement: sfg.qty,
                },
              },
            });
          }

          return finished;
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid source type or missing materials",
        });
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

      return await ctx.db.$transaction(async (tx) => {
        // Delete existing details
        await tx.finishedGoodDetail.deleteMany({
          where: { finishedGoodId: input.id },
        });

        // Handle raw material source
        if (input.sourceType === "raw_material" && input.materials) {
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
              paintGrade: true,
              finishedGoodDetails: {
                include: {
                  rawMaterial: true,
                },
              },
            },
          });

          return updated;
        }

        if (input.sourceType === "semi_finished" && input.semiFinishedGoods) {
          const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
            where: {
              id: {
                in: input.semiFinishedGoods.map((sf) => sf.semiFinishedGoodId),
              },
            },
            include: {
              SemiFinishedGoodDetail: {
                include: {
                  rawMaterial: true,
                },
              },
            },
          });

          const rawMaterialMap = new Map<string, number>();

          for (const sfgInput of input.semiFinishedGoods) {
            const sfg = semiFinishedWithDetails.find(
              (s) => s.id === sfgInput.semiFinishedGoodId,
            );
            if (!sfg) continue;

            for (const detail of sfg.SemiFinishedGoodDetail) {
              const proportionalQty = (detail.qty / sfg.qty) * sfgInput.qty;
              const currentQty = rawMaterialMap.get(detail.rawMaterialId) ?? 0;
              rawMaterialMap.set(
                detail.rawMaterialId,
                currentQty + proportionalQty,
              );
            }
          }

          const aggregatedMaterials = Array.from(rawMaterialMap.entries()).map(
            ([rawMaterialId, qty]) => ({
              rawMaterialId,
              qty: Math.ceil(qty),
            }),
          );

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
              finishedGoodDetails: {
                create: aggregatedMaterials.map((material) => ({
                  rawMaterialId: material.rawMaterialId,
                  qty: material.qty,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
              },
            },
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

          return updated;
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid source type or missing materials",
        });
      });
    }),
});
