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
import { Textarea } from "~/components/ui/textarea";
import { useRouter } from "next/router";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";
import { purchaseAccessoriesFormSchema } from "~/components/features/purchases/accessories/form/purchase-accessories";

type PurchaseAccessoriesFormProps = {
  mode: "create" | "edit";
  initialData?: any | null; // replace with your Purchase type if you have it
};

type Line = {
  accessoryId: string;
  qty: number | string;
  unitPrice: number | string;
};

type ActionKey =
  | "submit"
  | "set-ongoing"
  | "set-finished"
  | "set-canceled"
  | null;

export function PurchaseAccessoriesForm({
  mode,
  initialData,
}: PurchaseAccessoriesFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: suppliers } = trpc.supplier.getAll.useQuery();

  const { data: accessories } = trpc.accessories.getAll.useQuery();

  const [openPicker, setOpenPicker] = useState(false);
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
    validators: { onSubmit: purchaseAccessoriesFormSchema },

    onSubmit: async ({ value }) => {
      setActiveAction("submit");

      const itemsPayload = (value.items ?? []).map((l) => ({
        accessoryId: l.accessoryId,
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

      if (mode === "create") createPurchase(payload);
      else updatePurchase(payload);
    },
  });

  const { mutate: createPurchase, isPending: isPendingCreate } =
    trpc.purchase.createAccessories.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Pembelian accessories berhasil dibuat",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getAccessoriesPaginated?.invalidate?.();

        form.reset();
        router.reload();

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
    trpc.purchase.updateAccessories.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Pembelian accessories berhasil diperbarui!",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getAccessoriesPaginated?.invalidate?.();
        await utils.purchase.getById.invalidate({ id: initialData?.id });

        setActiveAction(null);
        router.reload();
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

  // (optional) keep status mutation same as your raw material form
  const { mutate: updateStatus, isPending: isPendingUpdateStatus } =
    trpc.purchase.updateStatus.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!", {
          description: "Status purchase berhasil diubah.",
        });

        await utils.purchase.getPaginated.invalidate();
        await utils.purchase.getAccessoriesPaginated?.invalidate?.();
        await utils.accessories.invalidate();
        await utils.purchase.getById.invalidate({ id: initialData?.id });

        setActiveAction(null);
        router.reload();
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
        (initialData.items ?? [])
          .filter((it: any) => it.itemType === "PAINT_ACCESSORIES")
          .map((it: any) => ({
            accessoryId: it.accessoryId,
            qty: typeof it.qty === "string" ? toNumber(it.qty) : it.qty,
            unitPrice: it.unitPrice,
          })),
      );
    } else if (mode === "create") {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id, initialData?.supplierId, suppliers?.length]);

  const currentStatus = initialData?.status as
    | "DRAFT"
    | "ONGOING"
    | "FINISHED"
    | "CANCELED"
    | undefined;

  const isReadOnlyByStatus =
    mode === "edit" && (currentStatus === "FINISHED" || currentStatus === "CANCELED");

  const lockUI =
    (isPendingCreate || isPendingUpdate || isPendingUpdateStatus) &&
    activeAction !== null;

  const disableFormInputs = lockUI || isReadOnlyByStatus;
  const disableSubmit = lockUI || (mode === "edit" && isReadOnlyByStatus);

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
                        placeholder="PA0001"
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
                        onClick={() => field.handleChange(generateRandomCode("PA"))}
                        disabled={mode === "edit" || disableFormInputs}
                      >
                        <Wand className="size-5" strokeWidth={2.5} />
                      </Button>
                    </div>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

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
          </div>

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
                    <SelectTrigger className="min-h-12 rounded-2xl border-2">
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s) => (
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

          <form.Field name="notes">
            {(field) => (
              <Field>
                <FieldLabel className="text-base">Catatan (opsional)</FieldLabel>
                <Textarea
                  placeholder="Masukkan catatan..."
                  rows={4}
                  className="h-32"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disableFormInputs}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="items">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const items = field.state.value ?? [];

              const total = items.reduce(
                (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
                0,
              );

              const addAccessory = (accessoryId: string) => {
                if (disableFormInputs) return;

                if (items.some((x) => x.accessoryId === accessoryId)) {
                  toast.info("Accessory sudah dipilih!");
                  return;
                }

                const acc = accessories?.find((a: any) => a.id === accessoryId);

                field.handleChange([
                  ...items,
                  {
                    accessoryId,
                    qty: 1,
                    unitPrice: acc?.supplierPrice ?? 0,
                  },
                ]);

                setOpenPicker(false);
              };

              const removeAccessory = (accessoryId: string) => {
                if (disableFormInputs) return;
                field.handleChange(items.filter((x) => x.accessoryId !== accessoryId));
              };

              const updateLine = (idx: number, patch: Partial<Line>) => {
                if (disableFormInputs) return;
                const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
                field.handleChange(next);
              };

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-base">
                    Pilih Accessories <IsRequired />
                  </FieldLabel>

                  <Popover open={openPicker} onOpenChange={setOpenPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto min-h-12 w-full justify-start rounded-xl border-2"
                        disabled={disableFormInputs}
                      >
                        {items.length > 0 ? (
                          <span>{items.length} accessories dipilih</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Pilih accessories...
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari accessories..." />
                        <CommandList>
                          <CommandEmpty>Tidak ada accessories.</CommandEmpty>
                          <CommandGroup>
                            {accessories?.map((acc: any) => {
                              const selected = items.some((i) => i.accessoryId === acc.id);
                              return (
                                <CommandItem key={acc.id} onSelect={() => addAccessory(acc.id)}>
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selected ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {acc.name} ({acc.supplier?.name ?? "-"}) — Stok:{" "}
                                  {Number(acc.qty ?? 0).toFixed(2)}
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
                      const acc = accessories?.find((a: any) => a.id === line.accessoryId);

                      const qtyNum = toNumber(line.qty);
                      const unitPriceNum = toNumber(line.unitPrice);
                      const subtotal = qtyNum * unitPriceNum;

                      return (
                        <div key={line.accessoryId} className="rounded-xl border-2 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{acc?.name ?? "Unknown"}</p>
                              <p className="text-muted-foreground text-xs">
                                Supplier: {acc?.supplier?.name ?? "-"} • Stok:{" "}
                                {Number(acc?.qty ?? 0).toFixed(2)}
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
                              title="Hapus accessories ini?"
                              description="Anda akan menghapus accessories ini dari daftar pembelian."
                              confirmText="Ya, hapus"
                              cancelText="Kembali"
                              icon={<TriangleAlert className="size-6" />}
                              isLoading={disableFormInputs}
                              onConfirm={() => removeAccessory(line.accessoryId)}
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <FieldLabel className="text-sm">Qty</FieldLabel>
                              <Input
                                className="h-11 rounded-xl border-2"
                                inputMode="decimal"
                                value={String(line.qty ?? "")}
                                onChange={(e) => updateLine(idx, { qty: e.target.value })}
                                disabled={disableFormInputs}
                              />
                            </div>

                            <div>
                              <FieldLabel className="text-sm">Harga / Unit</FieldLabel>
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
          <Button type="submit" disabled={disableSubmit} className="font-medium">
            {activeAction === "submit" && (isPendingCreate || isPendingUpdate) ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : mode === "create" ? (
              "Simpan Pembelian (Draft)"
            ) : (
              "Update Pembelian"
            )}
          </Button>

          {/* If you want the same actions as raw material, you can re-enable your PurchaseRawMaterialFormAction logic,
              but wired to updateStatus({ id, status }) exactly like you already have. */}
        </div>
      </form>
    </div>
  );
}
