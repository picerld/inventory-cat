import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

type StatsItem = {
  id: number;
  title: string;
  value: string | number;
  change: string | number;
  changeType: "positive" | "negative";
  description: string;
};

export const StatsCard = ({
  stat,
  Icon,
  isPositive,
}: {
  stat: StatsItem;
  Icon: LucideIcon;
  isPositive: boolean;
}) => {
  return (
    <Card className="border-l-primary group relative overflow-hidden border-l-4 transition-shadow duration-300">
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
            <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
          </div>

          <p className="text-muted-foreground mt-2 text-xs">
            {stat.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
