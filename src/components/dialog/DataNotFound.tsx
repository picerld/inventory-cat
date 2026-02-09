"use client";

import { SearchX } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

type DataNotFoundProps = {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
};

export function DataNotFound({
  title = "Data tidak ditemukan",
  description = "Coba ubah kata kunci pencarian atau filter yang kamu pakai.",
  onReset,
  resetLabel = "Reset Filter",
}: DataNotFoundProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset} disabled={!onReset}>
            {resetLabel}
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
