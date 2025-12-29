"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { Loader, Check, Package } from "lucide-react";
import { useEffect, useState } from "react";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { MaterialQtyCard } from "../create/MaterialQtyCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type SemiFinishedGoodUpdateQtyProps = {
  currentRow: SemiFinishedGood | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SemiFinishedGoodUpdateQty({
  currentRow,
  open,
  onOpenChange,
}: SemiFinishedGoodUpdateQtyProps) {
  const utils = trpc.useUtils();
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState<boolean>(false);
  const [openCombobox, setOpenCombobox] = useState<boolean>(false);

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();

  const { mutate: updateQty, isPending } =
    trpc.semiFinishedGood.updateQty.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Kuantiti berhasil diperbarui!",
        });

        utils.semiFinishedGood.getPaginated.invalidate();
        utils.semiFinishedGood.getStats.invalidate();

        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : "Coba periksa kembali form anda!",
        });
      },
    });

  const form = useForm({
    defaultValues: {
      userId: user?.id ?? "",
      materials: [] as { rawMaterialId: string; qty: number | string }[],
    },
    onSubmit: ({ value }) => {
      if (!currentRow) return;

      const payload = {
        id: currentRow.id,
        userId: value.userId,
        materials: value.materials.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qty: typeof m.qty === "string" ? parseFloat(m.qty) || 0 : m.qty,
        })),
      };

      updateQty(payload);
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.setFieldValue("materials", []);
    }
  }, [currentRow, open]);

  useEffect(() => {
    if (user?.id) {
      form.setFieldValue("userId", user.id);
    }
  }, [user?.id]);

  if (!currentRow) return null;

  const currentDetails = currentRow.SemiFinishedGoodDetail ?? [];

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && form.state.isDirty) {
            setConfirmDiscardOpen(true);
            return;
          }
          form.reset();
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <form
            className="flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Update Kuantiti {currentRow.name}
              </DialogTitle>
              <DialogDescription className="flex gap-2 text-base">
                Kuantiti dihitung dari bahan baku yang dipilih{" "}
                <span className="text-red-500">*</span>
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/30 space-y-4 rounded-lg border-2 p-4">
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-5 w-5" />
                <h3 className="text-lg font-semibold">Bahan Baku Saat Ini</h3>
              </div>

              {currentDetails.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Tidak ada bahan baku terdaftar.
                </p>
              ) : (
                <div className="space-y-2">
                  {currentDetails.map((detail) => {
                    const material = rawMaterials?.find(
                      (rm) => rm.id === detail.rawMaterialId,
                    );

                    return (
                      <div
                        key={detail.rawMaterialId}
                        className="bg-background flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{material?.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {material?.supplier.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {typeof detail.qty === "number"
                              ? detail.qty.toFixed(2)
                              : detail.qty}{" "}
                            unit
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm font-medium">
                  Total Kuantiti Saat Ini:{" "}
                  <span className="text-lg font-bold">
                    {typeof currentRow.qty === "number"
                      ? currentRow.qty.toFixed(2)
                      : currentRow.qty}{" "}
                    unit
                  </span>
                </p>
              </div>
            </div>

            <FieldGroup>
              <form.Field name="materials">
                {(field) => {
                  const materials = field.state.value;
                  const additionalQty = materials.reduce((sum, m) => {
                    const qty =
                      typeof m.qty === "string"
                        ? parseFloat(m.qty) || 0
                        : m.qty;
                    return sum + qty;
                  }, 0);

                  const addMaterial = (rawMaterialId: string) => {
                    if (
                      materials.find((m) => m.rawMaterialId === rawMaterialId)
                    )
                      return;

                    const newMaterials = [
                      ...materials,
                      { rawMaterialId, qty: 0.1 },
                    ];

                    field.handleChange(newMaterials);
                  };

                  const removeMaterial = (rawMaterialId: string) => {
                    const newMaterials = materials.filter(
                      (m) => m.rawMaterialId !== rawMaterialId,
                    );

                    field.handleChange(newMaterials);
                  };

                  const updateMaterialQty = (
                    rawMaterialId: string,
                    qty: number | string,
                  ) => {
                    const material = rawMaterials?.find(
                      (rm) => rm.id === rawMaterialId,
                    );
                    if (!material) return;

                    if (typeof qty === "number") {
                      if (qty <= 0) {
                        toast.error("Jumlah tidak boleh 0!", {
                          description: "Minimal jumlah bahan baku adalah 0.1.",
                        });
                        return;
                      }

                      if (qty > Number(material.qty)) {
                        toast.error("Stok tidak mencukupi!", {
                          description: `Stok tersedia hanya ${material.qty} unit.`,
                        });
                        return;
                      }
                    }

                    const newMaterials = materials.map((m) =>
                      m.rawMaterialId === rawMaterialId ? { ...m, qty } : m,
                    );

                    field.handleChange(newMaterials);
                  };

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Pilih Bahan Baku Tambahan <IsRequired />
                      </FieldLabel>

                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                          >
                            {materials.length > 0 ? (
                              <span>{materials.length} bahan baku dipilih</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Pilih bahan baku untuk ditambahkan...
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Cari bahan baku..." />
                            <CommandList>
                              <CommandEmpty>Tidak ada bahan baku.</CommandEmpty>
                              <CommandGroup>
                                {rawMaterials
                                  ?.filter((m) => Number(m.qty) > 0)
                                  .map((material) => {
                                    const isSelected = materials.some(
                                      (m) => m.rawMaterialId === material.id,
                                    );

                                    return (
                                      <CommandItem
                                        key={material.id}
                                        onSelect={() =>
                                          addMaterial(material.id)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {material.name} (
                                        {material.supplier.name}) - Stok:{" "}
                                        {Number(material.qty).toFixed(2)}
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <div className="mt-3 space-y-2">
                        {materials.map((m) => {
                          const material = rawMaterials?.find(
                            (rm) => rm.id === m.rawMaterialId,
                          );

                          return (
                            <MaterialQtyCard
                              key={m.rawMaterialId}
                              isEdit={false}
                              material={material}
                              m={m}
                              materials={materials}
                              updateQty={updateMaterialQty}
                              removeMaterial={removeMaterial}
                            />
                          );
                        })}
                      </div>

                      {materials.length > 0 && (
                        <div className="bg-primary/10 text-primary border-primary/20 mt-4 rounded-lg border-2 p-3">
                          <p className="text-sm font-medium">
                            Total Tambahan Kuantiti:{" "}
                            <span className="text-lg font-bold">
                              +{additionalQty.toFixed(2)} unit
                            </span>
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Kuantiti baru akan menjadi:{" "}
                            <span className="font-semibold">
                              {(Number(currentRow.qty) + additionalQty).toFixed(
                                2,
                              )}{" "}
                              unit
                            </span>
                          </p>
                        </div>
                      )}

                      {field.state.meta.isTouched &&
                        !field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (form.state.isDirty) {
                    setConfirmDiscardOpen(true);
                    return;
                  }
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="font-medium"
              >
                {isPending ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Kuantiti"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang sudah diisi akan hilang dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  setConfirmDiscardOpen(false);
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Ya, Buang
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
