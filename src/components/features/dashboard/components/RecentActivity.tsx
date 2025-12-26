import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/utils/trpc";

const RecentActivity = () => {
  const { data: recentOrders, isLoading: ordersLoading } =
    trpc.dashboard.getRecentOrders.useQuery();
  const { data: salesStats, isLoading: statsLoading } =
    trpc.dashboard.getSalesStats.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "processing":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  if (ordersLoading || statsLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[500px] lg:col-span-2" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Penjualan Terbaru</CardTitle>
          <CardDescription>
            Latest transactions from your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No recent orders found
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Package className="text-primary size-5" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-muted-foreground text-sm">
                        {order.id} • {order.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Penjualan</CardTitle>
          <CardDescription>Overview of your sales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="size-5 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">Success Rate</p>
              <p className="text-xl font-bold">
                {salesStats?.successRate ?? "0%"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <TrendingUp className="size-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">Avg. Order Value</p>
              <p className="text-xl font-bold">
                Rp{" "}
                {salesStats?.avgOrderValue
                  ? (salesStats.avgOrderValue / 1000000).toFixed(1)
                  : "0"}
                M
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <AlertCircle className="size-5 text-yellow-700" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">Pending Items</p>
              <p className="text-xl font-bold">
                {salesStats?.pendingItems ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Package className="text-primary size-5" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">Total Products</p>
              <p className="text-xl font-bold">
                {salesStats?.totalProducts ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
