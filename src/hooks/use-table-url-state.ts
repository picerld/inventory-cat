import { useMemo, useState, useCallback, useEffect } from "react";
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

type SearchRecord = Record<string, unknown>;

export type NavigateFn = (opts: {
  search:
    | true
    | SearchRecord
    | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord);
  replace?: boolean;
}) => void;

type UseTableUrlStateParams = {
  search: SearchRecord;
  navigate: NavigateFn;
  pagination?: {
    pageKey?: string;
    pageSizeKey?: string;
    defaultPage?: number;
    defaultPageSize?: number;
  };
  globalFilter?: {
    enabled?: boolean;
    key?: string;
    trim?: boolean;
  };
  sorting?: {
    enabled?: boolean;
    key?: string;
  };
  columnFilters?: Array<
    | {
        columnId: string;
        searchKey: string;
        type?: "string";
        serialize?: (value: unknown) => unknown;
        deserialize?: (value: unknown) => unknown;
      }
    | {
        columnId: string;
        searchKey: string;
        type: "array";
        serialize?: (value: unknown) => unknown;
        deserialize?: (value: unknown) => unknown;
      }
  >;
};

function parseSort(sortParam: unknown): SortingState {
  if (typeof sortParam !== "string" || !sortParam.trim()) return [];
  return sortParam
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [id, dir] = p.split(".");
      return { id, desc: dir === "desc" };
    });
}

function serializeSort(sorting: SortingState): string | undefined {
  if (!sorting.length) return undefined;
  return sorting.map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`).join(",");
}

export function useTableUrlState(params: UseTableUrlStateParams) {
  const {
    search,
    navigate,
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    sorting: sortingCfg,
    columnFilters: columnFiltersCfg = [],
  } = params;

  const pageKey = paginationCfg?.pageKey ?? "page";
  const pageSizeKey = paginationCfg?.pageSizeKey ?? "pageSize";
  const defaultPage = paginationCfg?.defaultPage ?? 1;
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10;

  const globalFilterKey = globalFilterCfg?.key ?? "filter";
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true;
  const trimGlobal = globalFilterCfg?.trim ?? true;

  const sortingEnabled = sortingCfg?.enabled ?? false;
  const sortingKey = sortingCfg?.key ?? "sort";

  const deriveColumnFilters = useCallback(() => {
    const collected: ColumnFiltersState = [];

    for (const cfg of columnFiltersCfg) {
      const raw = search[cfg.searchKey];
      const deserialize = cfg.deserialize ?? ((v) => v);

      if (cfg.type === "string" || !cfg.type) {
        const value = (deserialize(raw) as string) ?? "";
        if (value.trim()) collected.push({ id: cfg.columnId, value });
      } else {
        const arr = (deserialize(raw) as unknown[]) ?? [];
        if (Array.isArray(arr) && arr.length > 0) {
          collected.push({ id: cfg.columnId, value: arr });
        }
      }
    }

    return collected;
  }, [columnFiltersCfg, search]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    deriveColumnFilters(),
  );

  useEffect(() => {
    const nextFilters = deriveColumnFilters();
    if (JSON.stringify(nextFilters) !== JSON.stringify(columnFilters)) {
      setColumnFilters(nextFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, deriveColumnFilters]);

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;

        const patch: Record<string, unknown> = {};

        for (const cfg of columnFiltersCfg) {
          const found = next.find((f) => f.id === cfg.columnId);
          const serialize = cfg.serialize ?? ((v) => v);

          if (cfg.type === "string" || !cfg.type) {
            const value =
              typeof found?.value === "string" ? found.value.trim() : "";
            patch[cfg.searchKey] = value ? serialize(value) : undefined;
          } else {
            const arr = Array.isArray(found?.value) ? found!.value : [];
            patch[cfg.searchKey] = arr.length > 0 ? serialize(arr) : undefined;
          }
        }

        navigate({
          search: (prevSearch) => ({
            ...prevSearch,
            [pageKey]: undefined,
            ...patch,
          }),
        });

        return next;
      });
    },
    [columnFiltersCfg, navigate, pageKey],
  );

  const pagination: PaginationState = useMemo(() => {
    const rawPage = search[pageKey];
    const rawPageSize = search[pageSizeKey];

    return {
      pageIndex:
        typeof rawPage === "number"
          ? Math.max(0, rawPage - 1)
          : defaultPage - 1,
      pageSize: typeof rawPageSize === "number" ? rawPageSize : defaultPageSize,
    };
  }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize]);

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;

      const nextPage = next.pageIndex + 1;
      const nextPageSize = next.pageSize;

      if (
        nextPage === search[pageKey] &&
        nextPageSize === search[pageSizeKey]
      ) {
        return;
      }

      navigate({
        search: (prev) => ({
          ...prev,
          [pageKey]: nextPage === defaultPage ? undefined : nextPage,
          [pageSizeKey]:
            nextPageSize === defaultPageSize ? undefined : nextPageSize,
        }),
      });
    },
    [
      pagination,
      navigate,
      search,
      pageKey,
      pageSizeKey,
      defaultPage,
      defaultPageSize,
    ],
  );

  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    const raw = search[globalFilterKey];
    return typeof raw === "string" ? raw : "";
  });

  useEffect(() => {
    const raw = search[globalFilterKey];
    const value = typeof raw === "string" ? raw : "";
    if (value !== globalFilter) setGlobalFilter(value);
  }, [search, globalFilterKey, globalFilter]);

  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? useCallback(
          (updater) => {
            const next =
              typeof updater === "function" ? updater(globalFilter) : updater;

            const value = trimGlobal ? next.trim() : next;
            if (value === globalFilter) return;

            setGlobalFilter(value);

            navigate({
              search: (prev) => ({
                ...prev,
                [pageKey]: undefined,
                [globalFilterKey]: value ? value : undefined,
              }),
            });
          },
          [globalFilter, navigate, pageKey, globalFilterKey, trimGlobal],
        )
      : undefined;

  const sorting: SortingState = useMemo(() => {
    if (!sortingEnabled) return [];
    return parseSort(search[sortingKey]);
  }, [search, sortingKey, sortingEnabled]);

  const onSortingChange: OnChangeFn<SortingState> | undefined = sortingEnabled
    ? useCallback(
        (updater) => {
          const next =
            typeof updater === "function" ? updater(sorting) : updater;

          navigate({
            search: (prev) => ({
              ...prev,
              [pageKey]: undefined,
              [sortingKey]: serializeSort(next),
            }),
          });
        },
        [navigate, sorting, sortingKey, pageKey],
      )
    : undefined;

  const ensurePageInRange = useCallback(
    (pageCount: number, opts = { resetTo: "first" as const }) => {
      const current = search[pageKey];
      const currentPage = typeof current === "number" ? current : defaultPage;

      if (pageCount > 0 && currentPage > pageCount) {
        navigate({
          replace: true,
          search: (prev) => ({
            ...prev,
            [pageKey]: opts.resetTo === "last" ? pageCount : undefined,
          }),
        });
      }
    },
    [search, navigate, pageKey, defaultPage],
  );

  return {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  };
}
