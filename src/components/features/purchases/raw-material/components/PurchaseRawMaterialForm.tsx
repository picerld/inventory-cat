"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { cn, generateRandomCode, toNumber, toRupiah } from "~/lib/utils";
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
import { Check, Loader, Wand, Trash2, TriangleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { purchaseRawMaterialFormSchema } from "../form/purchase-raw-material";
import type { PurchaseRawMaterialFull } from "~/types/purchase";
import type { PurchaseStatus } from "../../config/purchase";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";
import { PurchaseRawMaterialFormAction } from "./PurchaseRawMaterialFormAction";

type PurchaseRawMaterialFormProps = {
  mode: "create" | "edit";
  initialData?: PurchaseRawMaterialFull | null;
};

type Line = {
  rawMaterialId: string;
  qty: number | string;
  unitPrice: number | string;
};

type ActionKey =
  | "submit"
  | "set-ongoing"
  | "set-finished"
  | "set-canceled"
  | null;

export function PurchaseRawMaterialForm({
  mode,
  initialData,
}: PurchaseRawMaterialFormProps) {
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: suppliers } = trpc.supplier.getAll.useQuery();
  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();

  const [openMaterialPicker, setOpenMaterialPicker] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionKey>(null);

  const form = useForm({
    defaultValues: {
      id: initialData?.id,
      userId: user?.id ?? "",
      purchaseNo: "",
      supplierId: "",
      receivedNote: "",
      notes: "",
      items: [] as Line[],
    },

    // @ts-expect-error tanstack form
    validators: { onSubmit: purchaseRawMaterialFormSchema },

    onSubmit: async ({ value }) => {
      setActiveAction("submit");

      const itemsPayload = (value.items ?? []).map((l) => ({
        rawMaterialId: l.rawMaterialId,
        qty: toNumber(l.qty),
        unitPrice: toNumber(l.unitPrice),
      }));

      const payload = {
        id: mode === "edit" ? initialData?.id : undefined,
        userId: value.userId,
        purchaseNo: value.purchaseNo,
        supplierId: value.supplierId,
        receivedNote: value.receivedNote || null,
        notes: value.notes || null,
        items: itemsPayload,
      };

      if (mode === "create") {
        createPurchase(payload);
      } else {
        updatePurchase(payload);
      }
    },
  });

  const { mutate: createPurchase, isPending: isPendingCreate } =
    trpc.purchase.create.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Pembelian bahan baku berhasil dibuat",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getRawMaterialPaginated?.invalidate?.();

        form.reset();

        setActiveAction(null);
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : (error.message ?? "Coba periksa kembali form anda!"),
        });
        setActiveAction(null);
      },
    });

  const { mutate: updatePurchase, isPending: isPendingUpdate } =
    trpc.purchase.update.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Pembelian bahan baku berhasil diperbarui!",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getRawMaterialPaginated?.invalidate?.();

        setActiveAction(null);
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : error.message || "Coba periksa kembali form anda!",
        });
        setActiveAction(null);
      },
    });

  const { mutate: updateStatus, isPending: isPendingUpdateStatus } =
    trpc.purchase.updateStatus.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!", {
          description: "Status purchase berhasil diubah.",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getRawMaterialPaginated?.invalidate?.();
        await utils.rawMaterial.getAll.invalidate();
        await utils.purchase.getById.invalidate({ id: initialData?.id });

        setActiveAction(null);
      },
      onError: (error) => {
        toast.error("Gagal ubah status", {
          description: error.message || "Tidak bisa mengubah status purchase.",
        });
        setActiveAction(null);
      },
    });

  useEffect(() => {
    if (user?.id) form.setFieldValue("userId", user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldValue("id", initialData.id);
      form.setFieldValue("purchaseNo", initialData.purchaseNo);
      form.setFieldValue("supplierId", initialData.supplierId);
      form.setFieldValue("receivedNote", initialData.receivedNote ?? "");
      form.setFieldValue("notes", initialData.notes ?? "");
      form.setFieldValue(
        "items",
        (initialData.items ?? []).map((it) => ({
          rawMaterialId: it.rawMaterialId,
          qty: typeof it.qty === "string" ? toNumber(it.qty) : it.qty,
          unitPrice: it.unitPrice,
        })),
      );
    } else if (mode === "create") {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id, initialData?.supplierId, suppliers?.length]);

  const currentStatus: PurchaseStatus | undefined = initialData?.status;

  const isReadOnlyByStatus =
    mode === "edit" &&
    (currentStatus === "FINISHED" || currentStatus === "CANCELED");

  const isSubmitting =
    activeAction === "submit" && (isPendingCreate || isPendingUpdate);
  const isSetOngoing = activeAction === "set-ongoing" && isPendingUpdateStatus;
  const isSetFinished =
    activeAction === "set-finished" && isPendingUpdateStatus;
  const isSetCanceled =
    activeAction === "set-canceled" && isPendingUpdateStatus;

  const lockUI =
    (isPendingCreate || isPendingUpdate || isPendingUpdateStatus) &&
    activeAction !== null;

  const disableFormInputs = lockUI || isReadOnlyByStatus;
  const disableSubmit = lockUI || (mode === "edit" && isReadOnlyByStatus);

  const canSetOngoing = mode === "edit" && currentStatus === "DRAFT";
  const canSetFinished =
    mode === "edit" &&
    (currentStatus === "DRAFT" || currentStatus === "ONGOING");
  const canCancel =
    mode === "edit" &&
    (currentStatus === "DRAFT" || currentStatus === "ONGOING");

  return (
    <div className="py-6">
      <form
        className="flex h-full flex-col gap-6 py-1 pe-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="purchaseNo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-base">
                      Nomor Pembelian <IsRequired />
                    </FieldLabel>

                    <div className="grid grid-cols-7 gap-2">
                      <Input
                        placeholder="PB0001"
                        className="col-span-6 h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={mode === "edit" || disableFormInputs}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("PB"))
                        }
                        disabled={mode === "edit" || disableFormInputs}
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

            <form.Field name="supplierId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-base">
                      Supplier <IsRequired />
                    </FieldLabel>

                    <Select
                      value={String(field.state.value ?? "")}
                      onValueChange={field.handleChange}
                      disabled={disableFormInputs}
                    >
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue placeholder="Pilih supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
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
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="receivedNote">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">
                    No. Surat Jalan (opsional)
                  </FieldLabel>
                  <Input
                    placeholder="SJ-001"
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disableFormInputs}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="notes">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">
                    Catatan (opsional)
                  </FieldLabel>
                  <Input
                    placeholder="Catatan pembelian..."
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disableFormInputs}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          <form.Field name="items">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const items = field.state.value ?? [];

              const total = items.reduce(
                (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
                0,
              );

              const addMaterial = (rawMaterialId: string) => {
                if (disableFormInputs) return;

                if (items.some((x) => x.rawMaterialId === rawMaterialId)) {
                  toast.info("Bahan baku sudah dipilih!");
                  return;
                }
                const rm = rawMaterials?.find(
                  (r: any) => r.id === rawMaterialId,
                );

                field.handleChange([
                  ...items,
                  {
                    rawMaterialId,
                    qty: 1,
                    unitPrice: rm?.supplierPrice ?? 0,
                  },
                ]);

                setOpenMaterialPicker(false);
              };

              const removeMaterial = (rawMaterialId: string) => {
                if (disableFormInputs) return;
                field.handleChange(
                  items.filter((x) => x.rawMaterialId !== rawMaterialId),
                );
              };

              const updateLine = (idx: number, patch: Partial<Line>) => {
                if (disableFormInputs) return;
                const next = items.map((it, i) =>
                  i === idx ? { ...it, ...patch } : it,
                );
                field.handleChange(next);
              };

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-base">
                    Pilih Bahan Baku <IsRequired />
                  </FieldLabel>

                  <Popover
                    open={openMaterialPicker}
                    onOpenChange={setOpenMaterialPicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                        disabled={disableFormInputs}
                      >
                        {items.length > 0 ? (
                          <span>{items.length} bahan baku dipilih</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Pilih bahan baku...
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari bahan baku..." />
                        <CommandList>
                          <CommandEmpty>Tidak ada bahan baku.</CommandEmpty>
                          <CommandGroup>
                            {rawMaterials?.map((rm: any) => {
                              const selected = items.some(
                                (i) => i.rawMaterialId === rm.id,
                              );
                              return (
                                <CommandItem
                                  key={rm.id}
                                  onSelect={() => addMaterial(rm.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selected ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {rm.name} ({rm.supplier?.name ?? "-"}) — Stok:{" "}
                                  {Number(rm.qty).toFixed(2)}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="mt-3 space-y-2">
                    {items.map((line, idx) => {
                      const rm = rawMaterials?.find(
                        (r: any) => r.id === line.rawMaterialId,
                      );

                      const qtyNum = toNumber(line.qty);
                      const unitPriceNum = toNumber(line.unitPrice);
                      const subtotal = qtyNum * unitPriceNum;

                      return (
                        <div
                          key={line.rawMaterialId}
                          className="rounded-xl border-2 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {rm?.name ?? "Unknown"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Supplier: {rm?.supplier?.name ?? "-"} • Stok:{" "}
                                {rm?.qty ? Number(rm.qty).toFixed(2) : "0.00"}
                              </p>
                            </div>

                            <ConfirmActionDialog
                              trigger={
                                <Button
                                  size="icon"
                                  variant="outline"
                                  disabled={disableFormInputs}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              variant="destructive"
                              title="Batalkan bahan baku ini?"
                              description="Anda akan menghapus bahan baku ini dari daftar pembelian. Tindakan ini tidak dapat dibatalkan."
                              confirmText="Ya, hapus"
                              cancelText="Kembali"
                              icon={<TriangleAlert className="size-6" />}
                              isLoading={disableFormInputs}
                              onConfirm={() =>
                                removeMaterial(line.rawMaterialId)
                              }
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <FieldLabel className="text-sm">Qty</FieldLabel>
                              <Input
                                className="h-11 rounded-xl border-2"
                                inputMode="decimal"
                                value={String(line.qty ?? "")}
                                onChange={(e) =>
                                  updateLine(idx, { qty: e.target.value })
                                }
                                disabled={disableFormInputs}
                              />
                            </div>

                            <div>
                              <FieldLabel className="text-sm">
                                Harga / Unit
                              </FieldLabel>
                              <Input
                                className="h-11 rounded-xl border-2"
                                inputMode="decimal"
                                value={String(line.unitPrice ?? "")}
                                onChange={(e) =>
                                  updateLine(idx, { unitPrice: e.target.value })
                                }
                                disabled={disableFormInputs}
                              />
                            </div>

                            <div>
                              <FieldLabel className="text-sm">
                                Subtotal
                              </FieldLabel>
                              <Input
                                className="bg-muted h-11 rounded-xl border-2"
                                readOnly
                                value={subtotal.toFixed(2)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}

                  <div className="mt-4 rounded-xl border-2 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-lg font-semibold">{toRupiah(total)}</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Total dihitung dari qty × harga/unit setiap item.
                    </p>
                  </div>
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            disabled={disableSubmit}
            className="font-medium"
          >
            {isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : mode === "create" ? (
              "Simpan Pembelian (Draft)"
            ) : (
              "Update Pembelian"
            )}
          </Button>

          {mode === "edit" && initialData?.id && (
            <PurchaseRawMaterialFormAction
              props={{
                lockUI,
                isReadOnlyByStatus,
                canSetOngoing,
                canSetFinished,
                canCancel,
                isSetOngoing,
                isSetFinished,
                isSetCanceled,
                setActiveAction: (a) => setActiveAction(a),
                updateStatus: ({ id, status }) => updateStatus({ id, status }),
                initialData: { id: initialData.id },
              }}
            />
          )}
        </div>
      </form>
    </div>
  );
}
