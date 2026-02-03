import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Prisma } from "@prisma/client";

export const customerRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search } = input;

      const where: Prisma.CustomerWhereInput = search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {};

      const totalItems = await ctx.db.customer.count({ where });
      const lastPage = Math.ceil(totalItems / pageSize);
      const data = await ctx.db.customer.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: { createdAt: "desc" },
      });
      return { data, lastPage };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return data;
  }),
});
