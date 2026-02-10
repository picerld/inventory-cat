import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/utils/trpc";

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

const ordersChartConfig = {
  orders: {
    label: "Penjualan",
    color: "hsl(var(--primary))",
  },
};

const categoryChartConfig = {
  value: {
    label: "Percentage",
  },
};

const PIE_COLORS = [
  "#2563EB",
  "#06B6D4",
  "#10B981",
  "#84CC16",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
  "#6366F1",
];

const DashboardCharts = () => {
  const { data: revenueData, isLoading: revenueLoading } =
    trpc.dashboard.getMonthlyRevenue.useQuery();
  const { data: categoryData, isLoading: categoryLoading } =
    trpc.dashboard.getTopCategories.useQuery();

    console.log(categoryData);

  if (revenueLoading || categoryLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[400px] lg:col-span-2" />
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[350px] lg:col-span-3" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Monthly revenue trends for {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={revenueChartConfig}
            className="h-[300px] w-full"
          >
            <LineChart data={revenueData ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `Rp ${Number(value).toLocaleString("id-ID")}`
                    }
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={{ fill: "var(--color-revenue)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penjualan Bahan</CardTitle>
          <CardDescription>Penjualan bahan terbesar</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer
            config={categoryChartConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />

              <Pie
                data={categoryData ?? []}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
              >
                {(categoryData ?? []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 space-y-2">
            {(categoryData ?? []).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Order Statistics</CardTitle>
          <CardDescription>Monthly order volume comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={ordersChartConfig}
            className="h-[250px] w-full"
          >
            <BarChart data={revenueData ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
