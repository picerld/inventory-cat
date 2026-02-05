import { Banknote, Calculator, Calendar, Clock, Edit, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { toRupiah } from "~/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { SaleFinishedGoodFull, SaleFinishedGoodItem } from "~/types/sale";

type SaleFinishedGoodDetailSummaryProps = {
  data: SaleFinishedGoodFull;
  items: SaleFinishedGoodItem[];
  totalQty: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
};

export const SaleFinishedGoodDetailSummary = ({
  data,
  items,
  totalQty,
  totalRevenue,
  totalCost,
  totalProfit,
  profitMargin,
}: SaleFinishedGoodDetailSummaryProps) => {
  return (
    <div className="lg:col-span-4">
      <div className="sticky top-20 space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Ringkasan</CardTitle>
                <CardDescription>Total transaksi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <span className="text-sm font-medium">Total Item</span>
              <Badge variant="secondary" className="text-base font-bold">
                {items.length}
              </Badge>
            </div>

            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <span className="text-sm font-medium">Total Qty</span>
              <Badge variant="secondary" className="text-base font-bold">
                {totalQty.toFixed(2)}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {toRupiah(totalRevenue)}
                </span>
              </div>
            </div>

            {totalCost > 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Total Cost
                    </span>
                    <span className="font-semibold text-amber-600">
                      {toRupiah(totalCost)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div
                  className={`rounded-xl p-4 ${
                    totalProfit >= 0
                      ? "bg-linear-to-br from-emerald-500/10 to-emerald-500/5"
                      : "bg-linear-to-br from-red-500/10 to-red-500/5"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {totalProfit >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-semibold">
                        Total Profit
                      </span>
                    </div>
                    <Badge
                      className={
                        totalProfit >= 0 ? "bg-emerald-600" : "bg-red-600"
                      }
                    >
                      {profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      totalProfit >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {toRupiah(totalProfit)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Timeline</CardTitle>
                <CardDescription>Riwayat status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Calendar className="text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Dibuat</p>
                <p className="text-sm font-medium">
                  {format(new Date(data.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: id,
                  })}
                </p>
              </div>
            </div>

            {data.updatedAt && data.updatedAt !== data.createdAt && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <Edit className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">
                    Diperbarui
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(data.updatedAt), "dd MMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
