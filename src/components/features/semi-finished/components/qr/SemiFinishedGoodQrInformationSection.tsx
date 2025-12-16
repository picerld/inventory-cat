import { InfoRow } from "~/components/features/qr-code/InfoRow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { SemiFinishedGood } from "~/types/semi-finished-good";

export const SemiFinishedGoodQrInformationSection = ({
  qrData,
}: {
  qrData: {
    item: SemiFinishedGood;
  };
}) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Informasi Detail</CardTitle>
        <CardDescription>Detail informasi barang setengah jadi</CardDescription>
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
        <InfoRow
          label="Jumlah Material"
          value={`${qrData.item.SemiFinishedGoodDetail.length} item`}
        />
        <InfoRow label="Pengguna" value={qrData.item.user.name} />
      </CardContent>
    </Card>
  );
};
