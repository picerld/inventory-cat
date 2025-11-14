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
import { Line, LineChart, Bar, BarChart, Pie, PieChart, XAxis, YAxis, CartesianGrid } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4200000, orders: 145 },
  { month: "Feb", revenue: 3800000, orders: 132 },
  { month: "Mar", revenue: 5100000, orders: 178 },
  { month: "Apr", revenue: 4600000, orders: 156 },
  { month: "May", revenue: 6200000, orders: 198 },
  { month: "Jun", revenue: 7500000, orders: 234 },
];

const categoryData = [
  { name: "Electronics", value: 35, fill: "hsl(var(--primary))" },
  { name: "Fashion", value: 25, fill: "hsl(var(--primary) / 0.8)" },
  { name: "Food", value: 20, fill: "hsl(var(--primary) / 0.6)" },
  { name: "Others", value: 20, fill: "hsl(var(--primary) / 0.4)" },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

const ordersChartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
};

const categoryChartConfig = {
  value: {
    label: "Percentage",
  },
  Electronics: {
    label: "Electronics",
    color: "hsl(var(--primary))",
  },
  Fashion: {
    label: "Fashion",
    color: "hsl(var(--primary) / 0.8)",
  },
  Food: {
    label: "Food",
    color: "hsl(var(--primary) / 0.6)",
  },
  Others: {
    label: "Others",
    color: "hsl(var(--primary) / 0.4)",
  },
};

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Monthly revenue trends for 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
            <LineChart data={revenueData}>
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

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>
            Distribution across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              />
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Order Statistics</CardTitle>
          <CardDescription>Monthly order volume comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ordersChartConfig} className="h-[250px] w-full">
            <BarChart data={revenueData}>
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
              />
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