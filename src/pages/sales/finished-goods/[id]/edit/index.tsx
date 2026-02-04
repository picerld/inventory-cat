import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { SaleFinishedGoodForm } from "~/components/features/sales/finished-good/components/SaleFinishedGoodForm";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";

export default function SaleFinishedGoodEditPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = trpc.sale.getByIdFinishedGood.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isLoading) return <Skeleton />;

  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Barang Jadi" />
      <Link
        href="/sales/finished-goods"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <SaleFinishedGoodForm initialData={data?.sale} mode="edit" />
    </GuardedLayout>
  );
}
