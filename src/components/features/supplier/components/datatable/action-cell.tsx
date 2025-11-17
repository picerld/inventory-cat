"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { SquarePen } from "lucide-react";
import { OnDeleteLoadingDialog } from "~/components/dialog/onDeleteConfirmationDialog";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import type { Supplier } from "~/types/supplier";

type ActionsCellProps = {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
};

export const ActionsCell: React.FC<ActionsCellProps> = ({
  supplier,
  onEdit,
}) => {
  const utils = trpc.useUtils();

  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const deleteSupplier = trpc.supplier.delete.useMutation();

  const handleDeleteSupplier = async (categoryId: string) => {
    try {
      setDeleteStatus("loading");

      await deleteSupplier.mutateAsync({ id: categoryId });

      setDeleteStatus("success");
      
      toast.success("Berhasil!!", {
        description: "Kategori berhasil dihapus!",
      });

      utils.supplier.getPaginated.invalidate();
    } catch (error: any) {
      toast.error("Oops! Terjadi kesalahan", {
        description: error.message,
      });
      setDeleteStatus("error");
    } finally {
      setTimeout(() => setDeleteStatus("idle"), 2000);
    }
  };

  return (
    <div className="flex justify-center gap-3">
      <Button variant="outline" onClick={() => onEdit(supplier)}>
        <SquarePen className="size-4" />
      </Button>

      <OnDeleteLoadingDialog
        status={deleteStatus}
        handleSubmit={() => handleDeleteSupplier(supplier.id)}
      />
    </div>
  );
};
