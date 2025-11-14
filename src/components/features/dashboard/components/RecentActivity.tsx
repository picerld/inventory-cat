import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: "Rp 1,250,000", status: "completed", time: "2 hours ago" },
  { id: "ORD-002", customer: "Jane Smith", amount: "Rp 890,000", status: "processing", time: "4 hours ago" },
  { id: "ORD-003", customer: "Bob Johnson", amount: "Rp 2,150,000", status: "completed", time: "5 hours ago" },
  { id: "ORD-004", customer: "Alice Brown", amount: "Rp 675,000", status: "pending", time: "6 hours ago" },
  { id: "ORD-005", customer: "Charlie Wilson", amount: "Rp 1,450,000", status: "completed", time: "8 hours ago" },
];

const RecentActivity = () => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest transactions from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Package className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.id} • {order.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{order.amount}</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="text-green-700 size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-xl font-bold">98.5%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="text-blue-700 size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Avg. Order Value</p>
              <p className="text-xl font-bold">Rp 1.2M</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <AlertCircle className="text-yellow-700 size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pending Items</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Package className="text-primary size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-xl font-bold">856</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;