"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import { cn } from "~/lib/utils";
import { useTableUrlState } from "~/hooks/use-table-url-state";
import { trpc } from "~/utils/trpc";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { DataTablePagination } from "~/components/datatable/data-table-pagination";
import { DataTableToolbar } from "~/components/datatable/data-table-toolbar";
import { DataTableBulkActions } from "./data-table-bulk-action";

import { rawMaterialsColumns as columns } from "./raw-materials-column";
import { OnLoadItem } from "~/components/dialog/OnLoadItem";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { NavigateFn } from "~/hooks/use-table-url-state";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

import { ArrowUpRightIcon, CircleStar, Folder, Plus, UserCheck } from "lucide-react";
import { Button } from "~/components/ui/button";

import { useRawMaterials } from "./raw-materials-provider";
import type { RawMaterial } from "~/types/raw-material";

export function RawMaterialsTable() {
  const { setOpen } = useRawMaterials();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const searchObj = useMemo<Record<string, unknown>>(() => {
    const entries = Array.from(searchParams?.entries() ?? []).map(([k, v]) => {
      if (k === "supplierId") {
        if (v === "" || v === "all") return [k, undefined];
        return [k, v.split(",")];
      }

      if (k === "userId") {
        if (v === "" || v === "all") return [k, undefined];
        return [k, v.split(",")];
      }

      if (k === "paintGradeId") {
        if (v === "" || v === "all") return [k, undefined];
        return [k, v.split(",")];
      }

      const n = Number(v);
      return [k, !isNaN(n) && String(n) === v ? n : v];
    });

    return Object.fromEntries(entries);
  }, [searchParams]);

  const navigate: NavigateFn = ({ search, replace }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (typeof search === "function") {
      const prev = Object.fromEntries(params.entries());
      const next = search(prev);
      const nextParams = new URLSearchParams();

      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== null) nextParams.set(k, String(v));
      });

      replace
        ? router.replace(`${pathName}?${nextParams.toString()}`)
        : router.push(`${pathName}?${nextParams.toString()}`);
      return;
    }

    if (typeof search === "object" && search !== null) {
      const nextParams = new URLSearchParams();
      Object.entries(search).forEach(([k, v]) => {
        if (v !== undefined && v !== null) nextParams.set(k, String(v));
      });

      replace
        ? router.replace(`${pathName}?${nextParams.toString()}`)
        : router.push(`${pathName}?${nextParams.toString()}`);
      return;
    }

    replace
      ? router.replace(`${pathName}?${params.toString()}`)
      : router.push(`${pathName}?${params.toString()}`);
  };

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
    globalFilter,
  } = useTableUrlState({
    search: searchObj,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 5 },
    globalFilter: { enabled: true, key: "search", trim: true },
    columnFilters: [
      { columnId: "name", searchKey: "name", type: "string" },
      { columnId: "supplierId", searchKey: "supplierId", type: "array" },
      // { columnId: "userId", searchKey: "userId", type: "array" },
      // { columnId: "paintGradeId", searchKey: "paintGradeId", type: "array" },
    ],
  });

  const searchTerm = typeof globalFilter === "string" ? globalFilter : "";

  const { data: suppliers } = trpc.supplier.getAll.useQuery();
  const { data: users } = trpc.user.getAll.useQuery();
  const { data: grades } = trpc.paintGrade.getAll.useQuery();

  const { data, isLoading } = trpc.rawMaterial.getPaginated.useQuery(
    {
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search: searchTerm,
    },
    {
      refetchOnWindowFocus: false,
      placeholderData: (prev) => prev,
    },
  );

  useEffect(() => {
    if (data) ensurePageInRange(data.meta.lastPage);
  }, [data, ensurePageInRange]);

  const tableData: RawMaterial[] =
    data?.data.map((item) => ({
      ...item,
      supplier: {
        ...item.supplier,
        description: item.supplier.description ?? undefined,
      },
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })) ?? [];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: data?.meta.lastPage ?? 1,
  });

  if (isLoading) return <OnLoadItem isLoading={isLoading} />;

  if (!data || tableData.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>Belum Ada Bahan Baku</EmptyTitle>
          <EmptyDescription>
            Belum ada bahan baku yang terdata. Silakan tambahkan bahan baku
            terlebih dahulu.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => setOpen("add")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </EmptyContent>

        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col gap-4")}>
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Cari bahan baku..."
        filters={[
          {
            columnId: "supplierId",
            title: "Supplier",
            options: suppliers?.map((supplier) => ({
              label: supplier.name,
              value: supplier.id,
            })),
          },
          // {
          //   columnId: "userId",
          //   title: "Pengguna",
          //   options: users?.map((user) => ({
          //     label: user.name,
          //     value: user.id,
          //     icon: UserCheck,
          //   })),
          // },
          // {
          //   columnId: "paintGradeId",
          //   title: "Grade",
          //   options: grades?.map((grade) => ({
          //     label: grade.name,
          //     value: grade.id,
          //     icon: CircleStar,
          //   })),
          // },
        ]}
      />

      <Button onClick={() => setOpen("add")} size="lg">
        <Plus className="h-4 w-4" />
        Tambah Data
      </Button>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={pagination.pageIndex + 1}
        lastPage={data.meta.lastPage}
        perPage={pagination.pageSize}
        totalItems={data.meta.totalItems}
        onPageChange={(page) =>
          onPaginationChange({
            pageIndex: page - 1,
            pageSize: pagination.pageSize,
          })
        }
        onPerPageChange={(perPage) =>
          onPaginationChange({
            pageIndex: 0,
            pageSize: perPage,
          })
        }
      />

      <DataTableBulkActions table={table} />
    </div>
  );
}
