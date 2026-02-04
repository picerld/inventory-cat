"use client";

import * as React from "react";
import Link from "next/link";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import useDebounce from "~/hooks/use-debounce";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { cn, toNumber, toRupiah } from "~/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  ScanBarcode,
  SquarePen,
  Info,
} from "lucide-react";

type SaleStatus = "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";
type StatusFilter = SaleStatus | "ALL";

function statusBadge(status?: SaleStatus) {
  if (!status) return <Badge className="bg-slate-100 text-slate-700">-</Badge>;

  const map: Record<SaleStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700" },
    ONGOING: { label: "Ongoing", className: "bg-blue-100 text-blue-700" },
    FINISHED: {
      label: "Finished",
      className: "bg-emerald-100 text-emerald-700",
    },
    CANCELED: { label: "Canceled", className: "bg-red-100 text-red-700" },
  };

  return (
    <Badge className={cn("text-xs", map[status].className)}>
      {map[status].label}
    </Badge>
  );
}

function SaleNotFound({ resetFilter }: { resetFilter: () => void }) {
  return (
    <div className="bg-card space-y-2 rounded-2xl border p-8 text-center">
      <div className="text-lg font-semibold">
        Data penjualan tidak ditemukan
      </div>
      <div className="text-muted-foreground text-sm">
        Coba ganti kata kunci pencarian atau reset filter.
      </div>
      <Button variant="outline" onClick={resetFilter} className="mt-3">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Reset Filter
      </Button>
    </div>
  );
}

function SaleFilter({
  search,
  status,
  setSearch,
  setStatus,
  resetFilter,
}: {
  search: string;
  status: StatusFilter;
  setSearch: (v: string) => void;
  setStatus: (v: StatusFilter) => void;
  resetFilter: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Cari saleNo / customer / invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="FINISHED">Finished</SelectItem>
            <SelectItem value="CANCELED">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilter} className="md:ml-auto">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function SaleLitePagination({
  meta,
  page,
  setPage,
  isFetching,
}: {
  meta: { page: number; perPage: number; total: number; totalPages: number };
  page: number;
  setPage: (p: number) => void;
  isFetching: boolean;
}) {
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="bg-card flex items-center justify-between rounded-2xl border p-3">
      <div className="text-muted-foreground text-sm">
        Halaman <span className="text-foreground font-medium">{page}</span> dari{" "}
        <span className="text-foreground font-medium">{totalPages}</span> •
        Total{" "}
        <span className="text-foreground font-medium">{meta?.total ?? 0}</span>{" "}
        data
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page >= totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Cards penjualan barang jadi.
 * Default: status ONGOING (penjualan yang berlangsung)
 */
export default function SaleFinishedGoodCardsOngoing() {
  const [page, setPage] = React.useState<number>(1);

  const [search, setSearch] = React.useState<string>("");
  const [status, setStatus] = React.useState<StatusFilter>("ALL");

  const debouncedSearch = useDebounce(search, 350);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const queryInput = React.useMemo(
    () => ({
      page,
      perPage: 6,
      search: debouncedSearch,
      ...(status !== "ALL" ? { status } : {}),
    }),
    [page, debouncedSearch, status],
  );

  const { data, isLoading, isFetching } =
    trpc.sale.getFinishedGoodPaginated.useQuery(queryInput as any);

  const resetFilter = () => {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="my-6 space-y-4">
      {/* Filter bar */}
      <div className="bg-card rounded-2xl border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SaleFilter
            search={search}
            status={status}
            setSearch={setSearch}
            setStatus={setStatus}
            resetFilter={resetFilter}
          />
          <div className="text-muted-foreground flex items-center justify-between text-sm md:justify-end">
            {isFetching ? <span>Memuat...</span> : <span>&nbsp;</span>}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !rows?.length ? (
        <SaleNotFound resetFilter={resetFilter} />
      ) : (
        <div className="space-y-4">
          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map((sale: any) => {
              const items = sale.items ?? [];

              const totalQty = items.reduce(
                (acc: number, it: any) => acc + toNumber(it.qty),
                0,
              );
              const revenue = items.reduce(
                (acc: number, it: any) =>
                  acc + toNumber(it.qty) * toNumber(it.unitPrice),
                0,
              );

              return (
                <Card key={sale.id} className="overflow-hidden rounded-2xl">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2">
                          <ScanBarcode className="text-primary h-5 w-5" />
                          <span className="truncate">{sale.saleNo}</span>
                        </CardTitle>
                        <div className="text-muted-foreground mt-1 text-sm">
                          Customer:{" "}
                          <span className="text-foreground font-medium">
                            {sale.customer?.name ?? "-"}
                          </span>
                        </div>
                      </div>

                      {statusBadge(sale.status)}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">
                        Invoice:{" "}
                        <span className="text-foreground font-medium">
                          {sale.invoiceNo ?? "-"}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-right">
                        Order:{" "}
                        <span className="text-foreground font-medium">
                          {sale.orderNo ?? "-"}
                        </span>
                      </div>

                      <div className="text-muted-foreground">
                        Items:{" "}
                        <span className="text-foreground font-medium">
                          {items.length}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-right">
                        Total Qty:{" "}
                        <span className="text-foreground font-medium">
                          {totalQty.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="bg-muted/30 space-y-2 rounded-xl border p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold">
                          {toRupiah(revenue)}
                        </span>
                      </div>

                      <div className="text-muted-foreground text-xs">
                        {items.slice(0, 2).map((it: any) => (
                          <div
                            key={it.id}
                            className="flex justify-between gap-2"
                          >
                            <span className="truncate">
                              {
                                (it.finishedGood?.name ??
                                  it.accessory?.name ??
                                  "Item") as string
                              }
                            </span>
                            <span className="shrink-0">
                              {toNumber(it.qty).toFixed(2)} ×{" "}
                              {toRupiah(toNumber(it.unitPrice))}
                            </span>
                          </div>
                        ))}

                        {items.length > 2 && (
                          <div className="text-muted-foreground pt-1">
                            +{items.length - 2} item lainnya...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full items-center gap-2 pt-3">
                      {/* sesuaikan link detail kamu */}
                      <Button asChild variant="outline" className="w-1/2">
                        <Link href={`/sales/finished-goods/${sale.id}`}>
                          <Info className="h-4 w-4" /> Detail
                        </Link>
                      </Button>

                      <Button asChild className="w-1/2">
                        <Link href={`/sales/finished-goods/${sale.id}/edit`}>
                          <SquarePen className="h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && (
            <SaleLitePagination
              meta={meta}
              page={page}
              setPage={setPage}
              isFetching={isFetching}
            />
          )}
        </div>
      )}
    </div>
  );
}
