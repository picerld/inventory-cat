"use client";

import { Users, Package, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "~/components/elements/StatsCard";
import { trpc } from "~/utils/trpc";

const ReturnedGoodStatsContainer = () => {
  const { data, isLoading } = trpc.returnGood.getStats.useQuery();

  if (isLoading) return <div>Loading...</div>;

  const statsData = [
    {
      id: 1,
      title: "Total Barang Retur",
      value: data?.totalReturnedGoods ?? 0,
      change: `+${data?.growth}%`,
      changeType: "negative",
      icon: Users,
      description: "Jumlah keseluruhan barang retur",
    },
    {
      id: 2,
      title: `Tahun Ini (${new Date().getFullYear()})`,
      value: data?.thisYearReturnedGoods ?? 0,
      change: "+0%",
      changeType: "negative",
      icon: Package,
      description: "Jumlah barang retur yang diterima tahun ini",
    },
  ];

  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === "positive";

        return (
          <StatsCard
            key={stat.id}
            stat={stat}
            Icon={Icon}
            isPositive={false}
          />
        );
      })}
    </div>
  );
};

export default ReturnedGoodStatsContainer;
