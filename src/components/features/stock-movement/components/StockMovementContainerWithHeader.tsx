import { cn } from "~/lib/utils";
import type { StockMovementRow } from "~/types/stock-movement";
import { formatQty } from "../lib/utils";
import { StockMovementCard } from "./StockMovementCard";

type StockMovementContainerWithHeaderProps = {
  groupedData: Record<string, StockMovementRow[]>;
  groupBy: "none" | "day" | "month";
  getGroupTotal: (movements: StockMovementRow[]) => number;
};

export const StockMovementContainerWithHeader = ({
  groupedData,
  groupBy,
  getGroupTotal,
}: StockMovementContainerWithHeaderProps) => {
  return (
    <div className="mt-8 space-y-8">
      {Object.entries(groupedData).map(([dateKey, movements]) => {
        const totalQty = getGroupTotal(movements);

        return (
          <div key={dateKey} className="space-y-3">
            {groupBy !== "none" && (
              <div className="bg-muted/50 sticky top-0 z-10 flex items-center justify-between rounded-lg border px-4 py-3 backdrop-blur-sm">
                <div>
                  <h3 className="text-sm font-semibold">{dateKey}</h3>
                  <p className="text-muted-foreground text-xs">
                    {movements.length} transaksi
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-lg font-bold",
                      totalQty > 0
                        ? "text-emerald-600"
                        : totalQty < 0
                          ? "text-rose-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {totalQty > 0 ? "+" : ""}
                    {formatQty(totalQty)}
                  </p>
                  <p className="text-muted-foreground text-xs">Net Perubahan</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {movements.map((m) => {
                return <StockMovementCard key={m.id} m={m} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
