"use client";

import { useState, useEffect } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle, Loader } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { trpc } from "~/utils/trpc";
import type { PaintGrade } from "~/types/pain-grade";

type GradeMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function GradesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: GradeMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");
  const utils = trpc.useUtils();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row) => (row.original as PaintGrade).id,
  );

  useEffect(() => {
    if (!open) {
      setValue("");
    }
  }, [open]);

  const { mutate: deleteGrades, isPending } =
    trpc.paintGrade.deleteMany.useMutation({
      onSuccess: (data) => {
        toast.success("Berhasil!", {
          description: `${data.count || selectedIds.length} grade berhasil dihapus`,
        });

        utils.paintGrade.getPaginated.invalidate();
        utils.paintGrade.getStats.invalidate();

        table.resetRowSelection();
        setValue("");
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Delete many error:", error);
        toast.error("Gagal!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : error.message || "Terjadi kesalahan saat menghapus grade",
        });
      },
    });

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Silakan ketik "${CONFIRM_WORD}" untuk konfirmasi`);
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Tidak ada grade yang dipilih");
      return;
    }

    deleteGrades({ ids: selectedIds });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!isPending) {
          setValue("");
          onOpenChange(state);
        }
      }}
      handleConfirm={handleDelete}
      disabled={
        value.trim() !== CONFIRM_WORD || isPending || selectedIds.length === 0
      }
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{" "}
          Hapus {selectedRows.length}{" "}
          {selectedRows.length > 1 ? "grades" : "grade"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Apakah anda yakin ingin menghapus data {selectedRows.length} grade{" "}
            {selectedRows.length > 1 ? "s" : ""}? <br />
            Data yang telah dihapus tidak dapat dikembalikan.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Ketik &quot;{CONFIRM_WORD}&quot;:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              disabled={isPending}
              autoComplete="off"
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Data yang telah dihapus tidak dapat dikembalikan.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={
        isPending ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" /> Loading...
          </>
        ) : (
          "Hapus Semua"
        )
      }
      destructive
    />
  );
}
