import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Aman untuk Prisma Decimal / number / string
 */
function toNumber(val: unknown): number {
  if (val == null) return 0;

  // Prisma.Decimal punya toNumber()
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

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    // ✅ schema kamu: Sale & Purchase
    const thisYearSelling = await ctx.db.sale.count({
      where: { soldAt: { gte: startOfYear } },
    });

    const thisYearBuying = await ctx.db.purchase.count({
      where: { purchasedAt: { gte: startOfYear } },
    });

    const lastYearSelling = await ctx.db.sale.count({
      where: { soldAt: { gte: startOfLastYear, lte: endOfLastYear } },
    });

    const lastYearBuying = await ctx.db.purchase.count({
      where: { purchasedAt: { gte: startOfLastYear, lte: endOfLastYear } },
    });

    /**
     * TOTAL REVENUE (lebih “bener”):
     * ambil dari SaleItem.subtotal (Float) dan status POSTED
     */
    const salesAgg = await ctx.db.saleItem.aggregate({
      where: {
        sale: {
          status: "POSTED",
          soldAt: { gte: startOfYear },
        },
      },
      _sum: { subtotal: true },
    });

    const totalRevenue = toNumber(salesAgg._sum.subtotal);

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
      revenueChange: sellingChange, // kamu pakai ini di UI "Total Revenue" change
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

    const monthlyData = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 0, 23, 59, 59);

        // orders = jumlah sale (POSTED) per bulan
        const orders = await ctx.db.sale.count({
          where: {
            status: "POSTED",
            soldAt: { gte: startDate, lte: endDate },
          },
        });

        // revenue = sum subtotal sale items per bulan
        const agg = await ctx.db.saleItem.aggregate({
          where: {
            sale: {
              status: "POSTED",
              soldAt: { gte: startDate, lte: endDate },
            },
          },
          _sum: { subtotal: true },
        });

        return {
          month,
          revenue: toNumber(agg._sum.subtotal),
          orders,
        };
      }),
    );

    return monthlyData;
  }),

  /**
   * Top Categories:
   * Aku keep konsep kamu: pakai PaintGrade -> finishedGoods count.
   * (ini bukan sales category, tapi “kategori produksi/produk”.)
   */
  getTopCategories: protectedProcedure.query(async ({ ctx }) => {
    const paintGrades = await ctx.db.paintGrade.findMany({
      include: { finishedGoods: true },
    });

    const categoryData = paintGrades.map((grade) => ({
      name: grade.name,
      value: grade.finishedGoods.length,
    }));

    const topCategories = categoryData
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const total = topCategories.reduce((sum, cat) => sum + cat.value, 0);

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--primary) / 0.8)",
      "hsl(var(--primary) / 0.6)",
      "hsl(var(--primary) / 0.4)",
    ];

    return topCategories.map((cat, index) => ({
      name: cat.name,
      value: total > 0 ? Math.round((cat.value / total) * 100) : 0,
      fill: colors[index] ?? colors[0],
    }));
  }),

  getRecentOrders: protectedProcedure.query(async ({ ctx }) => {
    // Recent activity yang lebih relevan: Sale terbaru (POSTED)
    const recentSales = await ctx.db.sale.findMany({
      take: 5,
      orderBy: { soldAt: "desc" },
      where: { status: "POSTED" },
      include: {
        customer: true,
        items: true, // SaleItem[] sudah punya subtotal
      },
    });

    return recentSales.map((sale) => {
      const amount = sale.items.reduce((sum, it) => sum + toNumber(it.subtotal), 0);

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
      where: { status: "POSTED" },
    });

    const successRate =
      totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";

    const totalPostedRevenueAgg = await ctx.db.saleItem.aggregate({
      where: { sale: { status: "POSTED" } },
      _sum: { subtotal: true },
    });

    const totalPostedRevenue = toNumber(totalPostedRevenueAgg._sum.subtotal);

    // avg order value dari POSTED sales
    const avgOrderValue = completedOrders > 0 ? totalPostedRevenue / completedOrders : 0;

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
