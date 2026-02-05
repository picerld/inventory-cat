import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Package2,
  User,
  XCircle,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { toRupiah } from "~/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { SaleFinishedGoodFull, SaleFinishedGoodItem } from "~/types/sale";

export const SaleFinishedGoodHeaderInformation = ({
  data,
  items,
  totalRevenue,
  badge,
}: {
  data: SaleFinishedGoodFull;
  items: SaleFinishedGoodItem[];
  totalRevenue: number;
  badge: {
    label: string;
    className: string;
  };
}) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case "FINISHED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "ONGOING":
        return <Clock className="h-4 w-4" />;
      case "CANCELED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "FINISHED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "ONGOING":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
      case "CANCELED":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md dark:from-blue-600 dark:to-blue-700">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {data.saleNo}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>
                      {format(new Date(data.createdAt), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </span>
                  </div>
                  {data.user?.name && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span>{data.user.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Badge
              className={`gap-1.5 border px-3 py-1.5 text-sm font-medium ${getStatusColor()}`}
            >
              {getStatusIcon()}
              {badge.label}
            </Badge>
          </div>

          {(data.orderNo ?? data.invoiceNo) && (
            <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
              {data.orderNo && (
                <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2.5 dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
                    <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80">
                      Order Number
                    </p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      {data.orderNo}
                    </p>
                  </div>
                </div>
              )}
              {data.invoiceNo && (
                <div className="flex items-center gap-2.5 rounded-lg border border-purple-200 bg-purple-50/50 px-4 py-2.5 dark:border-purple-800 dark:bg-purple-950/20">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/50">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600/80 dark:text-purple-400/80">
                      Invoice Number
                    </p>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                      {data.invoiceNo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {toRupiah(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30">
                    <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Items
                  </p>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {items.length}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {items.length === 1 ? "item" : "items"} in this sale
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
