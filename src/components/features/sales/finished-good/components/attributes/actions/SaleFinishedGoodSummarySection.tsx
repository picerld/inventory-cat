import { ChartCandlestick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { toRupiah } from "~/lib/utils";

type SaleFinishedGoodSummarySectionProps = {
  summary: {
    totalLines: number;
    totalUnits: number;
    totalCost: number;
    revenue: number;
    profit: number;
    marginPct: number;
  };
};

export const SaleFinishedGoodSummarySection = ({
  summary,
}: SaleFinishedGoodSummarySectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartCandlestick className="h-5 w-5" />
          Ringkasan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Jumlah Line</span>
          <span className="font-medium">{summary.totalLines}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Qty</span>
          <span className="font-medium">{summary.totalUnits.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Cost</span>
          <span className="font-semibold">{toRupiah(summary.totalCost)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Revenue</span>
          <span className="font-semibold">{toRupiah(summary.revenue)}</span>
        </div>

        <div className="flex justify-between text-sm text-emerald-700">
          <span className="font-semibold">Profit</span>
          <span className="font-bold">
            {toRupiah(summary.profit)} ({summary.marginPct.toFixed(1)}%)
          </span>
        </div>

        <Separator />

        <div className="text-muted-foreground text-xs">
          Profit dihitung dari (qty × unitPrice) - (qty × cost).
        </div>
      </CardContent>
    </Card>
  );
};
