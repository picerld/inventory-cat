import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import { PurchaseAccessoriesForm } from "~/components/features/purchases/accessories/components/PurchaseAccessoriesForm";

export default function PurchaseAccessoriesEditPage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");

  const { data, isLoading, error } = trpc.purchase.getByIdAccessories.useQuery(
    { id },
    { enabled: Boolean(id) },
  );

  return (
    <GuardedLayout>
      <HeadMetaData title="Edit Pembelian Aksesoris" />

      <Link
        href="/purchases/accessories"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <Header
        title="Edit Pembelian Accessories"
        subtitle="Ubah data pembelian selama status masih DRAFT"
      />

      {isLoading ? (
        <div className="rounded-xl border-2 p-4">Loading...</div>
      ) : error ? (
        <div className="rounded-xl border-2 p-4">Error: {error.message}</div>
      ) : (
        <PurchaseAccessoriesForm mode="edit" initialData={data?.purchase ?? null} />
      )}
    </GuardedLayout>
  );
}
