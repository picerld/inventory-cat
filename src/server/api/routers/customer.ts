import { z } from "zod";
import { customerCreateSchema, customerUpdateSchema } from "~/components/features/customer/form/customer";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const customerRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.customer.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(customerCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.customer.create({
        data: {
          name: input.name,
          phone: input.phone ?? null,
          address: input.address ?? null,
        },
      });
    }),

  update: protectedProcedure
    .input(customerUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.customer.update({
        where: { id: input.id },
        data: {
          name: input.name,
          phone: input.phone ?? null,
          address: input.address ?? null,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // NOTE: because Customer has `sales` with onDelete: Cascade in your schema,
      // deleting a customer will delete related sales. Confirm business rule.
      return ctx.db.customer.delete({
        where: { id: input.id },
      });
    }),
});
