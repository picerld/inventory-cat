"use client";

import { Users, Package, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "~/components/elements/StatsCard";
import { trpc } from "~/utils/trpc";

const GradeStatsContainer = () => {
  const { data, isLoading } = trpc.paintGrade.getStats.useQuery();

  if (isLoading) return <div>Loading...</div>;

  const statsData = [
    {
      id: 1,
      title: "Total Kualitas",
      value: data?.totalGrades ?? 0,
      change: `+${data?.growth}%`,
      changeType: data!.growth >= 0 ? "positive" : "negative",
      icon: Users,
      description: "Kualitas Aktif",
    },
  ];

  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1">
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

export default GradeStatsContainer;
