import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { returnedGoodFormSchema } from "~/components/features/return/form/returned-good";

export const returnGoodRouter = createTRPCRouter({
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

      const where: import("@prisma/client").Prisma.ReturnedItemWhereInput =
        search
          ? {
              finishedGood: {
                name: { contains: search, mode: "insensitive" },
              },
            }
          : {};

      const totalItems = await ctx.db.returnedItem.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.returnedItem.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          user: true,
          finishedGood: true,
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

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.returnedItem.findMany();
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.returnedItem.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.returnedItem.findUnique({ where: { id: input.id } });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalReturnedGoods = await ctx.db.returnedItem.count();

    const thisYearReturnedGoods = await ctx.db.returnedItem.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
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
    .mutation(({ ctx, input }) => {
      return ctx.db.returnedItem.create({
        data: {
          userId: input.userId,
          finishedGoodId: input.finishedGoodId,
          qty: input.qty,
          from: input.from,
          description: input.description,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.returnedItem.delete({
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
              "Tidak dapat menghapus barang kembali karena terdapat item di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.returnedItem.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  update: protectedProcedure
    .input(returnedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.returnedItem.update({
        where: { id: input.id },
        data: {
          userId: input.userId,
          finishedGoodId: input.finishedGoodId,
          qty: input.qty,
          from: input.from,
          description: input.description,
        },
      });
    }),
});
