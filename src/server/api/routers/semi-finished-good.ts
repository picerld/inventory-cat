import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  semiFinishedGoodFormSchema,
  updateQtySchema,
} from "~/components/features/semi-finished/form/semi-finished";
import { toNumber } from "~/lib/utils";

/**
 * Catatan:
 * - qty SemiFinishedGood kamu = jumlah baris detail (jumlah bahan), BUKAN qty produk. (sesuai requirement kamu)
 * - qty bahan baku / stok boleh decimal (1.25, dst) -> pakai toNumber dan prisma Decimal increment/decrement aman.
 *
 * StockMovement:
 * - RAW_MATERIAL keluar: type = "SEMI_FINISHED_OUT"
 * - SEMI_FINISHED masuk: type = "SEMI_FINISHED_IN"
 * - Saat edit/delete (restore): type = "ADJUSTMENT"
 *
 * PENTING:
 * - Pastikan enum StockMovement.type kamu punya nilai2 ini,
 *   kalau beda, tinggal ganti stringnya sesuai enum di schema kamu.
 * - Pastikan StockMovement punya field:
 *   type, itemType, itemId, qty, userId, (opsional) refSemiFinishedGoodId
 *   Kalau nama field ref-nya beda, sesuaikan.
 */

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
          paintGrade: { select: { id: true, name: true } },
          SemiFinishedGoodDetail: { include: { rawMaterial: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalSemiFinishedGoods = await ctx.db.semiFinishedGood.count();

    const thisYearSemiFinishedGoods = await ctx.db.semiFinishedGood.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
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
          SemiFinishedGoodDetail: { include: { rawMaterial: true } },
        },
      },
    );

    const avgRawMaterialsPerGood =
      totalSemiFinishedGoods === 0
        ? 0
        : Number((totalDetails / totalSemiFinishedGoods).toFixed(1));

    const growth =
      totalSemiFinishedGoods === 0
        ? 0
        : Number(
            (
              (thisYearSemiFinishedGoods / totalSemiFinishedGoods) *
              100
            ).toFixed(1),
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
      growth,
      totalDetails,
      avgRawMaterialsPerGood,
      mostUsedRawMaterial: mostUsedRawMaterial?.name ?? null,
      mostUsedCount: mostUsedRawMaterialId
        ? rawMaterialUsage[mostUsedRawMaterialId]
        : 0,
    };
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.semiFinishedGood.findMany({
      include: {
        paintGrade: { select: { id: true, name: true } },
        SemiFinishedGoodDetail: { include: { rawMaterial: true } },
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
          paintGrade: { select: { id: true, name: true } },
          SemiFinishedGoodDetail: { include: { rawMaterial: true } },
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Barang setengah jadi tidak ditemukan",
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}`
        : "http://localhost:3000";

      const previewLink = `${baseUrl}/qr/semi-finished/${item.id}`;

      return {
        item,
        qrValue: previewLink,
        previewLink,
      };
    }),

  getCount: protectedProcedure.query(({ ctx }) =>
    ctx.db.semiFinishedGood.count(),
  ),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.semiFinishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          paintGrade: { select: { id: true, name: true } },
          SemiFinishedGoodDetail: { include: { rawMaterial: true } },
        },
      });
    }),

  /**
   * CREATE
   * - decrement RAW_MATERIAL qty
   * - create StockMovement (RAW out)
   * - create StockMovement (SFG in)
   */
  create: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(async (tx) => {
        // 1) cek stok cukup dulu
        for (const m of input.materials) {
          const rm = await tx.rawMaterial.findUnique({
            where: { id: m.rawMaterialId },
          });
          if (!rm) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Raw material not found",
            });
          }

          if (toNumber(rm.qty) < toNumber(m.qty)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
            });
          }
        }

        // 2) create SFG (qty = jumlah bahan/baris)
        const semiFinished = await tx.semiFinishedGood.create({
          data: {
            userId: input.userId,
            name: input.name,
            qty: input.materials.length,
            paintGradeId: input.paintGradeId,
            SemiFinishedGoodDetail: {
              create: input.materials.map((m) => ({
                rawMaterialId: m.rawMaterialId,
                qty: m.qty,
              })),
            },
          },
          include: {
            user: true,
            paintGrade: { select: { id: true, name: true } },
            SemiFinishedGoodDetail: { include: { rawMaterial: true } },
          },
        });

        // 3) decrement stock raw material + movement RAW OUT
        for (const m of input.materials) {
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
              refSemiFinishedGoodId: semiFinished.id,
            },
          });
        }

        // 4) movement SFG IN (audit bahwa SFG dibuat)
        await tx.stockMovement.create({
          data: {
            type: "PRODUCTION_IN",
            itemType: "SEMI_FINISHED_GOOD",
            itemId: semiFinished.id,
            qty: semiFinished.qty, // ini = jumlah bahan/baris
            userId,
            refSemiFinishedGoodId: semiFinished.id,
          },
        });

        return semiFinished;
      });
    }),

  /**
   * DELETE
   * - restore RAW_MATERIAL qty (increment)
   * - create StockMovement ADJUSTMENT per bahan
   * - (opsional) create StockMovement ADJUSTMENT untuk SFG (out)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(async (tx) => {
        const existing = await tx.semiFinishedGood.findUnique({
          where: { id: input.id },
          include: { SemiFinishedGoodDetail: true },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Barang setengah jadi tidak ditemukan",
          });
        }

        // restore stok raw material + movement
        for (const d of existing.SemiFinishedGoodDetail) {
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
              userId: userId || existing.userId,
              refSemiFinishedGoodId: existing.id,
            },
          });
        }

        // opsional: catat SFG "dibatalkan" (keluar)
        await tx.stockMovement.create({
          data: {
            type: "ADJUSTMENT",
            itemType: "SEMI_FINISHED_GOOD",
            itemId: existing.id,
            qty: existing.qty,
            userId: userId || existing.userId,
            refSemiFinishedGoodId: existing.id,
          },
        });

        await tx.semiFinishedGoodDetail.deleteMany({
          where: { semiFinishedGoodId: input.id },
        });

        return tx.semiFinishedGood.delete({ where: { id: input.id } });
      });
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // NOTE: bulk delete sebaiknya juga restore stok + movement,
      // tapi kamu sebelumnya delete langsung. Ini versi aman (loop).
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(async (tx) => {
        const rows = await tx.semiFinishedGood.findMany({
          where: { id: { in: input.ids } },
          include: { SemiFinishedGoodDetail: true },
        });

        for (const row of rows) {
          for (const d of row.SemiFinishedGoodDetail) {
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
                userId: userId || row.userId,
                refSemiFinishedGoodId: row.id,
              },
            });
          }

          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "SEMI_FINISHED_GOOD",
              itemId: row.id,
              qty: row.qty,
              userId: userId || row.userId,
              refSemiFinishedGoodId: row.id,
            },
          });
        }

        await tx.semiFinishedGoodDetail.deleteMany({
          where: { semiFinishedGoodId: { in: input.ids } },
        });

        return tx.semiFinishedGood.deleteMany({
          where: { id: { in: input.ids } },
        });
      });
    }),

  /**
   * UPDATE
   * Strategi:
   * - restore stok dari detail lama (increment) + movement ADJUSTMENT
   * - cek stok cukup utk detail baru
   * - replace details
   * - decrement stok detail baru + movement RAW OUT
   * - movement SFG IN (audit versi baru)
   */
  update: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID is required for update",
        });
      }

      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(async (tx) => {
        const existing = await tx.semiFinishedGood.findUnique({
          where: { id: input.id },
          include: { SemiFinishedGoodDetail: true },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Barang setengah jadi tidak ditemukan",
          });
        }

        // 1) restore stok dari detail lama + movement
        for (const d of existing.SemiFinishedGoodDetail) {
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
              refSemiFinishedGoodId: existing.id,
            },
          });
        }

        // 2) cek stok cukup utk detail baru (setelah restore)
        for (const m of input.materials) {
          const rm = await tx.rawMaterial.findUnique({
            where: { id: m.rawMaterialId },
          });

          if (!rm) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Raw material not found",
            });
          }

          if (toNumber(rm.qty) < toNumber(m.qty)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
            });
          }
        }

        // 3) replace details
        await tx.semiFinishedGoodDetail.deleteMany({
          where: { semiFinishedGoodId: input.id },
        });

        const updated = await tx.semiFinishedGood.update({
          where: { id: input.id },
          data: {
            userId: input.userId,
            name: input.name,
            paintGradeId: input.paintGradeId,
            qty: input.materials.length, // ✅ qty = jumlah bahan
            SemiFinishedGoodDetail: {
              create: input.materials.map((m) => ({
                rawMaterialId: m.rawMaterialId,
                qty: m.qty,
              })),
            },
          },
          include: {
            user: true,
            paintGrade: { select: { id: true, name: true } },
            SemiFinishedGoodDetail: { include: { rawMaterial: true } },
          },
        });

        // 4) decrement stok sesuai detail baru + movement RAW OUT
        for (const m of input.materials) {
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
              refSemiFinishedGoodId: updated.id,
            },
          });
        }

        // 5) audit: catat SFG "dibuat/diupdate" (masuk)
        await tx.stockMovement.create({
          data: {
            type: "PRODUCTION_IN",
            itemType: "SEMI_FINISHED_GOOD",
            itemId: updated.id,
            qty: updated.qty, // jumlah bahan/baris
            userId,
            refSemiFinishedGoodId: updated.id,
          },
        });

        return updated;
      });
    }),

  /**
   * UPDATE QTY (menambah konsumsi bahan di detail)
   * - decrement stok add.qty
   * - update/create detail (qty detail diakumulasi)
   * - update SFG.qty = jumlah baris detail
   * - movement RAW OUT untuk tiap add
   * - movement SFG IN (opsional) kalau baris detail bertambah (qty berubah)
   */
  updateQty: protectedProcedure
    .input(updateQtySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(async (tx) => {
        const current = await tx.semiFinishedGood.findUnique({
          where: { id: input.id },
          include: { SemiFinishedGoodDetail: true },
        });

        if (!current) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Barang setengah jadi tidak ditemukan",
          });
        }

        const beforeRowCount = current.SemiFinishedGoodDetail.length;

        // validate stok cukup untuk tambahan
        for (const add of input.materials) {
          const rm = await tx.rawMaterial.findUnique({
            where: { id: add.rawMaterialId },
          });
          if (!rm) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Raw material not found",
            });
          }

          if (toNumber(rm.qty) < toNumber(add.qty)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Stok ${rm.name} tidak mencukupi. Tersedia ${rm.qty}, Dibutuhkan ${add.qty}`,
            });
          }
        }

        // apply each additional material
        for (const add of input.materials) {
          // decrement stok
          await tx.rawMaterial.update({
            where: { id: add.rawMaterialId },
            data: { qty: { decrement: add.qty } },
          });

          // movement raw out (tambahan konsumsi)
          await tx.stockMovement.create({
            data: {
              type: "PRODUCTION_OUT",
              itemType: "RAW_MATERIAL",
              itemId: add.rawMaterialId,
              qty: add.qty,
              userId: userId || current.userId,
              refSemiFinishedGoodId: current.id,
            },
          });

          const existingDetail = current.SemiFinishedGoodDetail.find(
            (d) => d.rawMaterialId === add.rawMaterialId,
          );

          if (existingDetail) {
            await tx.semiFinishedGoodDetail.update({
              where: { id: existingDetail.id },
              data: { qty: toNumber(existingDetail.qty) + toNumber(add.qty) },
            });
          } else {
            await tx.semiFinishedGoodDetail.create({
              data: {
                semiFinishedGoodId: input.id,
                rawMaterialId: add.rawMaterialId,
                qty: add.qty,
              },
            });
          }
        }

        const updatedDetails = await tx.semiFinishedGoodDetail.findMany({
          where: { semiFinishedGoodId: input.id },
        });

        const afterRowCount = updatedDetails.length;

        const updatedSfg = await tx.semiFinishedGood.update({
          where: { id: input.id },
          data: { qty: afterRowCount }, // ✅ qty = jumlah baris detail
          include: {
            user: true,
            paintGrade: { select: { id: true, name: true } },
            SemiFinishedGoodDetail: { include: { rawMaterial: true } },
          },
        });

        // kalau jumlah baris bertambah, catat SFG IN (opsional tapi enak buat audit)
        if (afterRowCount !== beforeRowCount) {
          await tx.stockMovement.create({
            data: {
              type: "PRODUCTION_IN",
              itemType: "SEMI_FINISHED_GOOD",
              itemId: updatedSfg.id,
              qty: Math.abs(afterRowCount - beforeRowCount),
              userId: userId || updatedSfg.userId,
              refSemiFinishedGoodId: updatedSfg.id,
            },
          });
        }

        return updatedSfg;
      });
    }),
});
