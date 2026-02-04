import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type SaleFinishedGoodHeaderProps = {
  statusConfig?: {
    label: string;
    className: string;
  };
  mode: "create" | "edit";
};

export const SaleFinishedGoodHeader = ({
  statusConfig,
  mode,
}: SaleFinishedGoodHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "create" ? "Penjualan Barang Jadi" : "Edit Penjualan"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Tambahkan penjualan barang jadi baru."
            : "Edit penjualan barang jadi."}
        </p>
      </div>

      {statusConfig && (
        <Badge className={cn("text-sm", statusConfig.className)}>
          {statusConfig.label}
        </Badge>
      )}
    </div>
  );
};
