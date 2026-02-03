"use client";

import * as React from "react";
import { trpc } from "~/utils/trpc";
import type {
  ItemType,
  StockMovementRow,
  StockMovementType,
} from "~/types/stock-movement";
import useDebounce from "~/hooks/use-debounce";
import { PurchaseLitePagination } from "../../purchases/components/PurchaseLitePagination";
import { PurchaseNotFound } from "../../purchases/components/PurchaseNotFound";
import { StockMovementFilterList } from "./StockMovementFilterList";
import { StockMovementContainerWithHeader } from "./StockMovementContainerWithHeader";

export function StockMovementList() {
  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [type, setType] = React.useState<StockMovementType | "ALL">("ALL");
  const [itemType, setItemType] = React.useState<ItemType | "ALL">("ALL");
  const [groupBy, setGroupBy] = React.useState<"none" | "day" | "month">("day");

  const debouncedSearch = useDebounce(search, 500);

  const queryInput = {
    page,
    perPage: 10,
    search: debouncedSearch,
    ...(type !== "ALL" ? { type } : {}),
    ...(itemType !== "ALL" ? { itemType } : {}),
  };

  const { data, isError, error, isFetching } =
    trpc.stockMovement.getPaginated.useQuery(queryInput);

  React.useEffect(() => {
    setPage(1);
  }, [search, type, itemType]);

  const resetFilter = () => {
    setSearch("");
    setType("ALL");
    setItemType("ALL");
  };

  const groupedData = React.useMemo(() => {
    if (!data?.data) return {};

    if (groupBy === "none") {
      return { all: data.data };
    }

    return data.data.reduce(
      (acc, movement) => {
        const date = new Date(movement.createdAt);
        let key: string;

        if (groupBy === "day") {
          key = date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        } else {
          key = date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          });
        }

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(movement);
        return acc;
      },
      {} as Record<string, typeof data.data>,
    );
  }, [data, groupBy]);

  const getGroupTotal = (movements: StockMovementRow[]) => {
    return movements.reduce((sum, m) => {
      const qty = parseFloat(m.qty.toString());
      if (
        m.type === "PURCHASE_IN" ||
        m.type === "PRODUCTION_IN" ||
        m.type === "RETURN_IN"
      ) {
        return sum + qty;
      } else if (m.type === "SALE_OUT" || m.type === "PRODUCTION_OUT") {
        return sum - qty;
      }
      return sum;
    }, 0);
  };

  if (isError) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm font-semibold">Gagal memuat stock movement.</p>
        <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="my-8 space-y-4">
      <StockMovementFilterList
        {...{
          search,
          itemType,
          type,
          groupBy,
          setSearch,
          setItemType,
          setType,
          setGroupBy,
          resetFilter,
        }}
      />

      {data?.data?.length ? (
        <>
          <StockMovementContainerWithHeader
            groupBy={groupBy}
            groupedData={groupedData}
            getGroupTotal={getGroupTotal}
          />

          <PurchaseLitePagination
            data={data.meta}
            setPage={setPage}
            isFetching={isFetching}
          />
        </>
      ) : (
        <PurchaseNotFound resetFilter={resetFilter} withHrefButton={false} />
      )}
    </div>
  );
}
