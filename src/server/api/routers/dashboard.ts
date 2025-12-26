import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const thisYearSelling = await ctx.db.selling.count({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
    });

    const thisYearBuying = await ctx.db.buying.count({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
    });

    const lastYearSelling = await ctx.db.selling.count({
      where: {
        createdAt: {
          gte: startOfLastYear,
          lte: endOfLastYear,
        },
      },
    });

    const lastYearBuying = await ctx.db.buying.count({
      where: {
        createdAt: {
          gte: startOfLastYear,
          lte: endOfLastYear,
        },
      },
    });

    const finishedGoods = await ctx.db.finishedGood.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
      include: {
        finishedGoodDetails: {
          include: {
            rawMaterial: true,
            semiFinishedGood: {
              include: {
                SemiFinishedGoodDetail: {
                  include: {
                    rawMaterial: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    for (const fg of finishedGoods) {
      for (const detail of fg.finishedGoodDetails) {
        const rawMaterialCost = detail.rawMaterial.supplierPrice * detail.qty;
        totalRevenue += rawMaterialCost;

        if (detail.semiFinishedGood) {
          for (const sfDetail of detail.semiFinishedGood
            .SemiFinishedGoodDetail) {
            const sfCost = sfDetail.rawMaterial.supplierPrice * sfDetail.qty;
            totalRevenue += sfCost;
          }
        }
      }
    }

    const paintAccessories = await ctx.db.paintAccessories.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
    });

    const paintAccessoriesRevenue = paintAccessories.reduce(
      (sum, item) => sum + item.sellingPrice * item.qty,
      0,
    );

    totalRevenue += paintAccessoriesRevenue;

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
      revenueChange: sellingChange,
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

        const selling = await ctx.db.selling.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const finishedGoods = await ctx.db.finishedGood.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            finishedGoodDetails: {
              include: {
                rawMaterial: true,
              },
            },
          },
        });

        let revenue = 0;
        for (const fg of finishedGoods) {
          for (const detail of fg.finishedGoodDetails) {
            revenue += detail.rawMaterial.supplierPrice * detail.qty;
          }
        }

        const paintAccessories = await ctx.db.paintAccessories.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        revenue += paintAccessories.reduce(
          (sum, item) => sum + item.sellingPrice * item.qty,
          0,
        );

        return {
          month,
          revenue,
          orders: selling,
        };
      }),
    );

    return monthlyData;
  }),

  getTopCategories: protectedProcedure.query(async ({ ctx }) => {
    const paintGrades = await ctx.db.paintGrade.findMany({
      include: {
        finishedGoods: true,
      },
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
    const recentFinishedGoods = await ctx.db.finishedGood.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        paintGrade: true,
        finishedGoodDetails: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    return recentFinishedGoods.map((fg) => {
      const amount = fg.finishedGoodDetails.reduce(
        (sum, detail) => sum + detail.rawMaterial.supplierPrice * detail.qty,
        0,
      );

      const timeAgo = getTimeAgo(fg.createdAt);

      return {
        id: fg.productionCode,
        customer: fg.name,
        amount: `Rp ${amount.toLocaleString("id-ID")}`,
        status: "completed" as const,
        time: timeAgo,
      };
    });
  }),

  getSalesStats: protectedProcedure.query(async ({ ctx }) => {
    const totalOrders = await ctx.db.selling.count();
    const completedOrders = await ctx.db.finishedGood.count();

    const successRate =
      totalOrders > 0
        ? ((completedOrders / totalOrders) * 100).toFixed(1)
        : "0";

    const finishedGoods = await ctx.db.finishedGood.findMany({
      include: {
        finishedGoodDetails: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    let totalValue = 0;
    for (const fg of finishedGoods) {
      for (const detail of fg.finishedGoodDetails) {
        totalValue += detail.rawMaterial.supplierPrice * detail.qty;
      }
    }

    const avgOrderValue =
      finishedGoods.length > 0 ? totalValue / finishedGoods.length : 0;

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

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  }
}
