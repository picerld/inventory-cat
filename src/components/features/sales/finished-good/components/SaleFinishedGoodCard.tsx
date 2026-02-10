import {
  Calendar,
  ChevronRight,
  FileText,
  Info,
  Package,
  ScanBarcode,
  ShoppingCart,
  SquarePen,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn, toNumber, toRupiah } from "~/lib/utils";
import type { SaleFinishedGoodFull } from "~/types/sale";

type SaleFinishedGoodCardProps = {
  sale: SaleFinishedGoodFull;
  badge: {
    label: string;
    className: string;
  };
  items: SaleFinishedGoodFull["items"];
  revenue: number;
  totalQty: number;
};

export const SaleFinishedGoodCard = ({
  sale,
  badge,
  items,
  revenue,
  totalQty,
}: SaleFinishedGoodCardProps) => {
  return (
    <Card
      key={sale.id}
      className="group hover:border-primary/20 overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="bg-primary/10 shrink-0 rounded-xl p-2.5">
              <ScanBarcode className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="group-hover:text-primary truncate text-base font-semibold transition-colors">
                {sale.saleNo}
              </h3>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                <div className="flex gap-1">
                  <User className="h-3 w-3" />
                  <span className="text-foreground truncate font-medium">
                    {sale.customer?.name ?? "Unknown"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-foreground truncate font-medium">
                    {sale.createdAt.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }) ?? "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Badge className={cn("rounded-full px-3 py-1", badge.className)}>
            {badge.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-muted/50 space-y-1 rounded-lg p-2.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <FileText className="h-3 w-3" />
              <span>Invoice</span>
            </div>
            <p className="truncate text-sm font-medium">
              {sale.invoiceNo ?? "-"}
            </p>
          </div>

          <div className="bg-muted/50 space-y-1 rounded-lg p-2.5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <ShoppingCart className="h-3 w-3" />
              <span>Order</span>
            </div>
            <p className="truncate text-sm font-medium">
              {sale.orderNo ?? "-"}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-4">
        <div className="from-primary/5 to-primary/10 border-primary/10 rounded-xl border bg-linear-to-br p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Total Revenue</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {items.length} items
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary text-2xl font-bold">
              {toRupiah(revenue)}
            </span>
          </div>
          <div className="text-muted-foreground mt-1.5 text-xs">
            Total Qty:{" "}
            <span className="text-foreground font-semibold">
              {totalQty.toFixed(2)}
            </span>{" "}
            units
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Package className="h-3 w-3" />
            <span>Items Preview</span>
          </div>
          <div className="min-h-40 space-y-1.5">
            {items.slice(0, 2).map((it: any) => (
              <div key={it.id} className="bg-muted/30 rounded-lg p-2.5 text-xs">
                <div className="mb-1 flex justify-between gap-2">
                  <span className="truncate font-medium">
                    {
                      (it.finishedGood?.name ??
                        it.accessory?.name ??
                        "Item") as string
                    }
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {toNumber(it.qty).toFixed(2)}×
                  </span>
                </div>
                <div className="text-primary text-right font-semibold">
                  {toRupiah(toNumber(it.qty) * toNumber(it.unitPrice))}
                </div>
              </div>
            ))}

            {items.length > 2 && (
              <div className="text-muted-foreground bg-muted/20 rounded-lg py-1.5 text-center text-xs">
                +{items.length - 2} item lainnya
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            className="group/btn hover:border-primary/50 flex-1"
          >
            <Link href={`/sales/finished-goods/${sale.id}`}>
              <Info className="group-hover/btn:text-primary mr-1.5 h-4 w-4 transition-colors" />
              Detail
            </Link>
          </Button>

          <Button asChild className="group/btn flex-1">
            <Link href={`/sales/finished-goods/${sale.id}/edit`}>
              <SquarePen className="mr-1.5 h-4 w-4" />
              Edit
              <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
