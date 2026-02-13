import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  semiFinishedGoodFormSchema,
  updateQtySchema,
} from "~/components/features/semi-finished/form/semi-finished";
import { toNumber } from "~/lib/utils";

const emptyToUndefined = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const sortItemSchema = z.object({
  id: z.string(),
  desc: z.boolean().optional().default(false),
});

function notFound(msg = "Data tidak ditemukan") {
  throw new TRPCError({ code: "NOT_FOUND", message: msg });
}

function badRequest(msg: string) {
  throw new TRPCError({ code: "BAD_REQUEST", message: msg });
}

export const semiFinishedGoodRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: emptyToUndefined,
        filters: z
          .object({
            name: emptyToUndefined,
            userId: z.array(z.string()).optional(),
          })
          .optional(),
        sort: z.array(sortItemSchema).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, filters, sort } = input;

      const where: Prisma.SemiFinishedGoodWhereInput = {
        ...(search
          ? {
              OR: [{ name: { contains: search, mode: "insensitive" } }],
            }
          : {}),
        ...(filters?.name
          ? { name: { contains: filters.name, mode: "insensitive" } }
          : {}),
        ...(filters?.userId?.length ? { userId: { in: filters.userId } } : {}),
      };

      const ORDERABLE: Record<
        string,
        (dir: "asc" | "desc") => Prisma.SemiFinishedGoodOrderByWithRelationInput
      > = {
        createdAt: (dir) => ({ createdAt: dir }),
        updatedAt: (dir) => ({ updatedAt: dir }),
        name: (dir) => ({ name: dir }),
        qty: (dir) => ({ qty: dir }),
      };

      const orderBy: Prisma.SemiFinishedGoodOrderByWithRelationInput[] =
        sort?.length
          ? (sort
              .map((s) => {
                const dir: "asc" | "desc" = s.desc ? "desc" : "asc";
                const fn = ORDERABLE[s.id];
                return fn ? fn(dir) : null;
              })
              .filter(
                Boolean,
              ) as Prisma.SemiFinishedGoodOrderByWithRelationInput[])
          : [{ createdAt: "desc" }];

      const totalItems = await ctx.db.semiFinishedGood.count({ where });
      const lastPage = Math.max(1, Math.ceil(totalItems / perPage));

      const data = await ctx.db.semiFinishedGood.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          user: true,
          paintGrade: { select: { id: true, name: true } },
          SemiFinishedGoodDetail: { include: { rawMaterial: true } },
        },
        orderBy,
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
        include: { SemiFinishedGoodDetail: { include: { rawMaterial: true } } },
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

      if (!item) notFound("Barang setengah jadi tidak ditemukan");

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}`
        : "http://localhost:3000";

      const previewLink = `${baseUrl}/qr/semi-finished/${item?.id}`;

      return { item, qrValue: previewLink, previewLink };
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
   * CREATE (Fixed)
   * - validate stock (prefetch)
   * - create SFG + details
   * - decrement stock RAW (atomic guard)
   * - create StockMovement RAW OUT
   * - create StockMovement SFG IN
   */
  create: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(
        async (tx) => {
          const ids = input.materials.map((m) => m.rawMaterialId);

          // prefetch all raw materials
          const rms = await tx.rawMaterial.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, qty: true },
          });

          const rmMap = new Map(rms.map((r) => [r.id, r]));

          // validate existence + stock enough (read check)
          for (const m of input.materials) {
            const rm = rmMap.get(m.rawMaterialId);
            if (!rm) notFound("Raw material not found");

            if (toNumber(rm?.qty) < toNumber(m.qty)) {
              badRequest(
                `Stok ${rm?.name} tidak cukup. Tersedia ${rm?.qty}, butuh ${m.qty}`,
              );
            }
          }

          const semiFinished = await tx.semiFinishedGood.create({
            data: {
              userId: input.userId,
              name: input.name,
              qty: input.materials.length, // qty = jumlah baris detail
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

          // decrement stocks with atomic guard + create RAW OUT movement
          for (const m of input.materials) {
            const updatedCount = await tx.rawMaterial.updateMany({
              where: {
                id: m.rawMaterialId,
                qty: { gte: m.qty }, // ✅ guard stok cukup (atomic)
              },
              data: { qty: { decrement: m.qty } },
            });

            if (updatedCount.count !== 1) {
              const rm = rmMap.get(m.rawMaterialId);
              badRequest(
                `Stok ${rm?.name ?? "bahan"} berubah/kurang saat diproses. Coba refresh dan ulangi.`,
              );
            }

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

          await tx.stockMovement.create({
            data: {
              type: "PRODUCTION_IN",
              itemType: "SEMI_FINISHED_GOOD",
              itemId: semiFinished.id,
              qty: semiFinished.qty,
              userId,
              refSemiFinishedGoodId: semiFinished.id,
            },
          });

          return semiFinished;
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * DELETE (Fixed)
   * - restore RAW_MATERIAL qty (increment)
   * - create StockMovement ADJUSTMENT per bahan
   * - create StockMovement ADJUSTMENT untuk SFG
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(
        async (tx) => {
          const existing = await tx.semiFinishedGood.findUnique({
            where: { id: input.id },
            include: { SemiFinishedGoodDetail: true },
          });

          if (!existing) notFound("Barang setengah jadi tidak ditemukan");

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
                userId: userId || existing?.userId,
                refSemiFinishedGoodId: existing?.id,
              },
            });
          }

          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "SEMI_FINISHED_GOOD",
              itemId: existing?.id,
              qty: existing?.qty,
              userId: userId || existing?.userId,
              refSemiFinishedGoodId: existing?.id,
            },
          });

          await tx.semiFinishedGoodDetail.deleteMany({
            where: { semiFinishedGoodId: input.id },
          });

          return tx.semiFinishedGood.delete({ where: { id: input.id } });
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(
        async (tx) => {
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
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * UPDATE (Fixed)
   * - restore stok dari detail lama
   * - validate stok untuk detail baru
   * - replace details
   * - decrement stok baru (atomic guard)
   * - create movements
   */
  update: protectedProcedure
    .input(semiFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) badRequest("ID is required for update");
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(
        async (tx) => {
          const existing = await tx.semiFinishedGood.findUnique({
            where: { id: input.id },
            include: { SemiFinishedGoodDetail: true },
          });
          if (!existing) notFound("Barang setengah jadi tidak ditemukan");

          // restore old details
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

          // prefetch for validation after restore
          const ids = input.materials.map((m) => m.rawMaterialId);
          const rms = await tx.rawMaterial.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, qty: true },
          });
          const rmMap = new Map(rms.map((r) => [r.id, r]));

          for (const m of input.materials) {
            const rm = rmMap.get(m.rawMaterialId);
            if (!rm) notFound("Raw material not found");
            if (toNumber(rm.qty) < toNumber(m.qty)) {
              badRequest(
                `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
              );
            }
          }

          await tx.semiFinishedGoodDetail.deleteMany({
            where: { semiFinishedGoodId: input.id },
          });

          const updated = await tx.semiFinishedGood.update({
            where: { id: input.id },
            data: {
              userId: input.userId,
              name: input.name,
              paintGradeId: input.paintGradeId,
              qty: input.materials.length,
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

          // decrement new usage with atomic guard
          for (const m of input.materials) {
            const updatedCount = await tx.rawMaterial.updateMany({
              where: { id: m.rawMaterialId, qty: { gte: m.qty } },
              data: { qty: { decrement: m.qty } },
            });

            if (updatedCount.count !== 1) {
              const rm = rmMap.get(m.rawMaterialId);
              badRequest(
                `Stok ${rm?.name ?? "bahan"} berubah/kurang saat diproses. Coba refresh dan ulangi.`,
              );
            }

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

          await tx.stockMovement.create({
            data: {
              type: "PRODUCTION_IN",
              itemType: "SEMI_FINISHED_GOOD",
              itemId: updated.id,
              qty: updated.qty,
              userId,
              refSemiFinishedGoodId: updated.id,
            },
          });

          return updated;
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * UPDATE QTY (Fixed)
   * - validate stok (prefetch)
   * - decrement stok (atomic guard)
   * - update/create detail
   * - update qty SFG = jumlah baris detail
   */
  updateQty: protectedProcedure
    .input(updateQtySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(
        async (tx) => {
          const current = await tx.semiFinishedGood.findUnique({
            where: { id: input.id },
            include: { SemiFinishedGoodDetail: true },
          });

          if (!current) notFound("Barang setengah jadi tidak ditemukan");

          const beforeRowCount = current.SemiFinishedGoodDetail.length;

          const ids = input.materials.map((m) => m.rawMaterialId);
          const rms = await tx.rawMaterial.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, qty: true },
          });
          const rmMap = new Map(rms.map((r) => [r.id, r]));

          for (const add of input.materials) {
            const rm = rmMap.get(add.rawMaterialId);
            if (!rm) notFound("Raw material not found");
            if (toNumber(rm.qty) < toNumber(add.qty)) {
              badRequest(
                `Stok ${rm.name} tidak mencukupi. Tersedia ${rm.qty}, Dibutuhkan ${add.qty}`,
              );
            }
          }

          for (const add of input.materials) {
            const updatedCount = await tx.rawMaterial.updateMany({
              where: { id: add.rawMaterialId, qty: { gte: add.qty } },
              data: { qty: { decrement: add.qty } },
            });

            if (updatedCount.count !== 1) {
              const rm = rmMap.get(add.rawMaterialId);
              badRequest(
                `Stok ${rm?.name ?? "bahan"} berubah/kurang saat diproses. Coba refresh dan ulangi.`,
              );
            }

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

          const afterRowCount = await tx.semiFinishedGoodDetail.count({
            where: { semiFinishedGoodId: input.id },
          });

          const updatedSfg = await tx.semiFinishedGood.update({
            where: { id: input.id },
            data: { qty: afterRowCount },
            include: {
              user: true,
              paintGrade: { select: { id: true, name: true } },
              SemiFinishedGoodDetail: { include: { rawMaterial: true } },
            },
          });

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
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),
});
