import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { finishedGoodFormSchema } from "~/components/features/finished/form/finished-good";
import { toNumber } from "~/lib/utils";
import { calculateFinishedGoodCost } from "~/server/service/costing";

const emptyToUndefined = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const sortItemSchema = z.object({
  id: z.string(),
  desc: z.boolean().optional().default(false),
});

function notFound(message: string) {
  throw new TRPCError({ code: "NOT_FOUND", message });
}

function badRequest(message: string) {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

export const finishedGoodRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: emptyToUndefined,
        filters: z
          .object({
            name: emptyToUndefined,
            paintGradeId: z.array(z.string()).optional(),
          })
          .optional(),
        sort: z.array(sortItemSchema).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, filters, sort } = input;

      const where: Prisma.FinishedGoodWhereInput = {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { productionCode: { contains: search, mode: "insensitive" } },
                { batchNumber: { contains: search, mode: "insensitive" } },
                {
                  paintGrade: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
                { user: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(filters?.name
          ? { name: { contains: filters.name, mode: "insensitive" } }
          : {}),
        ...(filters?.paintGradeId?.length
          ? { paintGradeId: { in: filters.paintGradeId } }
          : {}),
      };

      const ORDERABLE: Record<
        string,
        (dir: "asc" | "desc") => Prisma.FinishedGoodOrderByWithRelationInput
      > = {
        createdAt: (dir) => ({ createdAt: dir }),
        updatedAt: (dir) => ({ updatedAt: dir }),
        name: (dir) => ({ name: dir }),
        qty: (dir) => ({ qty: dir }),
        productionCode: (dir) => ({ productionCode: dir }),
        batchNumber: (dir) => ({ batchNumber: dir }),
        dateProduced: (dir) => ({ dateProduced: dir }),
        paintGrade: (dir) => ({ paintGrade: { name: dir } }),
        user: (dir) => ({ user: { name: dir } }),
      };

      const orderBy: Prisma.FinishedGoodOrderByWithRelationInput[] =
        sort?.length
          ? (sort
              .map((s) => {
                const dir: "asc" | "desc" = s.desc ? "desc" : "asc";
                const fn = ORDERABLE[s.id];
                return fn ? fn(dir) : null;
              })
              .filter(Boolean) as Prisma.FinishedGoodOrderByWithRelationInput[])
          : [{ createdAt: "desc" }];

      const totalItems = await ctx.db.finishedGood.count({ where });
      const lastPage = Math.max(1, Math.ceil(totalItems / perPage));

      const data = await ctx.db.finishedGood.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          user: true,
          paintGrade: true,
          finishedGoodDetails: { include: { rawMaterial: true } },
        },
        orderBy,
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalFinishedGoods = await ctx.db.finishedGood.count();

    const thisYearFinishedGoods = await ctx.db.finishedGood.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
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
      include: { finishedGoodDetails: { include: { rawMaterial: true } } },
    });

    const avgRawMaterialsPerGood =
      totalFinishedGoods === 0
        ? 0
        : Number((totalDetails / totalFinishedGoods).toFixed(1));

    const growth =
      totalFinishedGoods === 0
        ? 0
        : Number(
            ((thisYearFinishedGoods / totalFinishedGoods) * 100).toFixed(1),
          );

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
    return ctx.db.finishedGood.findMany({
      include: {
        paintGrade: true,
        finishedGoodDetails: { include: { rawMaterial: true } },
      },
    });
  }),

  getQRData: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.finishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { name: true } },
          paintGrade: { select: { id: true, name: true } },
          finishedGoodDetails: {
            include: {
              semiFinishedGood: { select: { name: true, qty: true } },
              rawMaterial: {
                select: {
                  name: true,
                  supplier: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (!item) notFound("Barang jadi tidak ditemukan");

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}`
        : "http://localhost:3000";

      const previewLink = `${baseUrl}/qr/finished-good/${item.id}`;

      return { item, qrValue: previewLink, previewLink };
    }),

  getCount: protectedProcedure.query(({ ctx }) => ctx.db.finishedGood.count()),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.finishedGood.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          paintGrade: true,
          finishedGoodDetails: { include: { rawMaterial: true } },
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

      if (!fg)
        notFound("Barang jadi tidak ditemukan dari barcode/productionCode.");
      return fg;
    }),

  getCostPrice: protectedProcedure
    .input(z.object({ finishedGoodId: z.string() }))
    .query(async ({ input }) => {
      const cost = await calculateFinishedGoodCost(input.finishedGoodId);
      return { cost };
    }),

  /**
   * CREATE (Fixed)
   * - prefetch + validate
   * - create finishedGood + details
   * - decrement stocks with atomic guard (updateMany qty>=)
   * - movements OUT (raw / semi-finished)
   * - movement IN (finished good)
   */
  create: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(
        async (tx) => {
          const sourceTypeUpper = input.sourceType.toUpperCase() as
            | "RAW_MATERIAL"
            | "SEMI_FINISHED";

          let aggregatedMaterials: { rawMaterialId: string; qty: number }[] =
            [];
          let consumedSemiFinished: {
            semiFinishedGoodId: string;
            qty: number;
          }[] = [];

          // ============ SOURCE: RAW MATERIAL ============
          if (input.sourceType === "raw_material") {
            if (!input.materials?.length) {
              badRequest("Materials wajib untuk source raw_material");
            }

            const rmIds = input.materials.map((m) => m.rawMaterialId);
            const rms = await tx.rawMaterial.findMany({
              where: { id: { in: rmIds } },
              select: { id: true, name: true, qty: true },
            });
            const rmMap = new Map(rms.map((r) => [r.id, r]));

            for (const m of input.materials) {
              const rm = rmMap.get(m.rawMaterialId);
              if (!rm) notFound("Raw material tidak ditemukan");
              if (toNumber(rm.qty) < toNumber(m.qty)) {
                badRequest(
                  `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
                );
              }
            }

            aggregatedMaterials = input.materials.map((m) => ({
              rawMaterialId: m.rawMaterialId,
              qty: toNumber(m.qty),
            }));
          }

          // ============ SOURCE: SEMI FINISHED ============
          if (input.sourceType === "semi_finished") {
            if (!input.semiFinishedGoods?.length) {
              badRequest("semiFinishedGoods wajib untuk source semi_finished");
            }

            const sfgIds = input.semiFinishedGoods.map(
              (x) => x.semiFinishedGoodId,
            );

            const sfgRows = await tx.semiFinishedGood.findMany({
              where: { id: { in: sfgIds } },
              select: { id: true, name: true, qty: true },
            });

            const sfgMap = new Map(sfgRows.map((r) => [r.id, r]));

            for (const sf of input.semiFinishedGoods) {
              const sfg = sfgMap.get(sf.semiFinishedGoodId);
              if (!sfg) notFound("Semi finished good tidak ditemukan");
              if (toNumber(sfg.qty) < toNumber(sf.qty)) {
                badRequest(
                  `Stok ${sfg.name} tidak cukup. Tersedia ${sfg.qty}, butuh ${sf.qty}`,
                );
              }
            }

            consumedSemiFinished = input.semiFinishedGoods.map((sf) => ({
              semiFinishedGoodId: sf.semiFinishedGoodId,
              qty: toNumber(sf.qty),
            }));

            // ambil detail semi-finished untuk agregasi bahan baku
            const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
              where: { id: { in: sfgIds } },
              include: { SemiFinishedGoodDetail: true },
            });

            const rmAgg = new Map<string, number>();
            for (const sf of input.semiFinishedGoods) {
              const sfg = semiFinishedWithDetails.find(
                (x) => x.id === sf.semiFinishedGoodId,
              );
              if (!sfg) continue;

              for (const d of sfg.SemiFinishedGoodDetail) {
                const add = toNumber(d.qty) * toNumber(sf.qty);
                rmAgg.set(
                  d.rawMaterialId,
                  (rmAgg.get(d.rawMaterialId) ?? 0) + add,
                );
              }
            }

            aggregatedMaterials = Array.from(rmAgg.entries()).map(
              ([rawMaterialId, qty]) => ({
                rawMaterialId,
                qty,
              }),
            );

            // validasi stok raw material hasil agregasi (prefetch)
            const rmIds = aggregatedMaterials.map((m) => m.rawMaterialId);
            const rms = await tx.rawMaterial.findMany({
              where: { id: { in: rmIds } },
              select: { id: true, name: true, qty: true },
            });
            const rmMap = new Map(rms.map((r) => [r.id, r]));

            for (const m of aggregatedMaterials) {
              const rm = rmMap.get(m.rawMaterialId);
              if (!rm) notFound("Raw material tidak ditemukan");
              if (toNumber(rm.qty) < toNumber(m.qty)) {
                badRequest(
                  `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
                );
              }
            }
          }

          // create FG + details (rawMaterial only)
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

          // consume RAW MATERIAL (both source types end up consuming raw)
          for (const m of aggregatedMaterials) {
            const res = await tx.rawMaterial.updateMany({
              where: { id: m.rawMaterialId, qty: { gte: m.qty } },
              data: { qty: { decrement: m.qty } },
            });
            if (res.count !== 1) {
              badRequest(
                "Stok raw material berubah/kurang saat diproses. Silakan refresh dan coba lagi.",
              );
            }

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

          // consume SEMI FINISHED (if applicable)
          if (input.sourceType === "semi_finished") {
            for (const sf of consumedSemiFinished) {
              const res = await tx.semiFinishedGood.updateMany({
                where: { id: sf.semiFinishedGoodId, qty: { gte: sf.qty } },
                data: { qty: { decrement: sf.qty } },
              });
              if (res.count !== 1) {
                badRequest(
                  "Stok semi-finished berubah/kurang saat diproses. Silakan refresh dan coba lagi.",
                );
              }

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

          // finished good IN
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
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * UPDATE (Fixed)
   * - restore raw material dari details lama + ADJUSTMENT
   * - restore semi-finished (kalau source lama SEMI_FINISHED) dari movement lama + ADJUSTMENT
   * - replace details
   * - decrement raw material (atomic guard) + movements
   * - decrement semi-finished (atomic guard) + movements (kalau input semi_finished)
   * - movement IN FG
   */
  update: protectedProcedure
    .input(finishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) badRequest("ID is required for update operation");
      const userId = ctx.user?.id ?? input.userId;

      return ctx.db.$transaction(
        async (tx) => {
          const existing = await tx.finishedGood.findUnique({
            where: { id: input.id },
            include: { finishedGoodDetails: true },
          });
          if (!existing) notFound("Finished good not found");

          // 1) restore raw materials from old details
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

          // 2) restore semi-finished if old sourceType SEMI_FINISHED
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

          // 3) delete old details
          await tx.finishedGoodDetail.deleteMany({
            where: { finishedGoodId: input.id },
          });

          const sourceTypeUpper = input.sourceType.toUpperCase() as
            | "RAW_MATERIAL"
            | "SEMI_FINISHED";

          let aggregatedMaterials: { rawMaterialId: string; qty: number }[] =
            [];
          let consumedSemiFinished: {
            semiFinishedGoodId: string;
            qty: number;
          }[] = [];

          // === build consumption from input (same as create) ===
          if (input.sourceType === "raw_material") {
            if (!input.materials?.length)
              badRequest("Materials wajib untuk source raw_material");

            const rmIds = input.materials.map((m) => m.rawMaterialId);
            const rms = await tx.rawMaterial.findMany({
              where: { id: { in: rmIds } },
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

            aggregatedMaterials = input.materials.map((m) => ({
              rawMaterialId: m.rawMaterialId,
              qty: toNumber(m.qty),
            }));
          }

          if (input.sourceType === "semi_finished") {
            if (!input.semiFinishedGoods?.length)
              badRequest("semiFinishedGoods wajib untuk source semi_finished");

            const sfgIds = input.semiFinishedGoods.map(
              (x) => x.semiFinishedGoodId,
            );

            const sfgRows = await tx.semiFinishedGood.findMany({
              where: { id: { in: sfgIds } },
              select: { id: true, name: true, qty: true },
            });
            const sfgMap = new Map(sfgRows.map((r) => [r.id, r]));

            for (const sf of input.semiFinishedGoods) {
              const sfg = sfgMap.get(sf.semiFinishedGoodId);
              if (!sfg) notFound("Semi finished not found");
              if (toNumber(sfg.qty) < toNumber(sf.qty)) {
                badRequest(
                  `Stok ${sfg.name} tidak cukup. Tersedia ${sfg.qty}, butuh ${sf.qty}`,
                );
              }
            }

            consumedSemiFinished = input.semiFinishedGoods.map((sf) => ({
              semiFinishedGoodId: sf.semiFinishedGoodId,
              qty: toNumber(sf.qty),
            }));

            const semiFinishedWithDetails = await tx.semiFinishedGood.findMany({
              where: { id: { in: sfgIds } },
              include: { SemiFinishedGoodDetail: true },
            });

            const rmAgg = new Map<string, number>();
            for (const sf of input.semiFinishedGoods) {
              const sfg = semiFinishedWithDetails.find(
                (x) => x.id === sf.semiFinishedGoodId,
              );
              if (!sfg) continue;

              for (const d of sfg.SemiFinishedGoodDetail) {
                const add = toNumber(d.qty) * toNumber(sf.qty);
                rmAgg.set(
                  d.rawMaterialId,
                  (rmAgg.get(d.rawMaterialId) ?? 0) + add,
                );
              }
            }

            aggregatedMaterials = Array.from(rmAgg.entries()).map(
              ([rawMaterialId, qty]) => ({
                rawMaterialId,
                qty,
              }),
            );

            const rmIds = aggregatedMaterials.map((m) => m.rawMaterialId);
            const rms = await tx.rawMaterial.findMany({
              where: { id: { in: rmIds } },
              select: { id: true, name: true, qty: true },
            });
            const rmMap = new Map(rms.map((r) => [r.id, r]));

            for (const m of aggregatedMaterials) {
              const rm = rmMap.get(m.rawMaterialId);
              if (!rm) notFound("Raw material tidak ditemukan");
              if (toNumber(rm.qty) < toNumber(m.qty)) {
                badRequest(
                  `Stok ${rm.name} tidak cukup. Tersedia ${rm.qty}, butuh ${m.qty}`,
                );
              }
            }
          }

          // 4) update FG master + recreate details
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

          // 5) consume raw materials (atomic guard)
          for (const m of aggregatedMaterials) {
            const res = await tx.rawMaterial.updateMany({
              where: { id: m.rawMaterialId, qty: { gte: m.qty } },
              data: { qty: { decrement: m.qty } },
            });
            if (res.count !== 1) {
              badRequest(
                "Stok raw material berubah/kurang saat diproses. Silakan refresh dan coba lagi.",
              );
            }

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

          // 6) consume semi-finished if needed (atomic guard)
          if (input.sourceType === "semi_finished") {
            for (const sf of consumedSemiFinished) {
              const res = await tx.semiFinishedGood.updateMany({
                where: { id: sf.semiFinishedGoodId, qty: { gte: sf.qty } },
                data: { qty: { decrement: sf.qty } },
              });
              if (res.count !== 1) {
                badRequest(
                  "Stok semi-finished berubah/kurang saat diproses. Silakan refresh dan coba lagi.",
                );
              }

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

          // 7) FG IN (audit)
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
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * DELETE (Fixed)
   * - restore raw material dari details + movement adjustment
   * - restore semi-finished (kalau source SEMI_FINISHED) dari movement out + adjustment
   * - delete details + delete master
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(
        async (tx) => {
          const existing = await tx.finishedGood.findUnique({
            where: { id: input.id },
            include: { finishedGoodDetails: true },
          });
          if (!existing) notFound("Finished good not found");

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
            where: { finishedGoodId: existing.id },
          });

          // optional: log FG adjustment out (kalau mau audit)
          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "FINISHED_GOOD",
              itemId: existing.id,
              qty: existing.qty,
              userId,
              refFinishedGoodId: existing.id,
            },
          });

          return tx.finishedGood.delete({ where: { id: existing.id } });
        },
        { maxWait: 10_000, timeout: 60_000 },
      );
    }),

  /**
   * DELETE MANY (Fixed)
   * - loop restore per FG (aman, tapi bisa berat kalau ids banyak)
   */
  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(
        async (tx) => {
          const rows = await tx.finishedGood.findMany({
            where: { id: { in: input.ids } },
            include: { finishedGoodDetails: true },
          });

          for (const fg of rows) {
            for (const d of fg.finishedGoodDetails) {
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
                  refFinishedGoodId: fg.id,
                },
              });
            }

            if (fg.sourceType === "SEMI_FINISHED") {
              const oldSfMoves = await tx.stockMovement.findMany({
                where: {
                  refFinishedGoodId: fg.id,
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
                    refFinishedGoodId: fg.id,
                    refSemiFinishedGoodId: mv.itemId,
                  },
                });
              }
            }

            await tx.stockMovement.create({
              data: {
                type: "ADJUSTMENT",
                itemType: "FINISHED_GOOD",
                itemId: fg.id,
                qty: fg.qty,
                userId,
                refFinishedGoodId: fg.id,
              },
            });
          }

          await tx.finishedGoodDetail.deleteMany({
            where: { finishedGoodId: { in: input.ids } },
          });

          return tx.finishedGood.deleteMany({
            where: { id: { in: input.ids } },
          });
        },
        { maxWait: 10_000, timeout: 120_000 },
      );
    }),
});
