"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { cn, generateRandomCode, toRupiah } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Check, Loader, Wand, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { purchaseRawMaterialFormSchema } from "../form/purchase-raw-material";
import type { PurchaseRawMaterialFull } from "~/types/purchase";

type PurchaseStatus = "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";

type PurchaseRawMaterialFormProps = {
  mode: "create" | "edit";
  initialData?: PurchaseRawMaterialFull | null;
};

type Line = {
  rawMaterialId: string;
  qty: number | string;
  unitPrice: number | string;
};

const toNumber = (v: string | number | undefined | null) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? "").replaceAll(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function PurchaseRawMaterialForm({ mode, initialData }: PurchaseRawMaterialFormProps) {
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: suppliers } = trpc.supplier.getAll.useQuery();
  const { data: rawMaterials } = trpc.rawMaterial.getAll.useQuery();

  const [openMaterialPicker, setOpenMaterialPicker] = useState(false);

  const { mutate: createPurchase, isPending: isPendingCreate } =
    trpc.purchase.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", { description: "Pembelian bahan baku berhasil dibuat" });
        utils.purchase.getPaginated.invalidate();
        utils.purchase.getRawMaterialPaginated?.invalidate?.(); // kalau ada di client
        form.reset();
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : error.message ?? "Coba periksa kembali form anda!",
        });
      },
    });

  const { mutate: updatePurchase, isPending: isPendingUpdate } =
    trpc.purchase.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", { description: "Pembelian bahan baku berhasil diperbarui!" });
        utils.purchase.getPaginated.invalidate();
        utils.purchase.getRawMaterialPaginated?.invalidate?.();
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : error.message || "Coba periksa kembali form anda!",
        });
      },
    });

  const { mutate: updateStatus, isPending: isPendingUpdateStatus } =
    trpc.purchase.updateStatus.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!", { description: "Status purchase berhasil diubah." });
        utils.purchase.getPaginated.invalidate();
        utils.purchase.getRawMaterialPaginated?.invalidate?.();
        utils.rawMaterial.getAll.invalidate(); // karena FINISHED bisa nambah stok
      },
      onError: (error) => {
        toast.error("Gagal ubah status", {
          description: error.message || "Tidak bisa mengubah status purchase.",
        });
      },
    });

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
      // payload items harus sesuai schema zod kamu: rawMaterialId, qty, unitPrice
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
  }, [mode, initialData?.id]);

  const isLoading = isPendingCreate || isPendingUpdate || isPendingUpdateStatus;

  const currentStatus: PurchaseStatus | undefined = initialData?.status;

  const canSetOngoing = mode === "edit" && (currentStatus === "DRAFT");
  const canSetFinished = mode === "edit" && (currentStatus === "DRAFT" || currentStatus === "ONGOING");
  const canCancel = mode === "edit" && (currentStatus === "DRAFT" || currentStatus === "ONGOING");

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
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
                        disabled={mode === "edit"}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className="py-5"
                        onClick={() => field.handleChange(generateRandomCode("PB"))}
                        disabled={mode === "edit"}
                      >
                        <Wand className="size-5" strokeWidth={2.5} />
                      </Button>
                    </div>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="supplierId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-base">
                      Supplier <IsRequired />
                    </FieldLabel>

                    <Select value={String(field.state.value ?? "")} onValueChange={field.handleChange}>
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

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="receivedNote">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">No. Surat Jalan (opsional)</FieldLabel>
                  <Input
                    placeholder="SJ-001"
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="notes">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">Catatan (opsional)</FieldLabel>
                  <Input
                    placeholder="Catatan pembelian..."
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          {/* ITEMS (reactive subtotal + total) */}
          <form.Field name="items">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              const items = field.state.value ?? [];

              const total = items.reduce((acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice), 0);

              const addMaterial = (rawMaterialId: string) => {
                if (items.some((x) => x.rawMaterialId === rawMaterialId)) {
                  toast.info("Bahan baku sudah dipilih!");
                  return;
                }
                const rm = rawMaterials?.find((r: any) => r.id === rawMaterialId);

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
                field.handleChange(items.filter((x) => x.rawMaterialId !== rawMaterialId));
              };

              const updateLine = (idx: number, patch: Partial<Line>) => {
                const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
                field.handleChange(next);
              };

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-base">
                    Pilih Bahan Baku <IsRequired />
                  </FieldLabel>

                  <Popover open={openMaterialPicker} onOpenChange={setOpenMaterialPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                      >
                        {items.length > 0 ? (
                          <span>{items.length} bahan baku dipilih</span>
                        ) : (
                          <span className="text-muted-foreground">Pilih bahan baku...</span>
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
                              const selected = items.some((i) => i.rawMaterialId === rm.id);
                              return (
                                <CommandItem key={rm.id} onSelect={() => addMaterial(rm.id)}>
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
                      const rm = rawMaterials?.find((r: any) => r.id === line.rawMaterialId);

                      const qtyNum = toNumber(line.qty);
                      const unitPriceNum = toNumber(line.unitPrice);
                      const subtotal = qtyNum * unitPriceNum;

                      return (
                        <div key={line.rawMaterialId} className="rounded-xl border-2 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{rm?.name ?? "Unknown"}</p>
                              <p className="text-muted-foreground text-xs">
                                Supplier: {rm?.supplier?.name ?? "-"} • Stok:{" "}
                                {rm?.qty ? Number(rm.qty).toFixed(2) : "0.00"}
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeMaterial(line.rawMaterialId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <FieldLabel className="text-sm">Qty</FieldLabel>
                              <Input
                                className="h-11 rounded-xl border-2"
                                inputMode="decimal"
                                value={String(line.qty ?? "")}
                                onChange={(e) => updateLine(idx, { qty: e.target.value })}
                              />
                            </div>

                            <div>
                              <FieldLabel className="text-sm">Harga / Unit</FieldLabel>
                              <Input
                                className="h-11 rounded-xl border-2"
                                inputMode="decimal"
                                value={String(line.unitPrice ?? "")}
                                onChange={(e) => updateLine(idx, { unitPrice: e.target.value })}
                              />
                            </div>

                            <div>
                              <FieldLabel className="text-sm">Subtotal</FieldLabel>
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
          <Button type="submit" disabled={isLoading} className="font-medium">
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : mode === "create" ? (
              "Simpan Pembelian (Draft)"
            ) : (
              "Update Pembelian"
            )}
          </Button>

          {mode === "edit" && initialData?.id && (
            <>
              {canSetOngoing && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => updateStatus({ id: initialData.id, status: "ONGOING" })}
                >
                  Set Ongoing
                </Button>
              )}

              {canSetFinished && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => updateStatus({ id: initialData.id, status: "FINISHED" })}
                >
                  Finish (Tambah Stok)
                </Button>
              )}

              {canCancel && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => updateStatus({ id: initialData.id, status: "CANCELED" })}
                >
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
