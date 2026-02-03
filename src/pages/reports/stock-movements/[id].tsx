"use client";

import * as React from "react";
import { useRouter } from "next/router";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  ChevronLeft,
  FileText,
} from "lucide-react";
import { StockMovementDetailContainer } from "~/components/features/stock-movement/detail/StockMovementDetailContainer";

export default function StockMovementDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const q = trpc.stockMovement.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id },
  );

  return (
    <GuardedLayout>
      <HeadMetaData title="Stock Movement Detail" />

      <div className="mx-auto space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/reports/stock-movements"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-2",
            })}
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
          <div className="bg-border h-6 w-px" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Detail Laporan Stok
          </h1>
        </div>

        {!id || q.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : q.isError ? (
          <div className="border-destructive/20 bg-destructive/5 rounded-2xl border p-8 text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="text-destructive h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Failed to Load</h3>
            <p className="text-muted-foreground text-sm">{q.error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <StockMovementDetailContainer q={q.data} />
        )}
      </div>
    </GuardedLayout>
  );
}
