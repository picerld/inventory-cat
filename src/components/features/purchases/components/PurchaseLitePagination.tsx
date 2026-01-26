import { Button } from "~/components/ui/button";

type PurchaseListPaginationProps = {
  data: {
    currentPage: number;
    lastPage: number;
  };
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isFetching: boolean;
};

export const PurchaseLitePagination = ({
  data,
  setPage,
  isFetching,
}: PurchaseListPaginationProps) => {
  return (
    <div className="mt-5 flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Page {data.currentPage} of {data.lastPage}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={data.currentPage <= 1 || isFetching}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(data.lastPage, p + 1))}
          disabled={data.currentPage >= data.lastPage || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
