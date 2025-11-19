import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { supplierFormSchema } from "~/components/features/supplier/form/supplier";

export const supplierRouter = createTRPCRouter({
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

      const where: import("@prisma/client").Prisma.SupplierWhereInput = search
        ? {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const totalItems = await ctx.db.supplier.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.supplier.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
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
    return ctx.db.supplier.findMany();
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.supplier.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.supplier.findUnique({ where: { id: input.id } });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalSuppliers = await ctx.db.supplier.count();

    const thisYearSuppliers = await ctx.db.supplier.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const growth =
      totalSuppliers === 0
        ? 0
        : ((thisYearSuppliers / totalSuppliers) * 100).toFixed(1);

    return {
      totalSuppliers,
      thisYearSuppliers,
      growth: Number(growth),
    };
  }),

  create: protectedProcedure
    .input(supplierFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.supplier.create({
        data: { name: input.name, description: input.description },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.supplier.delete({
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
              "Tidak dapat menghapus kategori karena terdapat item di dalamnya!",
          });
        }
        throw error;
      }
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.supplier.deleteMany({ where: { id: { in: input.ids } } });
    }),

  update: protectedProcedure
    .input(supplierFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.supplier.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
});
