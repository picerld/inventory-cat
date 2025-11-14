import { Package, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const statsData = [
  {
    id: 1,
    title: "Total Suppliers",
    value: "248",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    description: "Active suppliers",
  },
  {
    id: 2,
    title: "Active Orders",
    value: "1,429",
    change: "+8.2%",
    changeType: "positive",
    icon: Package,
    description: "Orders in progress",
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

const SupplierStatsContainer = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === "positive";

        return (
          <Card
            key={stat.id}
            className="border-l-primary group relative overflow-hidden border-l-4 transition-shadow duration-300"
          >
            <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 group-hover:bg-primary/20 rounded-xl p-3 transition-colors duration-300">
                  <Icon className="text-primary size-6" />
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    isPositive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SupplierStatsContainer;
