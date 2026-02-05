import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";

type SaleLitePaginationProps = {
  meta: { page: number; perPage: number; total: number; totalPages: number };
  page: number;
  totalPages: number;
  isFetching: boolean;
  setPage: (p: number) => void;
};

export const SaleLitePagination = ({
  meta,
  page,
  totalPages,
  setPage,
  isFetching,
}: SaleLitePaginationProps) => {
  return (
    <div className="bg-card flex items-center justify-between rounded-2xl border p-4">
      <div className="text-muted-foreground text-sm">
        Halaman <span className="text-foreground font-semibold">{page}</span>{" "}
        dari <span className="text-foreground font-semibold">{totalPages}</span>{" "}
        • Total{" "}
        <span className="text-foreground font-semibold">
          {meta?.total ?? 0}
        </span>{" "}
        data
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page >= totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
