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
      title: "Total Suppliers",
      value: data?.totalSuppliers ?? 0,
      change: `+${data?.growth}%`,
      changeType: data!.growth >= 0 ? "positive" : "negative",
      icon: Users,
      description: "Active suppliers",
    },
    {
      id: 2,
      title: "This Year",
      value: data?.thisYearSuppliers ?? 0,
      change: "+0%",
      changeType: "positive",
      icon: Package,
      description: "Added this year",
    },
    {
      id: 3,
      title: "Performance Rate",
      value: "94.2%",
      change: "+2.4%",
      changeType: "positive",
      icon: TrendingUp,
      description: "On-time delivery",
    },
    {
      id: 4,
      title: "Pending Issues",
      value: "12",
      change: "-3",
      changeType: "negative",
      icon: AlertCircle,
      description: "Require attention",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
