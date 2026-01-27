import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { finishedGoodFormSchema } from "~/components/features/finished/form/finished-good";
import { toNumber } from "~/lib/utils";

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

  create: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(async (tx) => {
        // =============================
        // 1) VALIDATE + PREPARE CONSUMPTION
        // =============================
        const sourceTypeUpper = input.sourceType.toUpperCase() as
          | "RAW_MATERIAL"
          | "SEMI_FINISHED";

        // konsumsi raw materials final (untuk detail)
        let aggregatedMaterials: { rawMaterialId: string; qty: number }[] = [];

        // konsumsi semi finished untuk decrement
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

          // validate stok raw cukup
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

          // validate stok semi finished cukup
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

          // Ambil detail raw material dari SFG untuk membentuk FinishedGoodDetail (audit BOM)
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

            // NOTE: qty SFG kamu itu "jumlah baris detail", bukan output unit.
            // Jadi proporsional detail.qty / sfg.qty bisa tidak meaningful.
            // Aku ambil pendekatan: pakai proporsi berdasarkan qty detail langsung dikalikan sf.qty (asumsi sf.qty = jumlah batch)
            // Kalau kamu punya rumus sendiri, ganti di sini.
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
              qty: qty, // decimal ok
            }),
          );
        }

        // =============================
        // 2) CREATE FINISHED GOOD + DETAILS
        // =============================
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

        // =============================
        // 3) APPLY STOCK OUT (SOURCE)
        // =============================
        if (input.sourceType === "raw_material") {
          for (const m of aggregatedMaterials) {
            await tx.rawMaterial.update({
              where: { id: m.rawMaterialId },
              data: { qty: { decrement: m.qty } },
            });

            // movement: production out raw material
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

            // movement: production out semi finished
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

        // =============================
        // 4) PRODUCTION IN (FINISHED GOOD)
        // =============================
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
        // =============================
        // 0) LOAD EXISTING (for restore)
        // =============================
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

        // =============================
        // 1) RESTORE OLD STOCK (IMPORTANT)
        // =============================
        // Restore raw materials that were consumed by old FG details
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

        // If old source was SEMI_FINISHED, restore semi finished consumption too
        // NOTE: kalau kamu belum nyimpen mapping konsumsi SFG di detail, opsi paling aman:
        // - restore hanya raw material via finishedGoodDetails (di atas)
        // - dan untuk semi finished, kamu perlu record konsumsi via StockMovement PRODUCTION_OUT itemType SEMI_FINISHED_GOOD refFinishedGoodId=...
        // Jadi kita restore via stockMovement query:
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

        // =============================
        // 2) DELETE OLD DETAILS
        // =============================
        await tx.finishedGoodDetail.deleteMany({
          where: { finishedGoodId: input.id },
        });

        // =============================
        // 3) RE-COMPUTE NEW CONSUMPTION
        // =============================
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

            // stok sudah direstore ke raw material sebelumnya, jadi validasi aman dilakukan sekarang
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

        // =============================
        // 4) UPDATE FINISHED GOOD + NEW DETAILS
        // =============================
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

        // =============================
        // 5) APPLY NEW STOCK OUT + MOVEMENTS
        // =============================
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

        // PRODUCTION IN (log latest as movement; audit trail)
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
