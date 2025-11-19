"use client";

import { Users, Package, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "~/components/elements/StatsCard";
import { trpc } from "~/utils/trpc";

const SupplierStatsContainer = () => {
  const { data, isLoading } = trpc.supplier.getStats.useQuery();

  if (isLoading) return <div>Loading...</div>;

  const statsData = [
    {
      id: 1,
      title: "Total Supplier",
      value: data?.totalSuppliers ?? 0,
      change: `+${data?.growth}%`,
      changeType: data!.growth >= 0 ? "positive" : "negative",
      icon: Users,
      description: "Supplier Aktif",
    },
    {
      id: 2,
      title: `Tahun Ini (${new Date().getFullYear()})`,
      value: data?.thisYearSuppliers ?? 0,
      change: "+0%",
      changeType: "positive",
      icon: Package,
      description: "Ditambahkan Tahun Ini",
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
            isPositive={isPositive}
          />
        );
      })}
    </div>
  );
};

export default SupplierStatsContainer;
