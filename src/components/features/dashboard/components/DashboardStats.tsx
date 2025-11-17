import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";
import { StatsCard } from "~/components/elements/StatsCard";

const statsData = [
  {
    id: 1,
    title: "Total Revenue",
    value: "Rp 45,231,890",
    change: "+20.1%",
    changeType: "positive",
    icon: DollarSign,
    description: "from last month",
  },
  {
    id: 2,
    title: "Orders",
    value: "2,345",
    change: "+15.3%",
    changeType: "positive",
    icon: ShoppingCart,
    description: "from last month",
  },
  {
    id: 3,
    title: "Customers",
    value: "1,234",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    description: "from last month",
  },
  {
    id: 4,
    title: "Growth Rate",
    value: "23.5%",
    change: "+4.3%",
    changeType: "positive",
    icon: TrendingUp,
    description: "from last month",
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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

export default DashboardStats;
