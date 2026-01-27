"use client";

import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined, Loader } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { PurchaseRawMaterialForm } from "~/components/features/purchases/raw-material/components/PurchaseRawMaterialForm";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";

function getQueryId(q: string | string[] | undefined) {
  if (!q) return undefined;
  return Array.isArray(q) ? q[0] : q;
}

export default function PurchaseRawMaterialEditPage() {
  const router = useRouter();
  const id = getQueryId(router.query.id);

  const { data: initialData, isLoading, isError, error } =
    trpc.purchase.getById.useQuery(
      { id: id! },
      {
        enabled: !!id,
      },
    );

  return (
    <GuardedLayout>
      <HeadMetaData title="Edit Pembelian Bahan Baku" />

      <Link
        href="/purchases/raw-materials"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <Header
        title="Pembelian Bahan Baku"
        subtitle="Ubah pembelian bahan baku (hanya boleh jika masih DRAFT)"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      {!id || isLoading ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin" />
            Memuat data pembelian...
          </div>
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-xl border p-6">
          <p className="text-sm font-semibold">Gagal memuat data.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {error.message}
          </p>
        </div>
      ) : !initialData ? (
        <div className="mt-8 rounded-xl border p-6">
          <p className="text-sm font-semibold">Data tidak ditemukan.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            ID purchase tidak valid atau sudah terhapus.
          </p>
        </div>
      ) : (
        // @ts-expect-error type initialdata
        <PurchaseRawMaterialForm mode="edit" initialData={initialData} />
      )}
    </GuardedLayout>
  );
}
