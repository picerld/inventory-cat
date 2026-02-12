import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import { SaleErrorsDialog } from "~/components/features/sales/components/SaleErrorsDialog";
import { SaleAccessoriesDetailContainer } from "~/components/features/sales/accessories/components/detail/SaleAccessoriesDetailContainer";

export default function SaleAccessoriesDetailPage() {
  const router = useRouter();
  const { id: saleId } = router.query;

  const {
    data: sale,
    isLoading,
    isError,
  } = trpc.sale.getByIdAccessories.useQuery(
    { id: saleId as string },
    { enabled: !!saleId },
  );

  if (isLoading) {
    return (
      <GuardedLayout>
        <HeadMetaData title="Detail Penjualan Aksesoris" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-150 w-full" />
            </div>
          </div>
        </div>
      </GuardedLayout>
    );
  }

  if (isError || !sale) {
    return (
      <GuardedLayout>
        <HeadMetaData title="Detail Penjualan Barang Jadi" />
        <SaleErrorsDialog
          href="/sales/finished-goods"
          text="Kembali ke Daftar Penjualan"
        />
      </GuardedLayout>
    );
  }

  const items = sale.sale.items ?? [];
  const data = sale.sale;

  return (
    <GuardedLayout>
      <HeadMetaData title={`Detail Penjualan - ${data.saleNo}`} />

      <SaleAccessoriesDetailContainer data={data} items={items} />
    </GuardedLayout>
  );
}
