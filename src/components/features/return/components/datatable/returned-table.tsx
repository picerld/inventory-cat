"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { DataTableToolbar } from "~/components/datatable/data-table-toolbar"; // <-- pakai versi fixed di atas
import { DataTableBulkActions } from "./data-table-bulk-action";
import { returnGoodsColumns as columns } from "./returned-column";
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

import { ArrowUpRightIcon, ChevronDown, Folder, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useReturnedGoods } from "./returned-provider";
import type { ReturnGood } from "~/types/return-good";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

function parseSortParam(sortParam: string | null): SortingState {
  if (!sortParam) return [];
  return sortParam
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [id, dir] = p.split(".");
      return { id, desc: dir === "desc" };
    });
}
function serializeSortParam(sorting: SortingState): string | undefined {
  if (!sorting.length) return undefined;
  return sorting.map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`).join(",");
}

export function ReturnedGoodsTable() {
  const { setOpen } = useReturnedGoods();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const searchObj = useMemo<Record<string, unknown>>(() => {
    const entries = Array.from(searchParams?.entries() ?? []).map(([k, v]) => {
      if (k === "sort") return [k, v];

      const n = Number(v);
      return [k, !isNaN(n) && String(n) === v ? n : v];
    });
    return Object.fromEntries(entries);
  }, [searchParams]);

  const navigate: NavigateFn = ({ search, replace }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    const go = (nextParams: URLSearchParams) => {
      replace
        ? router.replace(`${pathName}?${nextParams.toString()}`)
        : router.push(`${pathName}?${nextParams.toString()}`);
    };

    if (typeof search === "function") {
      const prev = Object.fromEntries(params.entries());
      const next = search(prev);
      const nextParams = new URLSearchParams();

      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== "") {
          nextParams.set(k, String(v));
        }
      });

      return go(nextParams);
    }

    if (typeof search === "object" && search !== null) {
      const nextParams = new URLSearchParams();
      Object.entries(search).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== "") {
          nextParams.set(k, String(v));
        }
      });

      return go(nextParams);
    }

    return go(params);
  };

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
    globalFilter,
    onGlobalFilterChange,
  } = useTableUrlState({
    search: searchObj,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 5 },
    globalFilter: { enabled: true, key: "search", trim: true },
    columnFilters: [
      {
        columnId: "finishedGoodId",
        searchKey: "finishedGoodId",
        type: "string",
      },
    ],
  });

  const searchTerm = typeof globalFilter === "string" ? globalFilter : "";

  const [sorting, setSorting] = useState<SortingState>(() => {
    const raw = searchObj.sort;
    return typeof raw === "string" ? parseSortParam(raw) : [];
  });

  useEffect(() => {
    const raw = searchObj.sort;
    const next = typeof raw === "string" ? parseSortParam(raw) : [];
    if (JSON.stringify(next) !== JSON.stringify(sorting)) setSorting(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchObj.sort]);

  const onSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        navigate({
          search: (prevSearch) => ({
            ...prevSearch,
            page: undefined,
            sort: serializeSortParam(next),
          }),
        });
        return next;
      });
    },
    [navigate],
  );

  const filterPayload = useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const f of columnFilters) obj[f.id] = f.value;

    return {
      finishedGoodId:
        typeof obj.finishedGoodId === "string" ? obj.finishedGoodId : undefined,
    };
  }, [columnFilters]);

  const { data, isLoading } = trpc.returnGood.getPaginated.useQuery(
    {
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search: searchTerm,
      filters: filterPayload,
      sort: sorting.map((s) => ({ id: s.id, desc: s.desc })),
    },
    {
      refetchOnWindowFocus: false,
      placeholderData: (prev) => prev,
    },
  );

  useEffect(() => {
    if (data) ensurePageInRange(data.meta.lastPage);
  }, [data, ensurePageInRange]);

  const tableData: ReturnGood[] =
    data?.data.map((item) => ({
      ...item,
      description: item.description ?? undefined,
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
      globalFilter: searchTerm,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: data?.meta.lastPage ?? 1,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <OnLoadItem isLoading={isLoading} />;

  if (!data) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>Belum Ada Barang Retur</EmptyTitle>
          <EmptyDescription>
            Belum ada barang yang diretur. Silakan catat barang retur terlebih
            dahulu.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => setOpen("add")}>
              <Plus className="mr-2 h-4 w-4" />
              Catat Barang Retur
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
      <DataTableToolbar table={table} searchPlaceholder="Cari nama barang...">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="border-dashed px-2 lg:px-3"
              variant="outline"
              size={"sm"}
            >
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
      </DataTableToolbar>

      <Button onClick={() => setOpen("add")} size="lg">
        <Plus className="h-4 w-4" />
        Catat Barang Retur
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
          onPaginationChange({ pageIndex: 0, pageSize: perPage })
        }
      />

      <DataTableBulkActions table={table} />
    </div>
  );
}
