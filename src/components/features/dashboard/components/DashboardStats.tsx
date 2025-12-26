import { TrendingUp, ShoppingCart, Truck, DollarSign } from "lucide-react";
import { StatsCard } from "~/components/elements/StatsCard";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/utils/trpc";

const DashboardStats = () => {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      id: 1,
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}%`,
      changeType: stats.revenueChange >= 0 ? "positive" : "negative",
      icon: DollarSign,
      description: "from last year",
    },
    {
      id: 2,
      title: "Penjualan",
      value: stats.thisYearSelling.toLocaleString("id-ID"),
      change: `${stats.sellingChange >= 0 ? "+" : ""}${stats.sellingChange.toFixed(1)}%`,
      changeType: stats.sellingChange >= 0 ? "positive" : "negative",
      icon: ShoppingCart,
      description: "from last year",
    },
    {
      id: 3,
      title: "Pembelian",
      value: stats.thisYearBuying.toLocaleString("id-ID"),
      change: `${stats.buyingChange >= 0 ? "+" : ""}${stats.buyingChange.toFixed(1)}%`,
      changeType: stats.buyingChange >= 0 ? "positive" : "negative",
      icon: Truck,
      description: "from last year",
    },
    {
      id: 4,
      title: "Growth Rate",
      value: `${stats.growthRate.toFixed(1)}%`,
      change: `${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate.toFixed(1)}%`,
      changeType: stats.growthRate >= 0 ? "positive" : "negative",
      icon: TrendingUp,
      description: "from last year",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === "positive";

        return (
          <StatsCard
            key={stat.id}
            // @ts-expect-error type
            stat={stat}
            Icon={Icon}
            isPositive={isPositive}
          />
        );
      })}
    </div>
  );
};

export default DashboardStats;
