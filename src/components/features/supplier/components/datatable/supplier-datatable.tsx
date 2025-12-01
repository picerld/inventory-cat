"use client";

import { columns } from "./column";
import { DataTable } from "./data-table";
import { trpc } from "~/utils/trpc";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTablePagination } from "~/components/datatable/data-table-pagination";
import useDebounce from "~/hooks/use-debounce";
import type { Supplier } from "~/types/supplier";
import { UpdateSupplierForm } from "../../update/UpdateSupplierForm";
import { OnLoadItem } from "~/components/dialog/OnLoadItem";

export function SupplierDatatable() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setPerPage(Number(searchParams.get("perPage")) || 5);
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const debouncedSearch = useDebounce(search, 1000);

  const [selectedSupplier, setselectedSupplier] = useState<Supplier | null>(
    null,
  );

  const { data, isLoading } = trpc.supplier.getPaginated.useQuery(
    { page, perPage, search: debouncedSearch },
    {
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
    },
  );

  if (isLoading) {
    return <OnLoadItem isLoading={isLoading} />;
  }

  if (!data) return <div>No data</div>;

  // @ts-expect-error type
  const tableData: Supplier[] = data.data.map((item) => ({
    ...item,
    description: item.description ?? undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const params = new URLSearchParams(searchParams);
    params.set("search", e.target.value);
    params.set("page", "1");
    router.push(`${pathName}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    params.set("perPage", String(perPage));
    if (search) params.set("search", search);
    router.push(`${pathName}?${params.toString()}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("perPage", String(newPerPage));
    params.set("page", "1");
    if (search) params.set("search", search);
    router.push(`${pathName}?${params.toString()}`);
  };

  return (
    <div className="w-sm overflow-x-auto py-10 sm:w-full px-3">
      <DataTable
        search={search}
        columns={columns(setselectedSupplier)}
        data={tableData}
        isLoading={isLoading}
        handleSearch={handleSearchChange}
      />

      <DataTablePagination
        currentPage={data.meta.currentPage}
        lastPage={data.meta.lastPage}
        perPage={data.meta.perPage}
        totalItems={data.meta.totalItems}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {selectedSupplier && (
        <UpdateSupplierForm
          supplierId={selectedSupplier.id}
          open={!!selectedSupplier}
          onClose={() => setselectedSupplier(null)}
        />
      )}
    </div>
  );
}
