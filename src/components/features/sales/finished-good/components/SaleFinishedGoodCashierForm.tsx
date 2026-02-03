// ~/components/features/sales/finished-goods/components/SaleFinishedGoodCashierForm.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { generateRandomCode, toNumber, toRupiah } from "~/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";
import { Loader, Trash2, TriangleAlert, Wand } from "lucide-react";

import { saleFinishedGoodFormSchema } from "../form/sale-finished-good";

type Line = {
  finishedGoodId: string;
  productionCode: string;
  name: string;
  batchNumber: string;
  paintGradeName?: string;
  stock: number;
  qty: number | string;
  unitPrice: number | string;
};

type ActionKey = "draft" | "checkout" | null;

export function SaleFinishedGoodCashierForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: customers } = trpc.customer.getAll.useQuery();

  const [barcode, setBarcode] = useState("");
  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const [activeAction, setActiveAction] = useState<ActionKey>(null);

  const invalidateCaches = async () => {
    await Promise.all([
      utils.sale.getFinishedGoodPaginated.invalidate(),
      utils.finishedGood.getAll.invalidate(),
    ]);
  };

  const form = useForm({
    defaultValues: {
      userId: user?.id ?? "",
      saleNo: "",
      customerId: "",
      orderNo: "",
      invoiceNo: "",
      notes: "",
      items: [] as Line[],
    },

    // @ts-expect-error tanstack form
    validators: { onSubmit: saleFinishedGoodFormSchema },

    onSubmit: async ({ value }) => {
      // default submit = draft
      setActiveAction("draft");

      const payload = {
        userId: value.userId,
        saleNo: value.saleNo,
        customerId: value.customerId,
        orderNo: value.orderNo || null,
        invoiceNo: value.invoiceNo || null,
        notes: value.notes || null,
        items: (value.items ?? []).map((l) => ({
          finishedGoodId: l.finishedGoodId,
          qty: toNumber(l.qty),
          unitPrice: toNumber(l.unitPrice),
        })),
      };

      createDraft(payload);
    },
  });

  const { mutate: createDraft, isPending: isPendingDraft } =
    trpc.sale.createFinishedGood.useMutation({
      onSuccess: async () => {
        toast.success("Draft tersimpan", {
          description: "Penjualan dibuat sebagai DRAFT.",
        });

        await invalidateCaches();
        form.reset();
        setBarcode("");
        barcodeRef.current?.focus();

        setActiveAction(null);
        router.reload();
      },
      onError: (e) => {
        toast.error("Gagal simpan draft", { description: e.message });
        setActiveAction(null);
      },
    });

  const { mutate: checkout, isPending: isPendingCheckout } =
    trpc.sale.checkoutFinishedGood.useMutation({
      onSuccess: async () => {
        toast.success("Checkout berhasil", {
          description: "Status FINISHED, stok otomatis berkurang.",
        });

        await invalidateCaches();
        form.reset();
        setBarcode("");
        barcodeRef.current?.focus();

        setActiveAction(null);
        router.reload();
      },
      onError: (e) => {
        toast.error("Checkout gagal", { description: e.message });
        setActiveAction(null);
      },
    });

  // ✅ FIX: getByProductionCode adalah QUERY, jadi pakai utils...fetch (bukan useMutation)
  const [isLookuping, setIsLookuping] = useState(false);

  const lookupFgByBarcode = async (productionCode: string) => {
    const code = productionCode.trim();
    if (!code) return;

    try {
      setIsLookuping(true);

      const fg = await utils.finishedGood.getByProductionCode.fetch({
        productionCode: code,
      });

      const items = form.getFieldValue("items") ?? [];

      // already in cart -> +1 qty
      if (items.some((x) => x.finishedGoodId === fg.id)) {
        toast.info("Sudah ada di cart, qty ditambah 1");

        const next = items.map((x) =>
          x.finishedGoodId === fg.id
            ? { ...x, qty: toNumber(x.qty) + 1 }
            : x,
        );

        form.setFieldValue("items", next);
      } else {
        form.setFieldValue("items", [
          ...items,
          {
            finishedGoodId: fg.id,
            productionCode: fg.productionCode,
            name: fg.name,
            batchNumber: fg.batchNumber,
            paintGradeName: fg.paintGrade?.name,
            stock: Number(fg.qty),
            qty: 1,
            unitPrice: 0,
          },
        ]);
      }

      setBarcode("");
      barcodeRef.current?.focus();
    } catch (err: any) {
      toast.error("Barcode tidak ditemukan", {
        description: err?.message ?? "Tidak ditemukan",
      });
      barcodeRef.current?.select();
    } finally {
      setIsLookuping(false);
    }
  };

  useEffect(() => {
    if (user?.id) form.setFieldValue("userId", user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // ⚠️ getFieldValue tidak reactive, jadi kita render items lewat Field name="items"
  // Total juga dihitung di dalam Field render.

  const lockUI =
    isPendingDraft || isPendingCheckout || isLookuping || activeAction !== null;

  const doCheckout = () => {
    const v = form.state.values;

    setActiveAction("checkout");

    const payload = {
      userId: v.userId,
      saleNo: v.saleNo,
      customerId: v.customerId,
      orderNo: v.orderNo || null,
      invoiceNo: v.invoiceNo || null,
      notes: v.notes || null,
      shippedAt: new Date(),
      items: (v.items ?? []).map((l) => ({
        finishedGoodId: l.finishedGoodId,
        qty: toNumber(l.qty),
        unitPrice: toNumber(l.unitPrice),
      })),
    };

    checkout(payload);
  };

  return (
    <div className="py-4">
      {/* BARCODE INPUT */}
      <div className="mb-4 rounded-2xl border-2 p-4">
        <p className="text-sm font-medium">Scan Barcode</p>
        <p className="text-muted-foreground text-xs">
          Scan/ketik productionCode lalu tekan Enter.
        </p>

        <div className="mt-3 flex gap-2">
          <Input
            ref={barcodeRef}
            placeholder="SCAN DISINI (productionCode)..."
            className="h-12 rounded-xl border-2"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={lockUI}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                lookupFgByBarcode(barcode);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-12"
            disabled={lockUI || !barcode.trim()}
            onClick={() => lookupFgByBarcode(barcode)}
          >
            {isLookuping ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Tambah"
            )}
          </Button>
        </div>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* HEADER INPUTS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="saleNo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-base">
                      Nomor Penjualan <IsRequired />
                    </FieldLabel>

                    <div className="grid grid-cols-7 gap-2">
                      <Input
                        placeholder="SJ0001"
                        className="col-span-6 h-12 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={lockUI}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        className="py-5"
                        onClick={() =>
                          field.handleChange(generateRandomCode("SJ"))
                        }
                        disabled={lockUI}
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

            <form.Field name="invoiceNo">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">
                    Invoice No (opsional)
                  </FieldLabel>
                  <Input
                    placeholder="INV-001"
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={lockUI}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="orderNo">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">
                    Order No (opsional)
                  </FieldLabel>
                  <Input
                    placeholder="SO-001"
                    className="h-12 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={lockUI}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="customerId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-base">
                      Customer <IsRequired />
                    </FieldLabel>

                    <Select
                      value={String(field.state.value ?? "")}
                      onValueChange={field.handleChange}
                      disabled={lockUI}
                    >
                      <SelectTrigger className="min-h-12 rounded-2xl border-2">
                        <SelectValue placeholder="Pilih customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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

          <form.Field name="notes">
            {(field) => (
              <Field>
                <FieldLabel className="text-base">Catatan (opsional)</FieldLabel>
                <Textarea
                  placeholder="Catatan kasir / pengiriman..."
                  rows={3}
                  className="h-28"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={lockUI}
                />
              </Field>
            )}
          </form.Field>

          {/* CART */}
          <form.Field name="items">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              const items = field.state.value ?? [];

              const total = items.reduce(
                (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
                0,
              );

              const removeLine = (finishedGoodId: string) => {
                if (lockUI) return;
                field.handleChange(
                  items.filter((x) => x.finishedGoodId !== finishedGoodId),
                );
              };

              const updateLine = (idx: number, patch: Partial<Line>) => {
                if (lockUI) return;
                const next = items.map((it, i) =>
                  i === idx ? { ...it, ...patch } : it,
                );
                field.handleChange(next);
              };

              return (
                <Field data-invalid={isInvalid}>
                  <div className="rounded-2xl border-2 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Cart</p>
                      <p className="text-xs text-muted-foreground">
                        {items.length} item
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {items.length === 0 ? (
                        <div className="text-muted-foreground rounded-xl border-2 p-4 text-sm">
                          Belum ada item. Scan barcode untuk menambah.
                        </div>
                      ) : (
                        items.map((line, idx) => {
                          const qtyNum = toNumber(line.qty);
                          const unitNum = toNumber(line.unitPrice);
                          const subtotal = qtyNum * unitNum;

                          return (
                            <div
                              key={line.finishedGoodId}
                              className="rounded-xl border-2 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {line.name}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {line.productionCode} • Batch:{" "}
                                    {line.batchNumber} • Grade:{" "}
                                    {line.paintGradeName ?? "-"} • Stok:{" "}
                                    {Number(line.stock).toFixed(2)}
                                  </p>
                                </div>

                                <ConfirmActionDialog
                                  trigger={
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      disabled={lockUI}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  }
                                  variant="destructive"
                                  title="Hapus item ini?"
                                  description="Item akan dihapus dari cart."
                                  confirmText="Ya, hapus"
                                  cancelText="Batal"
                                  icon={<TriangleAlert className="size-6" />}
                                  isLoading={lockUI}
                                  onConfirm={() => removeLine(line.finishedGoodId)}
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
                                    disabled={lockUI}
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
                                      updateLine(idx, {
                                        unitPrice: e.target.value,
                                      })
                                    }
                                    disabled={lockUI}
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
                        })
                      )}
                    </div>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}

                    <div className="mt-4 rounded-xl border-2 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-lg font-semibold">{toRupiah(total)}</p>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Total dihitung dari qty × harga/unit.
                      </p>
                    </div>
                  </div>
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            variant="outline"
            disabled={lockUI || (form.state.values.items?.length ?? 0) === 0}
          >
            {activeAction === "draft" && isPendingDraft ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Simpan Draft"
            )}
          </Button>

          <ConfirmActionDialog
            trigger={
              <Button
                type="button"
                disabled={lockUI || (form.state.values.items?.length ?? 0) === 0}
              >
                {activeAction === "checkout" && isPendingCheckout ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Checkout / Posting (FINISHED)"
                )}
              </Button>
            }
            variant="destructive"
            title="Checkout sekarang?"
            description="Saat FINISHED, stok barang jadi akan berkurang dan stock movement SALE_OUT tercatat."
            confirmText="Ya, checkout"
            cancelText="Batal"
            icon={<TriangleAlert className="size-6" />}
            isLoading={lockUI}
            onConfirm={doCheckout}
          />
        </div>
      </form>
    </div>
  );
}
