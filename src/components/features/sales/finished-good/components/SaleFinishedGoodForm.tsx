// ~/components/features/sales/finished-goods/components/SaleFinishedGoodForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
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

import {
  Check,
  Loader,
  Trash2,
  TriangleAlert,
  ShoppingCart,
  Package,
  User as UserIcon,
  Plus,
  DollarSign,
  Save,
  Send,
  XCircle,
  PlayCircle,
  Sparkles,
  Receipt,
  Info,
  Calculator,
  TrendingUp,
  Barcode,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";

import { saleFinishedGoodFormSchema } from "../form/sale-finished-good";
import type { SaleFinishedGoodFull, SaleStatus } from "~/types/sale";

type SaleFinishedGoodFormProps = {
  mode: "create" | "edit";
  initialData?: SaleFinishedGoodFull | null;
};

type Line = {
  finishedGoodId: string;
  qty: number | string;

  // POS extras
  productionCode?: string;
  name?: string;
  batchNumber?: string;
  paintGradeName?: string;
  stock?: number;

  costPrice: number;    // auto
  marginPct: number;    // editable
  unitPrice: number | string; // selling price
};

type ActionKey =
  | "submit"
  | "set-ongoing"
  | "set-finished"
  | "set-canceled"
  | null;

/**
 * IMPORTANT:
 * - Use form.state.values to compute summary (NO form.useStore; it may not exist depending on tanstack version)
 * - For barcode lookup, use trpc.*.useMutation only for mutation procedures.
 *   If your getByProductionCode is a QUERY, call it using utils.<router>.<proc>.fetch(...)
 */
export function SaleFinishedGoodForm({ mode, initialData }: SaleFinishedGoodFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: customers } = trpc.customer.getAll.useQuery();
  const { data: finishedGoods } = trpc.finishedGood.getAll.useQuery();

  const [openPicker, setOpenPicker] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionKey>(null);

  // POS / barcode
  const [barcode, setBarcode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const invalidateCaches = async (saleId?: string) => {
    await Promise.all([
      utils.sale.getFinishedGoodPaginated.invalidate(),
      utils.sale.getPaginated.invalidate?.(),
      ...(saleId ? [utils.sale.getByIdFinishedGood.invalidate({ id: saleId })] : []),
      utils.finishedGood.getAll.invalidate(),
    ]);
  };

  const form = useForm({
    defaultValues: {
      id: initialData?.id,
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
      setActiveAction("submit");

      const itemsPayload = (value.items ?? []).map((l) => ({
        finishedGoodId: l.finishedGoodId,
        qty: toNumber(l.qty),
        unitPrice: toNumber(l.unitPrice),
      }));

      const payload = {
        id: mode === "edit" ? initialData?.id : undefined,
        userId: value.userId,
        saleNo: value.saleNo,
        customerId: value.customerId,
        orderNo: value.orderNo || null,
        invoiceNo: value.invoiceNo || null,
        notes: value.notes || null,
        items: itemsPayload,
      };

      if (mode === "create") createSale(payload);
      else updateSale(payload);
    },
  });

  const { mutate: createSale, isPending: isPendingCreate } =
    trpc.sale.createFinishedGood.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", { description: "Penjualan barang jadi dibuat (DRAFT)." });
        await invalidateCaches();
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

  const { mutate: updateSale, isPending: isPendingUpdate } =
    trpc.sale.updateFinishedGood.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", { description: "Penjualan barang jadi diperbarui!" });
        await invalidateCaches(initialData?.id);
        setActiveAction(null);
        router.reload();
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

  const { mutate: updateStatus, isPending: isPendingUpdateStatus } =
    trpc.sale.updateStatus.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!", { description: "Status sale berhasil diubah." });
        await invalidateCaches(initialData?.id);
        setActiveAction(null);
        router.reload();
      },
      onError: (error) => {
        toast.error("Gagal ubah status", { description: error.message || "Tidak bisa mengubah status sale." });
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
      form.setFieldValue("saleNo", initialData.saleNo);
      form.setFieldValue("customerId", initialData.customerId);
      form.setFieldValue("orderNo", initialData.orderNo ?? "");
      form.setFieldValue("invoiceNo", initialData.invoiceNo ?? "");
      form.setFieldValue("notes", initialData.notes ?? "");

      // We don't have cost/margin stored in DB.
      // In edit mode, set defaults:
      // - costPrice = 0 initially, we will compute lazily when user opens/uses items.
      // - marginPct = 0
      // - unitPrice from existing sale item
      form.setFieldValue(
        "items",
        (initialData.items ?? []).map((it) => ({
          finishedGoodId: it.finishedGoodId,
          qty: typeof it.qty === "string" ? toNumber(it.qty) : it.qty,
          unitPrice: it.unitPrice,
          costPrice: 0,
          marginPct: 0,
        })),
      );
    } else if (mode === "create") {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id, initialData?.customerId, customers?.length]);

  const currentStatus: SaleStatus | undefined = initialData?.status;

  const isReadOnlyByStatus =
    mode === "edit" && (currentStatus === "FINISHED" || currentStatus === "CANCELED");

  const isSubmitting =
    activeAction === "submit" && (isPendingCreate || isPendingUpdate);

  const isSetOngoing = activeAction === "set-ongoing" && isPendingUpdateStatus;
  const isSetFinished = activeAction === "set-finished" && isPendingUpdateStatus;
  const isSetCanceled = activeAction === "set-canceled" && isPendingUpdateStatus;

  const lockUI =
    (isPendingCreate || isPendingUpdate || isPendingUpdateStatus) && activeAction !== null;

  const disableFormInputs = lockUI || isReadOnlyByStatus;
  const disableSubmit = lockUI || (mode === "edit" && isReadOnlyByStatus);

  const canSetOngoing = mode === "edit" && currentStatus === "DRAFT";
  const canSetFinished = mode === "edit" && (currentStatus === "DRAFT" || currentStatus === "ONGOING");
  const canCancel = mode === "edit" && (currentStatus === "DRAFT" || currentStatus === "ONGOING");

  const getStatusConfig = (status?: SaleStatus) => {
    const configs = {
      DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700" },
      ONGOING: { label: "Ongoing", className: "bg-blue-100 text-blue-700" },
      FINISHED: { label: "Finished", className: "bg-emerald-100 text-emerald-700" },
      CANCELED: { label: "Canceled", className: "bg-red-100 text-red-700" },
    };
    return status ? configs[status] : null;
  };

  const statusConfig = getStatusConfig(currentStatus);

  /** Helpers */
  const getLines = () => (form.state.values.items ?? []);

  const updateLineAt = (idx: number, patch: Partial<Line>) => {
    const lines = getLines();
    const next = lines.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    form.setFieldValue("items", next);
  };

  const removeLineById = (finishedGoodId: string) => {
    const lines = getLines();
    form.setFieldValue(
      "items",
      lines.filter((x) => x.finishedGoodId !== finishedGoodId),
    );
  };

  const computeSellingFromMargin = (cost: number, marginPct: number) => {
    const pct = Number.isFinite(marginPct) ? marginPct : 0;
    return cost * (1 + pct / 100);
  };

  const computeMarginFromPrices = (cost: number, selling: number) => {
    if (!cost) return 0;
    return ((selling - cost) / cost) * 100;
  };

  /** Cost fetcher (assumes you have finishedGood.getCostPrice query) */
  const fetchCostPrice = async (finishedGoodId: string): Promise<number> => {
    // If you don't have this in backend yet, implement it as described earlier.
    // Query usage: utils.finishedGood.getCostPrice.fetch({ finishedGoodId })
    const res = await utils.finishedGood.getCostPrice.fetch({ finishedGoodId });
    return Number(res.cost ?? 0);
  };

  /** Add product with smart defaults (cost + 30% margin suggestion) */
  const addFinishedGood = async (finishedGoodId: string) => {
    if (disableFormInputs) return;

    const lines = getLines();
    if (lines.some((x) => x.finishedGoodId === finishedGoodId)) {
      toast.info("Sudah ada di cart, qty ditambah 1");
      const next = lines.map((x) =>
        x.finishedGoodId === finishedGoodId ? { ...x, qty: toNumber(x.qty) + 1 } : x,
      );
      form.setFieldValue("items", next);
      return;
    }

    const fg = finishedGoods?.find((f) => f.id === finishedGoodId);

    let costPrice = 0;
    try {
      costPrice = await fetchCostPrice(finishedGoodId);
    } catch {
      // If cost service not ready, still allow add.
      costPrice = 0;
    }

    const marginPct = 30;
    const suggested = computeSellingFromMargin(costPrice, marginPct);

    form.setFieldValue("items", [
      ...lines,
      {
        finishedGoodId,
        productionCode: fg?.productionCode,
        name: fg?.name,
        batchNumber: fg?.batchNumber,
        paintGradeName: fg?.paintGrade?.name,
        stock: fg?.qty ? Number(fg.qty) : 0,
        qty: 1,
        costPrice,
        marginPct,
        unitPrice: suggested || 0,
      },
    ]);

    setOpenPicker(false);
  };

  /** Barcode lookup flow (QUERY-safe) */
  const lookupByBarcode = async () => {
    const code = barcode.trim();
    if (!code) return;

    setIsLookingUp(true);
    try {
      // IMPORTANT: getByProductionCode is likely a QUERY, not mutation:
      const fg = await utils.finishedGood.getByProductionCode.fetch({
        productionCode: code,
      });

      await addFinishedGood(fg.id);
      setBarcode("");
    } catch (e: any) {
      toast.error("Barcode tidak ditemukan", { description: e?.message ?? "Tidak ditemukan" });
    } finally {
      setIsLookingUp(false);
    }
  };

  /** Summary */
  const summary = useMemo(() => {
    const lines = getLines();

    const totalCost = lines.reduce(
      (acc, it) => acc + toNumber(it.qty) * Number(it.costPrice ?? 0),
      0,
    );

    const revenue = lines.reduce(
      (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
      0,
    );

    const profit = revenue - totalCost;
    const marginPct = totalCost ? (profit / totalCost) * 100 : 0;

    const totalUnits = lines.reduce((acc, it) => acc + toNumber(it.qty), 0);

    return {
      totalLines: lines.length,
      totalUnits,
      totalCost,
      revenue,
      profit,
      marginPct,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state.values.items]);

  return (
    <div className="container space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Penjualan Barang Jadi" : "Edit Penjualan"}
          </h1>
          <p className="text-muted-foreground">
            Mode kasir: scan barcode → masuk cart → atur margin/price → simpan → posting.
          </p>
        </div>

        {statusConfig && (
          <Badge className={cn("text-sm", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        )}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* SALE INFO */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Informasi Penjualan</CardTitle>
                    <CardDescription>Detail transaksi penjualan</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <FieldGroup>
                  {/* saleNo */}
                  <form.Field name="saleNo">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            Nomor Penjualan <IsRequired />
                          </FieldLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="SJ0001"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              disabled={mode === "edit" || disableFormInputs}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.handleChange(generateRandomCode("SJ"))}
                              disabled={mode === "edit" || disableFormInputs}
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  {/* customer */}
                  <form.Field name="customerId">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            Customer <IsRequired />
                          </FieldLabel>

                          <Select
                            value={String(field.state.value ?? "")}
                            onValueChange={field.handleChange}
                            disabled={disableFormInputs}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    {c.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field name="orderNo">
                      {(field) => (
                        <Field>
                          <FieldLabel>Order No (opsional)</FieldLabel>
                          <Input
                            placeholder="SO-001"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={disableFormInputs}
                          />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="invoiceNo">
                      {(field) => (
                        <Field>
                          <FieldLabel>Invoice No (opsional)</FieldLabel>
                          <Input
                            placeholder="INV-001"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={disableFormInputs}
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <form.Field name="notes">
                    {(field) => (
                      <Field>
                        <FieldLabel>Catatan (opsional)</FieldLabel>
                        <Textarea
                          placeholder="Catatan penjualan..."
                          rows={3}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={disableFormInputs}
                        />
                      </Field>
                    )}
                  </form.Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* ITEMS */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Cart Barang Jadi</CardTitle>
                    <CardDescription>Tambah barang via picker atau barcode</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form.Field name="items">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    const lines = (field.state.value ?? []) as Line[];

                    const updateLine = (idx: number, patch: Partial<Line>) => {
                      if (disableFormInputs) return;
                      const next = lines.map((it, i) => (i === idx ? { ...it, ...patch } : it));
                      field.handleChange(next);
                    };

                    const removeLine = (finishedGoodId: string) => {
                      if (disableFormInputs) return;
                      field.handleChange(lines.filter((x) => x.finishedGoodId !== finishedGoodId));
                    };

                    return (
                      <Field data-invalid={isInvalid} className="space-y-4">
                        {/* Picker */}
                        <Popover open={openPicker} onOpenChange={setOpenPicker}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start border-dashed"
                              disabled={disableFormInputs}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {lines.length > 0
                                ? `${lines.length} item dipilih - klik untuk tambah`
                                : "Tambah barang jadi ke cart"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[420px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Cari barang..." />
                              <CommandList>
                                <CommandEmpty>Tidak ada barang.</CommandEmpty>
                                <CommandGroup>
                                  {finishedGoods?.map((fg) => {
                                    const selected = lines.some((i) => i.finishedGoodId === fg.id);
                                    return (
                                      <CommandItem
                                        key={fg.id}
                                        onSelect={() => addFinishedGood(fg.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selected ? "opacity-100" : "opacity-0",
                                          )}
                                        />
                                        <div className="flex-1">
                                          <div className="font-medium">{fg.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Code: {fg.productionCode} • Batch: {fg.batchNumber} • Grade:{" "}
                                            {fg.paintGrade?.name ?? "-"} • Stock:{" "}
                                            {Number(fg.qty).toFixed(2)}
                                          </div>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Lines */}
                        {lines.length > 0 && (
                          <div className="space-y-3">
                            {lines.map((line, idx) => {
                              const fg = finishedGoods?.find((f) => f.id === line.finishedGoodId);

                              const qtyNum = toNumber(line.qty);
                              const unitPriceNum = toNumber(line.unitPrice);
                              const cost = Number(line.costPrice ?? 0);

                              const subtotal = qtyNum * unitPriceNum;
                              const costTotal = qtyNum * cost;
                              const profit = subtotal - costTotal;
                              const profitPct = costTotal ? (profit / costTotal) * 100 : 0;

                              return (
                                <Card key={line.finishedGoodId} className="overflow-hidden">
                                  <CardContent className="p-4 space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                          <Package className="h-5 w-5 text-emerald-600" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold">
                                            {line.name ?? fg?.name ?? "Unknown"}
                                          </h4>
                                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <span>Code: {line.productionCode ?? fg?.productionCode ?? "-"}</span>
                                            <span>•</span>
                                            <span>Batch: {line.batchNumber ?? fg?.batchNumber ?? "-"}</span>
                                            <span>•</span>
                                            <span>Grade: {line.paintGradeName ?? fg?.paintGrade?.name ?? "-"}</span>
                                            <span>•</span>
                                            <span className="font-medium text-emerald-600">
                                              Stock: {Number(line.stock ?? fg?.qty ?? 0).toFixed(2)}
                                            </span>
                                          </div>

                                          {/* Cost/Profit badges */}
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge className="bg-amber-100 text-amber-700">
                                              <Calculator className="mr-1 h-3.5 w-3.5" />
                                              Cost: {toRupiah(cost)}
                                            </Badge>

                                            <Badge className="bg-emerald-100 text-emerald-700">
                                              <TrendingUp className="mr-1 h-3.5 w-3.5" />
                                              Profit: {toRupiah(profit)} ({profitPct.toFixed(1)}%)
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <ConfirmActionDialog
                                        trigger={
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                                            disabled={disableFormInputs}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        }
                                        variant="destructive"
                                        title="Hapus item ini?"
                                        description="Item akan dihapus dari cart."
                                        confirmText="Hapus"
                                        cancelText="Batal"
                                        icon={<TriangleAlert className="size-6" />}
                                        isLoading={disableFormInputs}
                                        onConfirm={() => removeLine(line.finishedGoodId)}
                                      />
                                    </div>

                                    <Separator />

                                    {/* Margin controls */}
                                    <div className="grid gap-3 sm:grid-cols-3">
                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">Qty</FieldLabel>
                                        <Input
                                          inputMode="decimal"
                                          value={String(line.qty ?? "")}
                                          onChange={(e) => updateLine(idx, { qty: e.target.value })}
                                          disabled={disableFormInputs}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">Margin %</FieldLabel>
                                        <Input
                                          type="number"
                                          value={String(line.marginPct ?? 0)}
                                          onChange={(e) => {
                                            const m = Number(e.target.value || 0);
                                            const selling = computeSellingFromMargin(cost, m);
                                            updateLine(idx, {
                                              marginPct: m,
                                              unitPrice: selling,
                                            });
                                          }}
                                          disabled={disableFormInputs}
                                        />

                                        <div className="flex flex-wrap gap-1">
                                          {[20, 30, 40, 50].map((m) => (
                                            <Button
                                              key={m}
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              disabled={disableFormInputs}
                                              onClick={() => {
                                                const selling = computeSellingFromMargin(cost, m);
                                                updateLine(idx, {
                                                  marginPct: m,
                                                  unitPrice: selling,
                                                });
                                              }}
                                            >
                                              +{m}%
                                            </Button>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">Harga / Unit</FieldLabel>
                                        <Input
                                          inputMode="decimal"
                                          value={String(line.unitPrice ?? "")}
                                          onChange={(e) => {
                                            const selling = toNumber(e.target.value);
                                            const m = computeMarginFromPrices(cost, selling);
                                            updateLine(idx, {
                                              unitPrice: e.target.value,
                                              marginPct: Number.isFinite(m) ? m : 0,
                                            });
                                          }}
                                          disabled={disableFormInputs}
                                        />
                                      </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="grid gap-3 sm:grid-cols-3">
                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">Subtotal</FieldLabel>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                                          {toRupiah(subtotal)}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">Total Cost</FieldLabel>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                                          {toRupiah(costTotal)}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">Profit</FieldLabel>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                                          {toRupiah(profit)}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}

                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ringkasan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah Line</span>
                  <span className="font-medium">{summary.totalLines}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Qty</span>
                  <span className="font-medium">{summary.totalUnits.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold">{toRupiah(summary.totalCost)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-semibold">{toRupiah(summary.revenue)}</span>
                </div>

                <div className="flex justify-between text-sm text-emerald-700">
                  <span className="font-semibold">Profit</span>
                  <span className="font-bold">
                    {toRupiah(summary.profit)} ({summary.marginPct.toFixed(1)}%)
                  </span>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  Profit dihitung dari (qty × unitPrice) - (qty × cost).
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
                <CardDescription>Simpan draft / update / posting.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={disableSubmit}>
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === "create" ? "Simpan Draft" : "Update"}
                    </>
                  )}
                </Button>

                {mode === "edit" && initialData?.id && (
                  <>
                    <Separator className="my-3" />

                    {canSetOngoing && (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={lockUI || isReadOnlyByStatus}
                          >
                            {isSetOngoing ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Set ONGOING
                              </>
                            )}
                          </Button>
                        }
                        title="Ubah status ke ONGOING?"
                        description="Sale akan ditandai ONGOING."
                        confirmText="Ya"
                        cancelText="Batal"
                        icon={<Info className="size-6" />}
                        isLoading={lockUI}
                        onConfirm={() => {
                          setActiveAction("set-ongoing");
                          updateStatus({ id: initialData.id, status: "ONGOING" });
                        }}
                      />
                    )}

                    {canSetFinished && (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            type="button"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={lockUI || isReadOnlyByStatus}
                          >
                            {isSetFinished ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Posting (FINISHED)
                              </>
                            )}
                          </Button>
                        }
                        variant="destructive"
                        title="Posting sale ini?"
                        description="Saat FINISHED, stok barang jadi berkurang dan movement SALE_OUT tercatat."
                        confirmText="Posting"
                        cancelText="Batal"
                        icon={<TriangleAlert className="size-6" />}
                        isLoading={lockUI}
                        onConfirm={() => {
                          setActiveAction("set-finished");
                          updateStatus({ id: initialData.id, status: "FINISHED" });
                        }}
                      />
                    )}

                    {canCancel && (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            type="button"
                            variant="destructive"
                            className="w-full"
                            disabled={lockUI || isReadOnlyByStatus}
                          >
                            {isSetCanceled ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </>
                            )}
                          </Button>
                        }
                        variant="destructive"
                        title="Batalkan sale ini?"
                        description="Status berubah menjadi CANCELED."
                        confirmText="Batalkan"
                        cancelText="Kembali"
                        icon={<TriangleAlert className="size-6" />}
                        isLoading={lockUI}
                        onConfirm={() => {
                          setActiveAction("set-canceled");
                          updateStatus({ id: initialData.id, status: "CANCELED" });
                        }}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
