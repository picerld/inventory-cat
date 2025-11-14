import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "~/components/ui/card";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === "positive";
        
        return (
          <Card 
            key={stat.id} 
            className="border-l-4 border-l-primary transition-all duration-300 group"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="text-primary size-5" />
                </div>
                <span 
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isPositive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground">
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

export default DashboardStats;