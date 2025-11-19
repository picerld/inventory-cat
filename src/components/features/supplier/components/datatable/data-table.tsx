"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import React from "react";
import { Input } from "~/components/ui/input";
import { DataTableViewOptions } from "~/components/datatable/data-table-view-option";
import { Loader, PlusCircle, Search } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search: string;
  isLoading: boolean;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  isLoading,
  handleSearch,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="flex items-center gap-3 pb-5">
        <Input
          placeholder="Cari supplier..."
          value={search}
          onChange={handleSearch}
          className="relative max-w-xs"
        />
        <div className="flex gap-2">
          <Button variant={"dashed"}>
            <PlusCircle /> Status
          </Button>
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="even:bg-main/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-3" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Oops, kayanya tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader className="size-6 animate-spin" />
              <p className="ml-2 text-base font-normal">Loading ...</p>
            </div>
          )}
        </Table>
      </div>
    </>
  );
}
