"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Supplier } from "~/types/supplier";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";

type SupplierDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Supplier;
};

export function SuppliersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: SupplierDeleteDialogProps) {
  const [value, setValue] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!open) {
      setValue("");
    }
  }, [open]);

  const { mutate: deleteSupplier, isPending } =
    trpc.supplier.delete.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!", {
          description: "Supplier berhasil dihapus!",
        });

        utils.supplier.getPaginated.invalidate();
        utils.supplier.getStats.invalidate();

        setValue("");
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("Gagal!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : error.message || "Terjadi kesalahan saat menghapus supplier",
        });
      },
    });

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) {
      toast.error("Nama tidak cocok", {
        description:
          "Silakan ketik nama supplier dengan benar untuk konfirmasi",
      });
      return;
    }

    console.log("Deleting supplier with ID:", currentRow.id);
    deleteSupplier({ id: currentRow.id });
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
      disabled={value.trim() !== currentRow.name || isPending}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={20}
          />{" "}
          Hapus Data Supplier
        </span>
      }
      desc={
        <div className="space-y-4">
          <p>
            Apakah anda yakin ingin menghapus supplier{" "}
            <span className="font-bold">{currentRow.name}</span>?
            <br />
            Data supplier yang sudah dihapus tidak dapat dikembalikan.
          </p>

          <Label className="my-2 flex flex-col items-start gap-1.5">
            <span className="text-sm font-semibold">
              Masukkan nama supplier:
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentRow.name}
              disabled={isPending}
              autoComplete="off"
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Data supplier yang sudah dihapus tidak dapat dikembalikan.
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
          "Hapus"
        )
      }
      destructive
    />
  );
}
