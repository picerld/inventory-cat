import z from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { returnedGoodFormSchema } from "~/components/features/return/form/returned-good";
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

export const returnGoodRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: emptyToUndefined,
        filters: z
          .object({
            finishedGoodId: emptyToUndefined,
            from: emptyToUndefined,
          })
          .optional(),
        sort: z.array(sortItemSchema).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, filters, sort } = input;

      const where: Prisma.ReturnedItemWhereInput = {
        ...(search
          ? {
              OR: [
                { from: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                {
                  finishedGood: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),

        ...(filters?.finishedGoodId
          ? { finishedGoodId: filters.finishedGoodId }
          : {}),
        ...(filters?.from
          ? { from: { contains: filters.from, mode: "insensitive" } }
          : {}),
      };

      const ORDERABLE: Record<
        string,
        (dir: "asc" | "desc") => Prisma.ReturnedItemOrderByWithRelationInput
      > = {
        createdAt: (dir) => ({ createdAt: dir }),
        updatedAt: (dir) => ({ updatedAt: dir }),
        from: (dir) => ({ from: dir }),
        qty: (dir) => ({ qty: dir }),
        finishedGood: (dir) => ({ finishedGood: { name: dir } }),
        user: (dir) => ({ user: { name: dir } }),
      };

      const orderBy: Prisma.ReturnedItemOrderByWithRelationInput[] =
        sort?.length
          ? (sort
              .map((s) => {
                const dir: "asc" | "desc" = s.desc ? "desc" : "asc";
                const fn = ORDERABLE[s.id];
                return fn ? fn(dir) : null;
              })
              .filter(Boolean) as Prisma.ReturnedItemOrderByWithRelationInput[])
          : [{ createdAt: "desc" }];

      const totalItems = await ctx.db.returnedItem.count({ where });
      const lastPage = Math.max(1, Math.ceil(totalItems / perPage));

      const data = await ctx.db.returnedItem.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: { user: true, finishedGood: true },
        orderBy,
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.returnedItem.findMany({
      include: { user: true, finishedGood: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.returnedItem.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.returnedItem.findUnique({
        where: { id: input.id },
        include: { user: true, finishedGood: true },
      });
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Return not found" });
      }
      return item;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalReturnedGoods = await ctx.db.returnedItem.count();

    const thisYearReturnedGoods = await ctx.db.returnedItem.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
    });

    const growth =
      totalReturnedGoods === 0
        ? 0
        : ((thisYearReturnedGoods / totalReturnedGoods) * 100).toFixed(1);

    return {
      totalReturnedGoods,
      thisYearReturnedGoods,
      growth: Number(growth),
    };
  }),

  create: protectedProcedure
    .input(returnedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;
      const applyToStock = input.applyToStock ?? true;

      return ctx.db.$transaction(async (tx) => {
        const fg = await tx.finishedGood.findUnique({
          where: { id: input.finishedGoodId },
          select: { id: true },
        });
        if (!fg) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Finished good tidak ditemukan.",
          });
        }

        const created = await tx.returnedItem.create({
          data: {
            userId: input.userId,
            finishedGoodId: input.finishedGoodId,
            qty: input.qty,
            from: input.from,
            description: input.description,
          },
          include: { finishedGood: true, user: true },
        });

        if (applyToStock) {
          await tx.finishedGood.update({
            where: { id: input.finishedGoodId },
            data: { qty: { increment: input.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "RETURN_IN",
              itemType: "FINISHED_GOOD",
              itemId: input.finishedGoodId,
              qty: input.qty,
              refReturnId: created.id,
              userId,
            },
          });
        }

        return created;
      });
    }),

  update: protectedProcedure
    .input(returnedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id)
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID wajib." });

      const userId = ctx.user?.id ?? input.userId;
      const applyToStock = input.applyToStock ?? true;

      return ctx.db.$transaction(async (tx) => {
        const existing = await tx.returnedItem.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Return not found",
          });
        }

        const oldFgId = existing.finishedGoodId;
        const newFgId = input.finishedGoodId;

        const oldQty = toNumber(existing.qty);
        const newQty = toNumber(input.qty);

        const updated = await tx.returnedItem.update({
          where: { id: input.id },
          data: {
            userId: input.userId,
            finishedGoodId: input.finishedGoodId,
            qty: input.qty,
            from: input.from,
            description: input.description,
          },
          include: { finishedGood: true, user: true },
        });

        // kalau user pilih "hanya dicatat", kita stop di sini:
        if (!applyToStock) return updated;

        // === apply stock rules ===
        if (oldFgId !== newFgId) {
          // reverse old
          await tx.finishedGood.update({
            where: { id: oldFgId },
            data: { qty: { decrement: existing.qty } },
          });

          // apply new
          await tx.finishedGood.update({
            where: { id: newFgId },
            data: { qty: { increment: input.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "FINISHED_GOOD",
              itemId: oldFgId,
              qty: existing.qty,
              refReturnId: updated.id,
              userId,
            },
          });

          await tx.stockMovement.create({
            data: {
              type: "RETURN_IN",
              itemType: "FINISHED_GOOD",
              itemId: newFgId,
              qty: input.qty,
              refReturnId: updated.id,
              userId,
            },
          });

          return updated;
        }

        const delta = newQty - oldQty;
        if (delta !== 0) {
          if (delta > 0) {
            await tx.finishedGood.update({
              where: { id: newFgId },
              data: { qty: { increment: delta } },
            });

            await tx.stockMovement.create({
              data: {
                type: "RETURN_IN",
                itemType: "FINISHED_GOOD",
                itemId: newFgId,
                qty: delta,
                refReturnId: updated.id,
                userId,
              },
            });
          } else {
            const abs = Math.abs(delta);
            await tx.finishedGood.update({
              where: { id: newFgId },
              data: { qty: { decrement: abs } },
            });

            await tx.stockMovement.create({
              data: {
                type: "ADJUSTMENT",
                itemType: "FINISHED_GOOD",
                itemId: newFgId,
                qty: abs,
                refReturnId: updated.id,
                userId,
              },
            });
          }
        }

        return updated;
      });
    }),

  /**
   * DELETE RETURN
   * - reverse stock: decrement FinishedGood.qty by returned qty
   * - create StockMovement ADJUSTMENT (audit trail)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(async (tx) => {
        const existing = await tx.returnedItem.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Return not found",
          });
        }

        // reverse stock
        await tx.finishedGood.update({
          where: { id: existing.finishedGoodId },
          data: { qty: { decrement: existing.qty } },
        });

        // audit movement
        await tx.stockMovement.create({
          data: {
            type: "ADJUSTMENT",
            itemType: "FINISHED_GOOD",
            itemId: existing.finishedGoodId,
            qty: existing.qty,
            refReturnId: existing.id,
            userId: userId || existing.userId,
          },
        });

        try {
          return await tx.returnedItem.delete({ where: { id: input.id } });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Tidak dapat menghapus barang kembali karena terdapat relasi lain!",
            });
          }
          throw error;
        }
      });
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // SAFETY: for bulk delete, better do one-by-one with reversing stock.
      // Here I do safer transaction loop.

      const userId = ctx.user?.id ?? "";

      return ctx.db.$transaction(async (tx) => {
        const items = await tx.returnedItem.findMany({
          where: { id: { in: input.ids } },
        });

        for (const it of items) {
          await tx.finishedGood.update({
            where: { id: it.finishedGoodId },
            data: { qty: { decrement: it.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              itemType: "FINISHED_GOOD",
              itemId: it.finishedGoodId,
              qty: it.qty,
              refReturnId: it.id,
              userId: userId || it.userId,
            },
          });
        }

        return tx.returnedItem.deleteMany({
          where: { id: { in: input.ids } },
        });
      });
    }),
});
