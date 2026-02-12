"use client";

import * as React from "react";
import { trpc } from "~/utils/trpc";
import { statusBadge } from "~/lib/utils";
import type { PurchaseStatus } from "../../config/purchase";
import useDebounce from "~/hooks/use-debounce";
import { PurchaseAccessoriesFilter } from "./attributes/PurchaseAccessoriesFilter";
import { Skeleton } from "~/components/ui/skeleton";
import { PurchaseNotFound } from "../../components/PurchaseNotFound";
import { PurchaseLitePagination } from "../../components/PurchaseLitePagination";
import { PurchaseAccessoriesList } from "./attributes/PurchaseAccessoriesList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function PurchaseAccessoriesCards() {
  const [page, setPage] = React.useState<number>(1);

  const [search, setSearch] = React.useState<string>("");
  const [status, setStatus] = React.useState<PurchaseStatus | "ALL">("ALL");

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
    trpc.purchase.getAccessoriesPaginated.useQuery(queryInput);

  const resetFilter = () => {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

  return (
    <div className="my-6 space-y-4">
      <div className="bg-card rounded-2xl border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PurchaseAccessoriesFilter
            search={search}
            status={status}
            setSearch={setSearch}
            setStatus={setStatus}
            resetFilter={resetFilter}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <ChevronDown className="h-4 w-4" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Format</DropdownMenuLabel>
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <PurchaseNotFound
          href="/purchases/accessories/create"
          resetFilter={resetFilter}
        />
      ) : (
        <div className="space-y-4">
          {/* @ts-expect-error type */}
          <PurchaseAccessoriesList data={data.data} statusBadge={statusBadge} />

          <PurchaseLitePagination
            data={data.meta}
            setPage={setPage}
            isFetching={isFetching}
          />
        </div>
      )}
    </div>
  );
}
