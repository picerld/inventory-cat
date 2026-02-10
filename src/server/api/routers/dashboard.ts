import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

function toNumber(val: unknown): number {
  if (val == null) return 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof val === "object" && typeof (val as any).toNumber === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (val as any).toNumber();
  }

  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
}

const SALE_COUNT_STATUSES = ["FINISHED"] as const;
const PURCHASE_COUNT_STATUSES = ["FINISHED"] as const;

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const startOfThisYear = startOfYear;
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const thisYearSelling = await ctx.db.sale.count({
      where: {
        status: { in: [...SALE_COUNT_STATUSES] },
        soldAt: { gte: startOfThisYear },
      },
    });

    const thisYearBuying = await ctx.db.purchase.count({
      where: {
        status: { in: [...PURCHASE_COUNT_STATUSES] },
        purchasedAt: { gte: startOfThisYear },
      },
    });

    const lastYearSelling = await ctx.db.sale.count({
      where: {
        status: { in: [...SALE_COUNT_STATUSES] },
        soldAt: { gte: startOfLastYear, lte: endOfLastYear },
      },
    });

    const lastYearBuying = await ctx.db.purchase.count({
      where: {
        status: { in: [...PURCHASE_COUNT_STATUSES] },
        purchasedAt: { gte: startOfLastYear, lte: endOfLastYear },
      },
    });

    const salesAggThisYear = await ctx.db.saleItem.aggregate({
      where: {
        sale: {
          status: { in: [...SALE_COUNT_STATUSES] },
          soldAt: { gte: startOfThisYear },
        },
      },
      _sum: { subtotal: true },
    });

    const totalRevenue = toNumber(salesAggThisYear._sum.subtotal);

    const salesAggLastYear = await ctx.db.saleItem.aggregate({
      where: {
        sale: {
          status: { in: [...SALE_COUNT_STATUSES] },
          soldAt: { gte: startOfLastYear, lte: endOfLastYear },
        },
      },
      _sum: { subtotal: true },
    });

    const lastYearRevenue = toNumber(salesAggLastYear._sum.subtotal);

    const sellingChange =
      lastYearSelling === 0
        ? thisYearSelling > 0
          ? 100
          : 0
        : ((thisYearSelling - lastYearSelling) / lastYearSelling) * 100;

    const buyingChange =
      lastYearBuying === 0
        ? thisYearBuying > 0
          ? 100
          : 0
        : ((thisYearBuying - lastYearBuying) / lastYearBuying) * 100;

    const revenueChange =
      lastYearRevenue === 0
        ? totalRevenue > 0
          ? 100
          : 0
        : ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100;

    const currentTotal = thisYearSelling + thisYearBuying;
    const lastYearTotal = lastYearSelling + lastYearBuying;

    const growthRate =
      lastYearTotal === 0
        ? currentTotal > 0
          ? 100
          : 0
        : ((currentTotal - lastYearTotal) / lastYearTotal) * 100;

    return {
      totalRevenue,
      revenueChange,
      thisYearSelling,
      sellingChange,
      thisYearBuying,
      buyingChange,
      growthRate,
    };
  }),

  getMonthlyRevenue: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const buckets = months.map((m) => ({ month: m, revenue: 0, orders: 0 }));

    const sales = await ctx.db.sale.findMany({
      where: {
        status: { in: [...SALE_COUNT_STATUSES] },
        soldAt: { gte: startOfYear, lt: startOfNextYear },
      },
      select: { soldAt: true },
    });

    for (const s of sales) {
      const idx = s.soldAt.getMonth();
      buckets[idx]!.orders += 1;
    }

    const items = await ctx.db.saleItem.findMany({
      where: {
        sale: {
          status: { in: [...SALE_COUNT_STATUSES] },
          soldAt: { gte: startOfYear, lt: startOfNextYear },
        },
      },
      select: {
        subtotal: true,
        sale: { select: { soldAt: true } },
      },
    });

    for (const it of items) {
      const idx = it.sale.soldAt.getMonth();
      buckets[idx]!.revenue += toNumber(it.subtotal);
    }

    return buckets;
  }),

  getTopCategories: protectedProcedure.query(async ({ ctx }) => {
    const saleItems = await ctx.db.saleItem.findMany({
      where: {
        sale: { status: { in: [...SALE_COUNT_STATUSES] } },
        itemType: "FINISHED_GOOD",
        finishedGoodId: { not: null },
      },
      select: {
        qty: true,
        finishedGood: {
          select: {
            finishedGoodDetails: {
              select: {
                qty: true,
                rawMaterial: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const map = new Map<string, number>();

    for (const item of saleItems) {
      const soldQty = toNumber(item.qty);

      const details = item.finishedGood?.finishedGoodDetails ?? [];
      for (const d of details) {
        const rmName = d.rawMaterial?.name ?? "Unknown";
        const usedPerProduct = toNumber(d.qty);

        const totalUsed = soldQty * usedPerProduct;

        map.set(rmName, (map.get(rmName) ?? 0) + totalUsed);
      }
    }

    const rows = [...map.entries()].map(([name, value]) => ({ name, value }));
    rows.sort((a, b) => b.value - a.value);

    const top = rows.slice(0, 8);

    const total = top.reduce((sum, r) => sum + r.value, 0);

    return top.map((r) => ({
      name: r.name,
      value: total > 0 ? Math.round((r.value / total) * 100) : 0,
    }));
  }),

  getRecentOrders: protectedProcedure.query(async ({ ctx }) => {
    const recentSales = await ctx.db.sale.findMany({
      take: 5,
      orderBy: { soldAt: "desc" },
      where: { status: { in: [...SALE_COUNT_STATUSES] } },
      include: {
        customer: true,
        items: true,
      },
    });

    return recentSales.map((sale) => {
      const amount = sale.items.reduce(
        (sum, it) => sum + toNumber(it.subtotal),
        0,
      );

      return {
        id: sale.saleNo,
        customer: sale.customer.name,
        amount: `Rp ${amount.toLocaleString("id-ID")}`,
        status: "completed" as const,
        time: getTimeAgo(sale.soldAt),
      };
    });
  }),

  getSalesStats: protectedProcedure.query(async ({ ctx }) => {
    const totalOrders = await ctx.db.sale.count();
    const completedOrders = await ctx.db.sale.count({
      where: { status: { in: [...SALE_COUNT_STATUSES] } },
    });

    const successRate =
      totalOrders > 0
        ? ((completedOrders / totalOrders) * 100).toFixed(1)
        : "0";

    const totalRevenueAgg = await ctx.db.saleItem.aggregate({
      where: { sale: { status: { in: [...SALE_COUNT_STATUSES] } } },
      _sum: { subtotal: true },
    });

    const totalRevenue = toNumber(totalRevenueAgg._sum.subtotal);
    const avgOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    const pendingItems = await ctx.db.returnedItem.count();

    const totalProducts =
      (await ctx.db.rawMaterial.count()) +
      (await ctx.db.semiFinishedGood.count()) +
      (await ctx.db.finishedGood.count()) +
      (await ctx.db.paintAccessories.count());

    return {
      successRate: `${successRate}%`,
      avgOrderValue,
      pendingItems,
      totalProducts,
    };
  }),
});
