"use client";

import * as React from "react";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import useDebounce from "~/hooks/use-debounce";
import { statusBadge, toNumber } from "~/lib/utils";
import type { StatusFilter } from "~/types/sale";
import { SaleFilter } from "../../components/attributes/SaleFilter";
import { SaleNotFound } from "../../components/attributes/SaleNotFound";
import { SaleLitePagination } from "../../components/attributes/SaleLitePagination";
import { SaleFinishedGoodCard } from "./SaleFinishedGoodCard";

function safeInt(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default function SaleFinishedGoodListContainer() {
  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [status, setStatus] = React.useState<StatusFilter>("ALL");
  const [customerId, setCustomerId] = React.useState<string | undefined>(
    undefined,
  );

  const debouncedSearch = useDebounce(search, 350);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, customerId]);

  const queryInput = React.useMemo(() => {
    const s = debouncedSearch.trim();

    return {
      page: safeInt(page, 1),
      perPage: 6,
      search: s.length ? s : "",
      ...(status !== "ALL" ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    };
  }, [page, debouncedSearch, status, customerId]);

  const { data, isLoading, isFetching, isError, error } =
    trpc.sale.getFinishedGoodPaginated.useQuery(queryInput, {
      placeholderData: (prev) => prev,
      staleTime: 10_000,
    });

  const resetFilter = () => {
    setSearch("");
    setStatus("ALL");
    setCustomerId(undefined);
    setPage(1);
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const showInitialSkeleton = isLoading && rows.length === 0;
  const showRefreshingOverlay = isFetching && rows.length > 0;

  return (
    <div className="my-6 space-y-4">
      <div className="bg-card rounded-2xl border p-4 shadow-sm">
        <SaleFilter
          search={search}
          status={status}
          setSearch={setSearch}
          setStatus={setStatus}
          resetFilter={resetFilter}
        />
      </div>

      {showInitialSkeleton ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border p-4 text-sm text-red-600">
          <div className="font-medium">Gagal memuat data.</div>
          <div className="mt-1 text-xs opacity-80">
            {error?.message ?? "Bad Request"}
          </div>
        </div>
      ) : !rows.length ? (
        <SaleNotFound resetFilter={resetFilter} />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div
              className={[
                "grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3",
                showRefreshingOverlay ? "opacity-60" : "",
              ].join(" ")}
            >
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

                const badge = statusBadge(sale.status);

                return (
                  <SaleFinishedGoodCard
                    key={sale.id}
                    sale={sale}
                    badge={badge}
                    items={items}
                    revenue={revenue}
                    totalQty={totalQty}
                  />
                );
              })}
            </div>

            {showRefreshingOverlay && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-3">
                <div className="bg-background/80 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs shadow-sm backdrop-blur">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  <span>Memuat data...</span>
                </div>
              </div>
            )}
          </div>

          {meta && (
            <SaleLitePagination
              meta={meta}
              page={page}
              setPage={(p) => setPage(safeInt(p, 1))}
              isFetching={isFetching}
            />
          )}
        </div>
      )}
    </div>
  );
}
