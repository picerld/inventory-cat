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
import { CalendarIcon, Loader, Wand } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
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
import { Check } from "lucide-react";
import { cn, generateRandomCode } from "~/lib/utils";
import type { RawMaterial } from "~/types/raw-material";
import { MaterialQtyCard } from "../../create/MaterialQtyCard";
import type { FinishedGood } from "~/types/finished-good";
import { finishedGoodFormSchema } from "../../form/finished-good";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
import { MaterialQtyModal } from "../../create/MaterialQtyModal";

type FinishedGoodsActionDialogProps = {
  currentRow?: FinishedGood;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FinishedGoodsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: FinishedGoodsActionDialogProps) {
  const isEdit = !!currentRow;
  const utils = trpc.useUtils();

  const [dropdown] =
    useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown",
    );
  const [date] = useState<Date | undefined>(new Date(2025, 5, 12));

  const [openCombobox, setOpenCombobox] = useState(false);

  const [qtyModalOpen, setQtyModalOpen] = useState<{
    material: RawMaterial;
    currentQty: number;
    rawMaterialId: string;
  } | null>(null);

  const { data: user } = trpc.auth.authMe.useQuery();

  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();

  const { mutate: createFinishedGood, isPending: isPendingCreate } =
    trpc.finishedGood.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Barang Jadi berhasil ditambahkan",
        });

        utils.finishedGood.getPaginated.invalidate();
        utils.finishedGood.getStats.invalidate();

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

  const { mutate: updateFinishedGood, isPending: isPendingUpdate } =
    trpc.finishedGood.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Barang Jadi berhasil diperbarui!",
        });

        utils.finishedGood.getPaginated.invalidate();
        utils.finishedGood.getStats.invalidate();

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
      name: "",
      qty: 0,
      productionCode: "",
      batchNumber: "",
      quality: "",
      dateProduced: new Date(),
      materials: [] as { rawMaterialId: string; qty: number }[],
    },
    // @ts-expect-error type
    validators: { onSubmit: finishedGoodFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && currentRow) {
        updateFinishedGood({ id: currentRow.id, ...value });
      } else {
        createFinishedGood(value);
      }
    },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      form.setFieldValue("name", currentRow.name);
      form.setFieldValue("qty", currentRow.qty);
      form.setFieldValue("productionCode", currentRow.productionCode);
      form.setFieldValue("batchNumber", currentRow.batchNumber);
      form.setFieldValue("quality", currentRow.quality);
      form.setFieldValue("dateProduced", currentRow.dateProduced);

      form.setFieldValue(
        "materials",
        currentRow.finishedGoodDetails?.map((detail) => ({
          rawMaterialId: detail.rawMaterialId,
          qty: detail.qty,
        })) ?? [],
      );
    } else {
      form.reset();
    }
  }, [isEdit, currentRow]);

  useEffect(() => {
    if (user?.id) {
      form.setFieldValue("userId", user.id);
    }
  }, [user?.id]);

  const isLoading = isPendingCreate || isPendingUpdate;

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
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
              {isEdit ? "Edit Barang Jadi" : "Tambah Barang Jadi"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-[0.93rem]">
              {isEdit
                ? "Perbarui barang jadi di sini."
                : "Tambahkan barang jadi baru di sini."}
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
                      Nama Barang Jadi <IsRequired />
                    </FieldLabel>
                    <Input
                      placeholder="Cat Duco"
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

            <div className="grid grid-cols-2 gap-3">
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
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="quality">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Kualitas Barang <IsRequired />
                      </FieldLabel>
                      <Input
                        placeholder="Bagus"
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
            </div>

            <form.Field name="dateProduced">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Tanggal Produksi</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start",
                            !field.state.value && "text-gray-500",
                          )}
                        >
                          <CalendarIcon className="mr-3 size-4 text-gray-500" />
                          {field.state.value ? (
                            format(field.state.value, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border-2 p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => field.handleChange(date as Date)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          defaultMonth={date}
                          captionLayout={dropdown}
                          initialFocus
                          locale={id}
                          className="rounded-2xl"
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="productionCode">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Kode Produksi <IsRequired />
                    </FieldLabel>

                    <div className="grid grid-cols-7 gap-2">
                      <Input
                        placeholder="P0001"
                        className="col-span-6 h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant={"outline"}
                        size={"icon-lg"}
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("P"))
                        }
                      >
                        <Wand className="size-5" strokeWidth={2.5} />
                      </Button>
                    </div>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="batchNumber">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Nomor Batch <IsRequired />
                    </FieldLabel>

                    <div className="grid grid-cols-7 gap-2">
                      <Input
                        placeholder="B0001"
                        className="col-span-6 h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant={"outline"}
                        size={"icon-lg"}
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("B"))
                        }
                      >
                        <Wand className="size-5" strokeWidth={2.5} />
                      </Button>
                    </div>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="materials">
              {(field) => {
                const materials = field.state.value;

                const addMaterial = (rawMaterialId: string) => {
                  if (materials.find((m) => m.rawMaterialId === rawMaterialId))
                    return;
                  field.handleChange([...materials, { rawMaterialId, qty: 1 }]);
                };

                const removeMaterial = (rawMaterialId: string) => {
                  field.handleChange(
                    materials.filter((m) => m.rawMaterialId !== rawMaterialId),
                  );
                };

                const updateQty = (rawMaterialId: string, qty: number) => {
                  const material = rawMaterials?.find(
                    (rm) => rm.id === rawMaterialId,
                  );
                  if (!material) return;

                  if (qty <= 0) {
                    toast.error("Jumlah tidak boleh 0!", {
                      description: "Minimal jumlah bahan baku adalah 1.",
                    });
                    return;
                  }

                  if (qty > material.qty) {
                    toast.error("Stok tidak mencukupi!", {
                      description: `Stok tersedia hanya ${material.qty} unit.`,
                    });
                    return;
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

                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
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
                                ?.filter((m) => m.qty > 0)
                                .map((material) => {
                                  const isSelected = materials.some(
                                    (m) => m.rawMaterialId === material.id,
                                  );

                                  return (
                                    <CommandItem
                                      key={material.id}
                                      onSelect={() => addMaterial(material.id)}
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
                                      {material.paintGrade.name}) (
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
                            material={material as RawMaterial}
                            m={m}
                            materials={materials}
                            // @ts-expect-error type
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
              <Button variant="outline">Close</Button>
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

        {qtyModalOpen && (
          <MaterialQtyModal
            material={qtyModalOpen.material}
            currentQty={qtyModalOpen.currentQty}
            onConfirm={(qty) => {
              // @ts-expect-error type
              updateQty(qtyModalOpen.rawMaterialId, qty);
              setQtyModalOpen(null);
            }}
            onClose={() => setQtyModalOpen(null)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
