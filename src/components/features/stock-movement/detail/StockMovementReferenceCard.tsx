import { cn } from "~/lib/utils";

export const StockMovementReferenceCard = ({
  icon: Icon,
  label,
  value,
  hasValue,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hasValue: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "group bg-card relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md",
        hasValue ? "border-primary/20" : "border-border",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            hasValue
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p
            className={cn(
              "mt-1 truncate text-sm font-medium",
              hasValue ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {value}
          </p>
        </div>
      </div>
      {hasValue && (
        <div className="from-primary/20 via-primary/40 to-primary/20 absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r" />
      )}
    </div>
  );
};
