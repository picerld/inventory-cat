"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { Loader, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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
import { semiFinishedGoodFormSchema } from "~/components/features/semi-finished/form/semi-finished";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type SemiFinishedGoodsActionDialogProps = {
  open: boolean;
  currentRow?: SemiFinishedGood;
  onOpenChange: (open: boolean) => void;
};

export function SemiFinishedGoodsActionDialog({
  open,
  currentRow,
  onOpenChange,
}: SemiFinishedGoodsActionDialogProps) {
  const isEdit = !!currentRow;
  const utils = trpc.useUtils();

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingOpenState, setPendingOpenState] = useState<boolean | null>(
    null,
  );
  const [openCombobox, setOpenCombobox] = useState(false);

  const { data: user } = trpc.auth.authMe.useQuery();

  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();
  const { data: grades } = trpc.paintGrade.getAll.useQuery();

  const { mutate: createSemiFinishedGood, isPending: isPendingCreate } =
    trpc.semiFinishedGood.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Barang Setengah Jadi berhasil ditambahkan",
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

  const { mutate: updateSemiFinishedGood, isPending: isPendingUpdate } =
    trpc.semiFinishedGood.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Barang Setengah Jadi berhasil diperbarui!",
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
      paintGradeId: "",
      name: "",
      qty: 0,
      materials: [] as { rawMaterialId: string; qty: number | string }[],
    },
    validators: { onSubmit: semiFinishedGoodFormSchema },
    onSubmit: ({ value }) => {
      const payload = {
        ...value,
        materials: value.materials.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qty: typeof m.qty === "string" ? parseFloat(m.qty) || 0 : m.qty,
        })),
      };

      if (isEdit && currentRow) {
        updateSemiFinishedGood({ id: currentRow.id, ...payload });
      } else {
        createSemiFinishedGood(payload);
      }
    },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      const materials =
        currentRow.SemiFinishedGoodDetail?.map((detail) => ({
          rawMaterialId: detail.rawMaterialId,
          qty: Number(detail.qty),
        })) ?? [];

      form.setFieldValue("name", currentRow.name);
      form.setFieldValue("paintGradeId", currentRow.paintGradeId);
      form.setFieldValue("materials", materials);
      form.setFieldValue("qty", materials.length);
    } else {
      form.reset();
    }
  }, [isEdit, currentRow]);

  useEffect(() => {
    if (user?.id) {
      form.setFieldValue("userId", user.id);
    }
  }, [user?.id]);

  const syncQtyFromMaterials = (
    materials: { rawMaterialId: string; qty: number | string }[],
  ) => {
    form.setFieldValue("qty", materials.length);
  };

  const isLoading = isPendingCreate || isPendingUpdate;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && form.state.isDirty) {
            setPendingOpenState(nextOpen);
            setConfirmDiscardOpen(true);
            return;
          }

          form.reset();
          onOpenChange(nextOpen);
        }}
      >
        <SheetContent
          side="right"
          className="overflow-y-auto px-3 backdrop-blur-xl sm:max-w-md"
        >
          <form
            className="flex h-full flex-col gap-6 py-1 pe-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await form.handleSubmit();
            }}
          >
            <SheetHeader className="px-0">
              <SheetTitle className="text-2xl font-bold">
                {isEdit
                  ? "Edit Barang Setengah Jadi"
                  : "Tambah Barang Setengah Jadi"}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-[0.93rem]">
                {isEdit
                  ? "Perbarui barang setengah jadi di sini."
                  : "Tambahkan barang setengah jadi baru di sini."}
              </SheetDescription>
            </SheetHeader>

            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Nama Barang Setengah Jadi <IsRequired />
                      </FieldLabel>
                      <Input
                        placeholder="Warna Red Green Blue"
                        className="h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="paintGradeId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Pilih Kualitas (Grade) <IsRequired />
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades?.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="qty">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Kuantiti <IsRequired />
                      </FieldLabel>
                      <Input
                        readOnly
                        placeholder="0"
                        className="h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.handleChange(Number(value));
                        }}
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}

                      <p className="text-muted-foreground text-sm">
                        Kuantiti otomatis dihitung dari jumlah bahan baku.
                      </p>
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="materials">
                {(field) => {
                  const materials = field.state.value;

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
                    syncQtyFromMaterials(newMaterials);
                  };

                  const removeMaterial = (rawMaterialId: string) => {
                    const newMaterials = materials.filter(
                      (m) => m.rawMaterialId !== rawMaterialId,
                    );

                    field.handleChange(newMaterials);
                    syncQtyFromMaterials(newMaterials);
                  };

                  const updateQty = (
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
                        Pilih Bahan Baku <IsRequired />
                      </FieldLabel>

                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            disabled={isEdit}
                            variant="outline"
                            className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                          >
                            {materials.length > 0 ? (
                              <span>{materials.length} bahan baku dipilih</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Pilih bahan baku...
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
                                        {material.supplier.name})
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
                              isEdit={isEdit}
                              material={material}
                              m={m}
                              materials={materials}
                              updateQty={updateQty}
                              removeMaterial={removeMaterial}
                            />
                          );
                        })}
                      </div>

                      {field.state.meta.isTouched &&
                        !field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <SheetFooter>
              <SheetClose asChild>
                <Button
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
                  Close
                </Button>
              </SheetClose>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="font-medium"
                >
                  {isLoading ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : isEdit ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan Data"
                  )}
                </Button>
              </Field>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

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
                  setPendingOpenState(null);
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
