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
import type { FinishedGood } from "~/types/finished-good";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
import { finishedGoodFormSchema } from "../form/finished-good";
import { MaterialQtyCard } from "../create/MaterialQtyCard";
import { MaterialQtyModal } from "../create/MaterialQtyModal";

type FinishedFormProps = {
  mode: "create" | "edit";
  initialData?: FinishedGood | null;
};

export function FinishedGoodForm({ mode, initialData }: FinishedFormProps) {
  const utils = trpc.useUtils();

  const [dropdown] =
    useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown",
    );
  const [date] = useState<Date | undefined>(new Date(2025, 5, 12));

  const [openCombobox, setOpenCombobox] = useState(false);

  // Changed from qtyNotification to qtyModalOpen
  const [qtyModalOpen, setQtyModalOpen] = useState<{
    material: RawMaterial;
    currentQty: number;
    rawMaterialId: string;
  } | null>(null);

  const { data: user } = trpc.auth.authMe.useQuery({
    token: Cookies.get("auth.token") as string,
  });

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

    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createFinishedGood(value);
      } else {
        updateFinishedGood({ id: initialData!.id, ...value });
      }
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldValue("productionCode", initialData.productionCode);
      form.setFieldValue("batchNumber", initialData.batchNumber);
      form.setFieldValue("name", initialData.name);
      form.setFieldValue("qty", initialData.qty);
      form.setFieldValue("quality", initialData.quality);
      form.setFieldValue("dateProduced", new Date(initialData.dateProduced));
      form.setFieldValue(
        "materials",
        initialData.finishedGoodDetails.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qty: m.qty,
        })),
      );
    } else {
      form.reset();
    }
  }, [mode, initialData]);

  // Removed the auto-dismiss useEffect for qtyNotification

  useEffect(() => {
    if (user?.id) {
      form.setFieldValue("userId", user.id);
    }
  }, [user?.id]);

  const isLoading = isPendingCreate || isPendingUpdate;

  return (
    <div className="pt-10">
      <form
        className="flex h-full flex-col gap-6 py-1 pe-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
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

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-5">
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
                        variant="outline"
                        size="icon-lg"
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
                        variant="outline"
                        size="icon-lg"
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
          </div>

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

              // Updated updateQty function - simplified without notification
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

                    <PopoverContent className="w-full p-0">
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
                                    {material.name} ({material.paintGrade.name})
                                    ({material.supplier.name})
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
                          onOpenModal={() => {
                            setQtyModalOpen({
                              material: material as RawMaterial,
                              currentQty: m.qty,
                              rawMaterialId: m.rawMaterialId,
                            });
                          }}
                          removeMaterial={removeMaterial}
                        />
                      );
                    })}
                  </div>

                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <Button type="submit" disabled={isLoading} className="font-medium">
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : mode === "create" ? (
            "Simpan Barang Jadi"
          ) : (
            "Update Barang Jadi"
          )}
        </Button>
      </form>

      {qtyModalOpen && (
        <MaterialQtyModal
          material={qtyModalOpen.material}
          currentQty={qtyModalOpen.currentQty}
          onConfirm={(qty: number) => {
            const materials = form.getFieldValue("materials");
            const material = rawMaterials?.find(
              (rm) => rm.id === qtyModalOpen.rawMaterialId,
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
              m.rawMaterialId === qtyModalOpen.rawMaterialId
                ? { ...m, qty }
                : m,
            );

            form.setFieldValue("materials", newMaterials);
            setQtyModalOpen(null);
          }}
          onClose={() => setQtyModalOpen(null)}
        />
      )}
    </div>
  );
}
