import Link from "next/link";
import { cn } from "~/lib/utils";
import type { StockMovementRow } from "~/types/stock-movement";
import {
  badgeClassByType,
  formatQty,
  getRefLabel,
  itemTypeLabel,
  movementTypeLabel,
  topBorderByType,
} from "../lib/utils";
import { Badge } from "~/components/ui/badge";

type StockMovementCardProps = {
  m: StockMovementRow;
};

export const StockMovementCard = ({ m }: StockMovementCardProps) => {
  const createdAt = new Date(m.createdAt);

  return (
    <Link key={m.id} href={`/reports/stock-movements/${m.id}`}>
      <div
        className={cn(
          "group bg-card relative flex items-start justify-between gap-3 rounded-xl p-4",
          "border-x border-t-[6px] border-b",
          "transition-all",
          "hover:-translate-y-px hover:shadow-md",
          topBorderByType(m.type),
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs",
                badgeClassByType(m.type),
              )}
            >
              {movementTypeLabel(m.type)}
            </Badge>

            <span className="text-muted-foreground text-xs">
              {createdAt.toLocaleString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="mt-2 text-sm">
            <span className="font-medium">{itemTypeLabel(m.itemType)}</span>
            <span className="text-muted-foreground"> • </span>
            <span className="text-muted-foreground">{getRefLabel(m)}</span>
          </div>

          <div className="text-muted-foreground mt-1 text-xs">
            By {m.user?.name ?? "-"}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold">{formatQty(m.qty)}</p>
          <p className="text-muted-foreground text-xs">qty</p>
        </div>
      </div>
    </Link>
  );
};
