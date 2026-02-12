import {
  Building2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { toNumber, toRupiah } from "~/lib/utils";
import type { SaleAccessoriesFull, SaleAccessoriesItem } from "~/types/sale";

export const SaleAccessoriesDetailContent = ({
  data,
  items,
}: {
  data: SaleAccessoriesFull;
  items: SaleAccessoriesItem[];
}) => {
  return (
    <div className="space-y-6 lg:col-span-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Informasi Customer</CardTitle>
              <CardDescription>Detail pembeli</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-1 h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-xs">Nama</p>
                <p className="font-semibold">{data.customer?.name}</p>
              </div>
            </div>

            {data.customer?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">No. Telepon</p>
                  <p className="font-medium">{data.customer.phone}</p>
                </div>
              </div>
            )}

            {data.customer?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Alamat</p>
                  <p className="font-medium">{data.customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Daftar Barang ({items.length})
              </CardTitle>
              <CardDescription>
                Item yang terjual dalam transaksi ini
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-3 h-16 w-16 opacity-20" />
              <p className="text-sm">Tidak ada item dalam transaksi ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const qty = toNumber(item.qty);
                const unitPrice = toNumber(item.unitPrice);
                const subtotal = qty * unitPrice;

                const costPrice = toNumber(
                  (item as any)?.costPrice ??
                    (item as any)?.accessory?.costPrice ??
                    0,
                );

                const costTotal = qty * costPrice;
                const profit = subtotal - costTotal;
                const profitPct = costTotal ? (profit / costTotal) * 100 : 0;

                const accessory = (item as any)?.accessory ?? {};
                const productName =
                  accessory?.name ?? item.accessoryId ?? "Unknown Product";
                const supplierName =
                  accessory?.supplier?.name ?? "Unknown Supplier";

                return (
                  <Card
                    key={item.id || idx}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500/20 to-emerald-500/10">
                            <Package className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 text-base font-semibold">
                              {productName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {supplierName}
                            </p>
                          </div>
                        </div>
                        <Badge className="shrink-0 bg-linear-to-r from-blue-500 to-blue-600 text-xs">
                          #{idx + 1}
                        </Badge>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Quantity
                            </p>
                            <p className="text-sm font-bold">
                              {qty.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Harga/Unit
                            </p>
                            <p className="text-sm font-bold">
                              {toRupiah(unitPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Cost/Unit
                            </p>
                            <p className="text-sm font-semibold">
                              {costPrice > 0 ? (
                                toRupiah(costPrice)
                              ) : (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Subtotal
                            </p>
                            <p className="text-sm font-bold text-emerald-600">
                              {toRupiah(subtotal)}
                            </p>
                          </div>
                        </div>

                        {costPrice > 0 && (
                          <>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {profit >= 0 ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-xs font-medium">
                                  Profit Item
                                </span>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                                >
                                  {toRupiah(profit)}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Margin {profitPct.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {data.notes && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Catatan</CardTitle>
                <CardDescription>Informasi tambahan transaksi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{data.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
