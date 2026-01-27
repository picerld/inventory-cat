import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { StockMovementList } from "./components/StockMovementList";

export default function StockMovementsPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Mutasi Stok" />
      
      <Header
        title="Mutasi Stok"
        subtitle="Semua mutasi stok dari pembelian, penjualan, produksi, retur, dan penyesuaian."
      />

      <StockMovementList />
    </GuardedLayout>
  );
}
