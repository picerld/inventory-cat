"use client";

import { useEffect, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-option";
import { Cross, Eraser, Search } from "lucide-react";
import useDebounce from "~/hooks/use-debounce";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  children?: React.ReactNode;
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  filters = [],
  children,
}: DataTableToolbarProps<TData>) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const initial = searchKey
      ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
      : ((table.getState().globalFilter as string) ?? "");
    setInputValue(initial);
  }, [table, searchKey]);

  const debouncedValue = useDebounce(inputValue, 400);

  useEffect(() => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(debouncedValue);
    } else {
      table.setGlobalFilter(debouncedValue);
    }
  }, [debouncedValue, searchKey, table]);

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <div className="relative w-37.5 lg:w-62.5">
          <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />

          <Input
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8 pl-8"
          />
        </div>

        <div className="flex gap-x-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>

        {children}

        {isFiltered && (
          <Button
            variant="dashed"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
              setInputValue("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Eraser className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
