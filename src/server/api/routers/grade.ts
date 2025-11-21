import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { gradeFormSchema } from "~/components/features/grade/form/grade";

export const gradeRouter = createTRPCRouter({
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

      const where: import("@prisma/client").Prisma.PaintGradeWhereInput = search
        ? {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const totalItems = await ctx.db.paintGrade.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.paintGrade.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          rawMaterials: true,
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
    return ctx.db.paintGrade.findMany();
  }),

  getCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.paintGrade.count();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.paintGrade.findUnique({ where: { id: input.id } });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalGrades = await ctx.db.paintGrade.count();

    const thisYearGrades = await ctx.db.paintGrade.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const growth =
      totalGrades === 0
        ? 0
        : ((thisYearGrades / totalGrades) * 100).toFixed(1);

    return {
      totalGrades,
      thisYearGrades,
      growth: Number(growth),
    };
  }),

  create: protectedProcedure
    .input(gradeFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.paintGrade.create({
        data: { name: input.name, description: input.description },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.paintGrade.delete({
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
      return ctx.db.paintGrade.deleteMany({ where: { id: { in: input.ids } } });
    }),

  update: protectedProcedure
    .input(gradeFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.paintGrade.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
});
