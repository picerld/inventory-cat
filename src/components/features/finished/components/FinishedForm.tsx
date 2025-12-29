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
import {
  CalendarIcon,
  Loader,
  Wand,
  Check,
  Package,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn, generateRandomCode } from "~/lib/utils";
import type { RawMaterial } from "~/types/raw-material";
import type { FinishedGood } from "~/types/finished-good";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
import { finishedGoodFormSchema } from "../form/finished-good";
import { MaterialQtyCard } from "../create/MaterialQtyCard";
import { MaterialQtyModal } from "../create/MaterialQtyModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SemiFinishedQtyCard } from "../create/SemiFinishedQtyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import { SemiFinishedQtyModal } from "../create/SemiFinishedQtyModal";

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

  const [openCombobox, setOpenCombobox] = useState<boolean>(false);
  const [rawMaterialQtyModalOpen, setRawMaterialQtyModalOpen] = useState<{
    material: RawMaterial;
    currentQty: number;
    rawMaterialId: string;
  } | null>(null);

  const [semiFinishedQtyModalOpen, setSemiFinishedQtyModalOpen] = useState<{
    semiFinished: SemiFinishedGood;
    currentQty: number;
    semiFinishedGoodId: string;
  } | null>(null);

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();
  const { data: semiFinishedGoods } = trpc.semiFinishedGood.getAll.useQuery();
  const { data: grades } = trpc.paintGrade.getAll.useQuery();

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
      productionCode: "",
      batchNumber: "",
      dateProduced: new Date(),
      sourceType: "raw_material" as "raw_material" | "semi_finished",
      materials: [] as { rawMaterialId: string; qty: number | string }[],
      semiFinishedGoods: [] as {
        semiFinishedGoodId: string;
        qty: number | string;
      }[],
    },

    // @ts-expect-error type
    validators: { onSubmit: finishedGoodFormSchema },

    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        materials: value.materials.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qty: typeof m.qty === "string" ? parseFloat(m.qty) || 0 : m.qty,
        })),
        semiFinishedGoods: value.semiFinishedGoods.map((sf) => ({
          semiFinishedGoodId: sf.semiFinishedGoodId,
          qty: typeof sf.qty === "string" ? parseFloat(sf.qty) || 0 : sf.qty,
        })),
      };

      if (mode === "create") {
        createFinishedGood(payload);
      } else {
        updateFinishedGood({ id: initialData!.id, ...payload });
      }
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldValue("productionCode", initialData.productionCode);
      form.setFieldValue("batchNumber", initialData.batchNumber);
      form.setFieldValue("name", initialData.name);
      form.setFieldValue("qty", Number(initialData.qty));
      form.setFieldValue("paintGradeId", initialData.paintGradeId);
      form.setFieldValue("dateProduced", new Date(initialData.dateProduced));
      form.setFieldValue(
        "materials",
        initialData.finishedGoodDetails?.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qty: Number(m.qty),
        })) || [],
      );
    } else {
      form.reset();
    }
  }, [mode, initialData]);

  useEffect(() => {
    if (user?.id) {
      form.setFieldValue("userId", user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const sourceType = form.getFieldValue("sourceType");

    if (sourceType === "raw_material") {
      const materials = form.getFieldValue("materials");
      form.setFieldValue("qty", materials.length);
    }

    if (sourceType === "semi_finished") {
      const semiFinished = form.getFieldValue("semiFinishedGoods");
      form.setFieldValue("qty", semiFinished.length);
    }
  }, [
    form.getFieldValue("materials"),
    form.getFieldValue("semiFinishedGoods"),
    form.getFieldValue("sourceType"),
  ]);

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
          <div className="grid grid-cols-2 gap-3">
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

            <form.Field name="qty">
              {(field) => {
                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Kuantiti (Auto) <IsRequired />
                    </FieldLabel>
                    <Input
                      placeholder="0"
                      className="bg-muted h-12 rounded-xl border-2"
                      value={field.state.value}
                      disabled
                      readOnly
                    />
                    <p className="text-muted-foreground mt-1 hidden text-xs sm:block">
                      Otomatis dihitung dari jumlah bahan yang dipilih
                    </p>
                  </Field>
                );
              }}
            </form.Field>
          </div>

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

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

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
                        onSelect={(date) => field.handleChange(date!)}
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                        disabled={mode === "edit"}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("P"))
                        }
                        disabled={mode === "edit"}
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
                        disabled={mode === "edit"}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("B"))
                        }
                        disabled={mode === "edit"}
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

          <form.Field name="sourceType">
            {(sourceTypeField) => {
              return (
                <div>
                  <FieldLabel className="mb-3 text-base">
                    Sumber Bahan <IsRequired />
                  </FieldLabel>
                  <Tabs
                    value={sourceTypeField.state.value}
                    onValueChange={(value) => {
                      if (mode === "edit") return; // Prevent changes in edit mode

                      sourceTypeField.handleChange(
                        value as "raw_material" | "semi_finished",
                      );

                      form.setFieldValue("materials", []);
                      form.setFieldValue("semiFinishedGoods", []);
                      form.setFieldValue("qty", 0);
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="raw_material"
                        className="cursor-pointer gap-2"
                        disabled={mode === "edit"}
                      >
                        <Package className="h-4 w-4" />
                        Bahan Baku
                      </TabsTrigger>
                      <TabsTrigger
                        value="semi_finished"
                        className="cursor-pointer gap-2"
                        disabled={mode === "edit"}
                      >
                        <Layers className="h-4 w-4" />
                        Barang Setengah Jadi
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="raw_material" className="mt-4">
                      <form.Field name="materials">
                        {(field) => {
                          const materials = field.state.value;

                          const addMaterial = (rawMaterialId: string) => {
                            if (mode === "edit") return; // Prevent adding in edit mode

                            const material = rawMaterials?.find(
                              (rm) => rm.id === rawMaterialId,
                            );
                            if (!material) return;

                            if (
                              materials.find(
                                (m) => m.rawMaterialId === rawMaterialId,
                              )
                            ) {
                              toast.info("Bahan sudah dipilih!");
                              return;
                            }

                            field.handleChange([
                              ...materials,
                              { rawMaterialId, qty: 0.1 },
                            ]);
                          };

                          const removeMaterial = (rawMaterialId: string) => {
                            if (mode === "edit") return; // Prevent removing in edit mode

                            field.handleChange(
                              materials.filter(
                                (m) => m.rawMaterialId !== rawMaterialId,
                              ),
                            );
                          };

                          return (
                            <Field>
                              <FieldLabel className="text-base">
                                Pilih Bahan Baku <IsRequired />
                              </FieldLabel>

                              {mode === "edit" ? (
                                <div className="bg-muted rounded-xl border-2 p-3">
                                  <p className="text-muted-foreground text-sm">
                                    {materials.length} bahan baku dipilih (tidak
                                    dapat diubah saat edit)
                                  </p>
                                </div>
                              ) : (
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
                                        <span>
                                          {materials.length} bahan baku dipilih
                                        </span>
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
                                        <CommandEmpty>
                                          Tidak ada bahan baku.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {rawMaterials
                                            ?.filter((m) => Number(m.qty) > 0)
                                            .map((material) => {
                                              const isSelected = materials.some(
                                                (m) =>
                                                  m.rawMaterialId ===
                                                  material.id,
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
                                                  {material.supplier.name}) -
                                                  Stok:{" "}
                                                  {Number(material.qty).toFixed(
                                                    2,
                                                  )}
                                                </CommandItem>
                                              );
                                            })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}

                              <div className="mt-3 space-y-2">
                                {materials.map((m) => {
                                  const material = rawMaterials?.find(
                                    (rm) => rm.id === m.rawMaterialId,
                                  );

                                  return (
                                    <MaterialQtyCard
                                      key={m.rawMaterialId}
                                      material={material}
                                      m={m}
                                      materials={materials}
                                      onOpenModal={() => {
                                        if (mode === "edit") return; // Prevent modal in edit mode

                                        const currentQty =
                                          typeof m.qty === "string"
                                            ? parseFloat(m.qty) || 0.1
                                            : m.qty;
                                        setRawMaterialQtyModalOpen({
                                          material: material,
                                          currentQty,
                                          rawMaterialId: m.rawMaterialId,
                                        });
                                      }}
                                      removeMaterial={removeMaterial}
                                      isReadOnly={mode === "edit"}
                                    />
                                  );
                                })}
                              </div>

                              {field.state.meta.isTouched &&
                                !field.state.meta.isValid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </TabsContent>

                    <TabsContent value="semi_finished" className="mt-4">
                      <form.Field name="semiFinishedGoods">
                        {(field) => {
                          const semiFinished = field.state.value;

                          const addSemiFinished = (
                            semiFinishedGoodId: string,
                          ) => {
                            if (mode === "edit") return; // Prevent adding in edit mode

                            const sfg = semiFinishedGoods?.find(
                              (sf) => sf.id === semiFinishedGoodId,
                            );
                            if (!sfg) return;

                            if (
                              semiFinished.find(
                                (sf) =>
                                  sf.semiFinishedGoodId === semiFinishedGoodId,
                              )
                            ) {
                              toast.info("Barang sudah dipilih!");
                              return;
                            }

                            field.handleChange([
                              ...semiFinished,
                              { semiFinishedGoodId, qty: Number(sfg.qty) },
                            ]);
                          };

                          const removeSemiFinished = (
                            semiFinishedGoodId: string,
                          ) => {
                            if (mode === "edit") return; // Prevent removing in edit mode

                            field.handleChange(
                              semiFinished.filter(
                                (sf) =>
                                  sf.semiFinishedGoodId !== semiFinishedGoodId,
                              ),
                            );
                          };

                          return (
                            <Field>
                              <FieldLabel className="text-base">
                                Pilih Barang Setengah Jadi <IsRequired />
                              </FieldLabel>

                              {mode === "edit" ? (
                                <div className="bg-muted rounded-xl border-2 p-3">
                                  <p className="text-muted-foreground text-sm">
                                    {semiFinished.length} barang setengah jadi
                                    dipilih (tidak dapat diubah saat edit)
                                  </p>
                                </div>
                              ) : (
                                <Popover
                                  open={openCombobox}
                                  onOpenChange={setOpenCombobox}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                                    >
                                      {semiFinished.length > 0 ? (
                                        <span>
                                          {semiFinished.length} barang setengah
                                          jadi dipilih
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">
                                          Pilih barang setengah jadi...
                                        </span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>

                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Cari barang setengah jadi..." />
                                      <CommandList>
                                        <CommandEmpty>
                                          Tidak ada barang setengah jadi.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {semiFinishedGoods
                                            ?.filter((sf) => Number(sf.qty) > 0)
                                            .map((sfg) => {
                                              const isSelected =
                                                semiFinished.some(
                                                  (sf) =>
                                                    sf.semiFinishedGoodId ===
                                                    sfg.id,
                                                );

                                              return (
                                                <CommandItem
                                                  key={sfg.id}
                                                  onSelect={() =>
                                                    addSemiFinished(sfg.id)
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
                                                  {sfg.name} (
                                                  {sfg.paintGrade?.name}) -
                                                  Stok: {Number(sfg.qty)}
                                                </CommandItem>
                                              );
                                            })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}

                              <div className="mt-3 space-y-2">
                                {semiFinished.map((sf) => {
                                  const sfg = semiFinishedGoods?.find(
                                    (s) => s.id === sf.semiFinishedGoodId,
                                  );

                                  return (
                                    <SemiFinishedQtyCard
                                      key={sf.semiFinishedGoodId}
                                      semiFinished={sfg}
                                      sfm={sf}
                                      onRemove={removeSemiFinished}
                                      onOpenModal={() => {
                                        if (mode === "edit") return; // Prevent modal in edit mode

                                        const currentQty =
                                          typeof sf.qty === "string"
                                            ? parseFloat(sf.qty) || 1
                                            : sf.qty;

                                        setSemiFinishedQtyModalOpen({
                                          semiFinished: sfg,
                                          currentQty,
                                          semiFinishedGoodId:
                                            sf.semiFinishedGoodId,
                                        });
                                      }}
                                      isReadOnly={mode === "edit"}
                                    />
                                  );
                                })}
                              </div>

                              {field.state.meta.isTouched &&
                                !field.state.meta.isValid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </TabsContent>
                  </Tabs>

                  {sourceTypeField.state.meta.isTouched &&
                    !sourceTypeField.state.meta.isValid && (
                      <FieldError errors={sourceTypeField.state.meta.errors} />
                    )}
                </div>
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

      {rawMaterialQtyModalOpen && (
        <MaterialQtyModal
          material={rawMaterialQtyModalOpen.material}
          currentQty={rawMaterialQtyModalOpen.currentQty}
          onConfirm={(qty: number) => {
            const materials = form.getFieldValue("materials");

            const newMaterials = materials.map((m) =>
              m.rawMaterialId === rawMaterialQtyModalOpen.rawMaterialId
                ? { ...m, qty }
                : m,
            );

            form.setFieldValue("materials", newMaterials);
            setRawMaterialQtyModalOpen(null);
          }}
          onClose={() => setRawMaterialQtyModalOpen(null)}
        />
      )}

      {semiFinishedQtyModalOpen && (
        <SemiFinishedQtyModal
          semiFinished={semiFinishedQtyModalOpen.semiFinished}
          currentQty={semiFinishedQtyModalOpen.currentQty}
          onConfirm={(qty: number) => {
            const semiFinishedGoods = form.getFieldValue("semiFinishedGoods");

            const newSemiFinishedGoods = semiFinishedGoods.map((sf) =>
              sf.semiFinishedGoodId ===
              semiFinishedQtyModalOpen.semiFinishedGoodId
                ? { ...sf, qty }
                : sf,
            );

            form.setFieldValue("semiFinishedGoods", newSemiFinishedGoods);
            setSemiFinishedQtyModalOpen(null);
          }}
          onClose={() => setSemiFinishedQtyModalOpen(null)}
        />
      )}
    </div>
  );
}
