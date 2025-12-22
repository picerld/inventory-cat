import { InfoRow } from "~/components/features/qr-code/InfoRow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { FinishedGood } from "~/types/finished-good";

export const FinishedGoodQrInformationSection = ({
  qrData,
}: {
  qrData: {
    item: FinishedGood;
  };
}) => {
    console.log(qrData.item.finishedGoodDetails);
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Informasi Detail</CardTitle>
        <CardDescription>Detail informasi barang jadi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Jumlah Stok" value={`${qrData.item.qty} unit`} />
        <InfoRow label="Format QR" value="PNG, High Quality" />
        <InfoRow
          label="Tanggal Dibuat"
          value={new Date(qrData.item.createdAt).toLocaleDateString("id-ID")}
        />
        <InfoRow
          label="Terakhir Diupdate"
          value={new Date(qrData.item.updatedAt).toLocaleDateString("id-ID")}
        />
        {qrData.item.finishedGoodDetails.map((detail) => (
          <div key={detail.id} className="space-y-3">
            <InfoRow
              key={detail.id}
              label="Jumlah Bahan Baku"
              value={`${detail?.rawMaterial?.name ?? "-"}`}
            />
            <InfoRow
              key={detail.id}
              label="Jumlah Barang Setengah Jadi"
              value={`${detail?.semiFinishedGood?.name ?? "-"}`}
            />
          </div>
        ))}
        <InfoRow
          label="Jumlah Material"
          value={`${qrData.item.finishedGoodDetails.length} item`}
        />
        <InfoRow label="Pengguna" value={qrData.item.user.name} />
      </CardContent>
    </Card>
  );
};
