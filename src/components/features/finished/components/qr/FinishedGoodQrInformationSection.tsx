import { InfoRow } from "~/components/features/qr-code/InfoRow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { FinishedGood } from "~/types/finished-good";
import { FinishedGoodMaterialInformationSection } from "./FinishedGoodMaterialInformationSection";

export const FinishedGoodQrInformationSection = ({
  qrData,
}: {
  qrData: {
    item: FinishedGood;
  };
}) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Informasi Detail</CardTitle>
        <CardDescription>Detail informasi barang jadi</CardDescription>
      </CardHeader>
      <CardContent className="max-h-100 space-y-4 overflow-y-auto">
        <div className="space-y-3">
          <InfoRow label="Jumlah Stok" value={`${qrData.item.qty} unit`} />
          <InfoRow label="Kode Produksi" value={qrData.item.productionCode} />
          <InfoRow label="Nomor Batch" value={qrData.item.batchNumber} />
          <InfoRow
            label="Tanggal Produksi"
            value={new Date(qrData.item.dateProduced).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              },
            )}
          />
          <InfoRow label="Pengguna" value={qrData.item.user.name} />
        </div>

        <FinishedGoodMaterialInformationSection qrData={qrData} />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Informasi QR</h4>
          <InfoRow label="Format" value="PNG, High Quality" />
          <InfoRow
            label="Tanggal Dibuat"
            value={new Date(qrData.item.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
          <InfoRow
            label="Terakhir Diupdate"
            value={new Date(qrData.item.updatedAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
