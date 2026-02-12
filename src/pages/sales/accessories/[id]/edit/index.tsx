import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import { SaleAccessoriesForm } from "~/components/features/sales/accessories/components/SaleAccessoriesForm";

export default function SaleAccessoriesEditPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = trpc.sale.getByIdAccessories.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isLoading) return <Skeleton />;

  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Aksesoris" />
      <Link
        href="/sales/accessories"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <SaleAccessoriesForm initialData={data?.sale} mode="edit" />
    </GuardedLayout>
  );
}
