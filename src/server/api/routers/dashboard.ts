import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  // DASHBOARD STATS [REVENUE, SELLING, BUYING, GROWTH]
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalSelling = await ctx.db.selling.count();
    const totalBuying = await ctx.db.buying.count();

    const thisYearSelling = await ctx.db.selling.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        }
      }
    });

    const thisYearBuying = await ctx.db.buying.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        }
      }
    });

    const thisYearRevenue = thisYearBuying + thisYearBuying;

    const growth = totalSelling === 0 ? 0 : ((thisYearSelling / totalSelling) * 100).toFixed(1);

    return {
      totalBuying,
      thisYearBuying,
      thisYearSelling,
      thisYearRevenue,
      growth: Number(growth),
    }
  }),
});