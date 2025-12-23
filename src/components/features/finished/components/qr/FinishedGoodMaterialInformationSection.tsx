import { Layers, Package } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { FinishedGood } from "~/types/finished-good";

export const FinishedGoodMaterialInformationSection = ({
  qrData,
}: {
  qrData: {
    item: FinishedGood;
  };
}) => {
  const details = qrData.item.finishedGoodDetails ?? [];

  const rawMaterialDetails = details.filter((d) => !d.semiFinishedGood);
  const semiFinishedDetails = details.filter((d) => d.semiFinishedGood);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4" />
          Ringkasan Material
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Bahan Baku</p>
            <p className="text-lg font-semibold">{rawMaterialDetails.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Setengah Jadi</p>
            <p className="text-lg font-semibold">
              {semiFinishedDetails.length}
            </p>
          </div>
        </div>
      </div>

      {semiFinishedDetails.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-4 w-4" />
                Barang Setengah Jadi
              </h4>
              <Badge variant="secondary" className="text-xs">
                {semiFinishedDetails.length} item
              </Badge>
            </div>
            <div className="space-y-2">
              {semiFinishedDetails.map((detail, index) => (
                <div
                  key={detail.id}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {detail.semiFinishedGood?.name ?? "-"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Digunakan: {detail.qty} unit
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {rawMaterialDetails.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4" />
                Bahan Baku
              </h4>
              <Badge variant="secondary" className="text-xs">
                {rawMaterialDetails.length} item
              </Badge>
            </div>
            <div className="space-y-2">
              {rawMaterialDetails.map((detail, index) => (
                <div key={detail.id} className="bg-card rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {detail.rawMaterial?.name ?? "-"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Digunakan: {detail.qty} unit
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
