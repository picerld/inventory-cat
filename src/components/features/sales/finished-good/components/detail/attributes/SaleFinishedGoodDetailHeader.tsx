import { ChevronLeft, Download, Edit, Printer } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "~/components/ui/button";
import type { SaleFinishedGoodFull } from "~/types/sale";

export const SaleFinishedGoodDetailHeader = ({
  data,
}: {
  data: SaleFinishedGoodFull;
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/sales/finished-goods"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Kembali
      </Link>

      <div className="flex flex-wrap gap-2">
        {data.status !== "FINISHED" && data.status !== "CANCELED" && (
          <Link
            href={`/sales/finished-goods/${data.id}/edit`}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        )}
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Cetak
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>
    </div>
  );
};
