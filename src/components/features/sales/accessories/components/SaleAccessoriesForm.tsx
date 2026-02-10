"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import {
  cn,
  formatRupiah,
  generateRandomCode,
  parseRupiah,
  toNumber,
  toRupiah,
} from "~/lib/utils";

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
  Sparkles,
  Calculator,
  TrendingUp,
  FileText,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";
import type { SaleAccessoriesFull, SaleStatus } from "~/types/sale";
import { saleAccessoriesFormSchema } from "../forms/sale-accessories";
import { SaleInvoicePreviewDialog } from "../../finished-good/components/SaleInvoicePreviewDialog"; // adjust if needed
import { StockValidationAlert } from "../../components/StockValidationAlert";
import { computeSummaryAccessories, getStatusConfig } from "../../lib/utils";

// kalau komponen header/summary/actions kamu reusable, keep.
// kalau khusus FG, boleh ganti nanti.
import { SaleFinishedGoodHeader } from "../../finished-good/components/attributes/SaleFinishedGoodHeader";
import { SaleFinishedGoodSummarySection } from "../../finished-good/components/attributes/actions/SaleFinishedGoodSummarySection";
import { SaleFinishedGoodGeneratedInvoice } from "../../finished-good/components/attributes/SaleFinishedGoodGeneratedInvoice";
import type { ActionKey, LineAccessories } from "../../finished-good/types/forms";
import { SaleAccessoriesActionsSection } from "./attributes/actions/SaleAccessoriesActionsSection";

type SaleAccessoriesFormProps = {
  mode: "create" | "edit";
  initialData?: SaleAccessoriesFull | null;
};

export function SaleAccessoriesForm({
  mode,
  initialData,
}: SaleAccessoriesFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();
  const { data: customers } = trpc.customer.getAll.useQuery();
  const { data: accessories } = trpc.accessories.getAll.useQuery();

  const [openPicker, setOpenPicker] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<ActionKey>(null);

  const [barcode, setBarcode] = useState<string>("");
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const [invoiceNoPreview, setInvoiceNoPreview] = useState<string>("");

  const [stockAlert, setStockAlert] = useState<{
    open: boolean;
    productName: string;
    requestedQty: number;
    availableStock: number;
    lineIndex: number;
  } | null>(null);

  const validateStockQuantity = (
    requestedQty: number,
    availableStock: number,
    productName: string,
    lineIndex: number,
  ): boolean => {
    if (requestedQty > availableStock) {
      setStockAlert({
        open: true,
        productName,
        requestedQty,
        availableStock,
        lineIndex,
      });
      return false;
    }
    return true;
  };

  const invalidateCaches = async (saleId?: string) => {
    await Promise.all([
      utils.sale.getAccessoriesPaginated.invalidate(),
      utils.sale.getPaginated.invalidate?.(),
      ...(saleId
        ? [utils.sale.getByIdAccessories.invalidate({ id: saleId })]
        : []),
      utils.accessories.getAll.invalidate(),
    ]);
  };

  const computeSellingFromMargin = (cost: number, marginPct: number) => {
    const pct = Number.isFinite(marginPct) ? marginPct : 0;
    return cost * (1 + pct / 100);
  };

  const computeMarginFromPrices = (cost: number, selling: number) => {
    if (!cost) return 0;
    return ((selling - cost) / cost) * 100;
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
      items: [] as LineAccessories[],
    },
    // @ts-expect-error tanstack form
    validators: { onSubmit: saleAccessoriesFormSchema },
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
    trpc.sale.createAccessories.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Penjualan aksesoris dibuat (DRAFT).",
        });
        await invalidateCaches();
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
    trpc.sale.updateAccessories.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!!", {
          description: "Penjualan aksesoris diperbarui!",
        });
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
        toast.success("Berhasil!", {
          description: "Status penjualan berhasil diubah.",
        });
        await invalidateCaches(initialData?.id);
        setActiveAction(null);
        router.reload();
      },
      onError: (error) => {
        toast.error("Gagal ubah status", {
          description: error.message || "Tidak bisa mengubah status penjualan.",
        });
        setActiveAction(null);
      },
    });

  const { mutate: generateInvoicePreview, isPending: isGeneratingInvoice } =
    trpc.sale.generateInvoicePreview.useMutation({
      onSuccess: async (res) => {
        form.setFieldValue("invoiceNo", res.invoiceNo);
        setInvoiceNoPreview(res.invoiceNo);
        setInvoiceHtml(res.html);
        setInvoiceOpen(true);

        toast.success("Invoice dibuat", {
          description: `InvoiceNo: ${res.invoiceNo}`,
        });

        await invalidateCaches(initialData?.id);
      },
      onError: (err) => {
        toast.error("Gagal generate invoice", {
          description: err.message || "Terjadi kesalahan",
        });
      },
    });

  const handleGenerateInvoice = () => {
    if (mode !== "edit" || !initialData?.id) {
      toast.info("Simpan draft dulu", {
        description: "Invoice hanya bisa digenerate setelah sale tersimpan.",
      });
      return;
    }

    const currentInvoiceNo = String(form.state.values.invoiceNo ?? "").trim();
    generateInvoicePreview({
      saleId: initialData.id,
      invoiceNo: currentInvoiceNo || null,
      forceRegenerate: !currentInvoiceNo,
    });
  };

  useEffect(() => {
    if (user?.id) form.setFieldValue("userId", user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const currentStatus: SaleStatus | undefined = initialData?.status;

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

  const statusConfig = getStatusConfig(currentStatus);

  // hydrate base fields
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldValue("id", initialData.id);
      form.setFieldValue("saleNo", initialData.saleNo);
      form.setFieldValue("customerId", initialData.customerId);
      form.setFieldValue("orderNo", initialData.orderNo ?? "");
      form.setFieldValue("invoiceNo", initialData.invoiceNo ?? "");
      form.setFieldValue("notes", initialData.notes ?? "");

      form.setFieldValue(
        "items",
        (initialData.items ?? []).map((it: any) => {
          const qty =
            typeof it.qty === "string" ? toNumber(it.qty) : Number(it.qty ?? 0);
          const unitPrice =
            typeof it.unitPrice === "string"
              ? toNumber(it.unitPrice)
              : Number(it.unitPrice ?? 0);

          return {
            accessoryId: it.accessoryId,
            qty,
            unitPrice,
            costPrice: 0,
            marginPct: 0,
            lineTotal: qty * unitPrice,
          } satisfies LineAccessories;
        }),
      );
    } else if (mode === "create") {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id]);

  // hydrate display/cost/stock from accessories list
  useEffect(() => {
    if (mode !== "edit" || !initialData?.id) return;
    if (!accessories || accessories.length === 0) return;

    const nextItems: LineAccessories[] = (initialData.items ?? []).map(
      (it: any) => {
        const qty =
          typeof it.qty === "string" ? toNumber(it.qty) : Number(it.qty ?? 0);
        const unitPrice =
          typeof it.unitPrice === "string"
            ? toNumber(it.unitPrice)
            : Number(it.unitPrice ?? 0);

        const acc = (accessories ?? []).find(
          (a: any) => a.id === it.accessoryId,
        );

        const costPrice = Number(acc?.supplierPrice ?? 0);
        const stock = Number(acc?.qty ?? 0);
        const marginPct = costPrice
          ? computeMarginFromPrices(costPrice, unitPrice)
          : 0;

        return {
          accessoryId: it.accessoryId,
          name: acc?.name,
          stock,
          costPrice,
          sellingPrice: Number(acc?.sellingPrice ?? 0),
          qty,
          unitPrice,
          marginPct: Number.isFinite(marginPct) ? marginPct : 0,
          lineTotal: qty * unitPrice,
        };
      },
    );

    form.setFieldValue("items", nextItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id, accessories?.length]);

  const addAccessory = (accessoryId: string) => {
    if (disableFormInputs) return;

    const lines = form.state.values.items ?? [];

    if (lines.some((x) => x.accessoryId === accessoryId)) {
      toast.info("Sudah ada di cart, qty ditambah 1");
      const next = lines.map((x) => {
        if (x.accessoryId !== accessoryId) return x;
        const nextQty = toNumber(x.qty) + 1;
        const unit = toNumber(x.unitPrice);
        return { ...x, qty: nextQty, lineTotal: nextQty * unit };
      });
      form.setFieldValue("items", next);
      return;
    }

    const acc = (accessories ?? []).find((a: any) => a.id === accessoryId);
    if (!acc) {
      toast.error("Aksesoris tidak ditemukan di list");
      return;
    }

    const costPrice = Number(acc.supplierPrice ?? 0);
    const defaultSelling = Number(acc.sellingPrice ?? 0);
    const stock = Number(acc.qty ?? 0);

    const qty = 1;
    const unitPrice = defaultSelling || 0;

    const marginPct = costPrice
      ? computeMarginFromPrices(costPrice, unitPrice)
      : 0;

    form.setFieldValue("items", [
      ...lines,
      {
        accessoryId,
        name: acc.name,
        stock,
        costPrice,
        sellingPrice: defaultSelling,
        marginPct: Number.isFinite(marginPct) ? marginPct : 0,
        qty,
        unitPrice,
        lineTotal: qty * unitPrice,
      },
    ]);

    setOpenPicker(false);
  };

  // "lookup" by name contains (quick add first match)
  const lookupQuick = async () => {
    const q = barcode.trim().toLowerCase();
    if (!q) return;

    setIsLookingUp(true);
    try {
      const found = (accessories ?? []).find((a: any) =>
        String(a?.name ?? "")
          .toLowerCase()
          .includes(q),
      );

      if (!found) {
        toast.error("Tidak ditemukan", { description: "Coba kata lain." });
        return;
      }

      addAccessory(found.id);
      setBarcode("");
    } finally {
      setIsLookingUp(false);
    }
  };

  const accessoriesInStock = useMemo(() => {
    return (accessories ?? []).filter((a: any) => Number(a?.qty ?? 0) > 0);
  }, [accessories]);

  return (
    <div className="container space-y-6 pb-8">
      <SaleFinishedGoodGeneratedInvoice
        form={form as any}
        invoiceHtml={invoiceHtml}
        invoiceOpen={invoiceOpen}
        invoiceNoPreview={invoiceNoPreview}
        setInvoiceOpen={setInvoiceOpen}
      />

      <StockValidationAlert
        open={stockAlert?.open ?? false}
        onOpenChange={(open) => {
          if (!open) setStockAlert(null);
        }}
        productName={stockAlert?.productName ?? ""}
        requestedQty={stockAlert?.requestedQty ?? 0}
        availableStock={stockAlert?.availableStock ?? 0}
        onConfirm={() => {
          if (stockAlert) {
            const lines = form.state.values.items ?? [];
            const idx = stockAlert.lineIndex;
            const line = lines[idx];

            if (line) {
              const unitPriceNum = Math.max(0, toNumber(line.unitPrice));
              const adjustedQty = stockAlert.availableStock;
              const nextSubtotal = adjustedQty * unitPriceNum;

              const nextLines = lines.map((it, i) =>
                i === idx
                  ? { ...it, qty: adjustedQty, lineTotal: nextSubtotal }
                  : it,
              );

              form.setFieldValue("items", nextLines);
            }
          }
          setStockAlert(null);
        }}
      />

      {statusConfig && (
        <SaleFinishedGoodHeader statusConfig={statusConfig} mode={mode} />
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Informasi Penjualan */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Informasi Penjualan</CardTitle>
                    <CardDescription>
                      Detail transaksi penjualan aksesoris
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <FieldGroup>
                  <form.Field name="saleNo">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            Nomor Penjualan <IsRequired />
                          </FieldLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="SA0001"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              disabled={mode === "edit" || disableFormInputs}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                field.handleChange(generateRandomCode("SA"))
                              }
                              disabled={mode === "edit" || disableFormInputs}
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="customerId">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>
                            Customer <IsRequired />
                          </FieldLabel>

                          <Select
                            key={field.state.value}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            disabled={disableFormInputs}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {(customers ?? []).map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="text-muted-foreground h-4 w-4" />
                                    {c.name}
                                  </div>
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
                          <div className="flex gap-2">
                            <Input
                              placeholder="INV-202602-XXXXXX"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              disabled={disableFormInputs}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleGenerateInvoice}
                              disabled={
                                disableFormInputs || isGeneratingInvoice
                              }
                            >
                              {isGeneratingInvoice ? (
                                <>
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Generate
                                </>
                              )}
                            </Button>

                            <SaleInvoicePreviewDialog
                              trigger={
                                <Button type="button" variant="outline">
                                  Preview Invoice
                                </Button>
                              }
                              sale={{
                                id: initialData?.id ?? "TEMP",
                                saleNo: form.state.values.saleNo,
                                invoiceNo:
                                  form.state.values.invoiceNo || "INV-TEMP",
                                soldAt: new Date(),
                                status: initialData?.status ?? "DRAFT",
                                notes: form.state.values.notes || null,
                                customer: {
                                  name:
                                    customers?.find(
                                      (c) =>
                                        c.id === form.state.values.customerId,
                                    )?.name ?? "-",
                                  phone: null,
                                  address: null,
                                },
                                user: { name: user?.name ?? "-" },
                                items: (form.state.values.items ?? []).map(
                                  (l, idx) => {
                                    const acc = accessories?.find(
                                      (a: any) => a.id === l.accessoryId,
                                    );
                                    return {
                                      id: `${l.accessoryId}-${idx}`,
                                      name: acc?.name ?? l.name ?? "Aksesoris",
                                      qty: toNumber(l.qty),
                                      unitPrice: toNumber(l.unitPrice),
                                      subtotal:
                                        toNumber(l.qty) * toNumber(l.unitPrice),
                                    };
                                  },
                                ),
                              }}
                              summary={{
                                totalQty: (
                                  form.state.values.items ?? []
                                ).reduce((a, b) => a + toNumber(b.qty), 0),
                                totalAmount: (
                                  form.state.values.items ?? []
                                ).reduce(
                                  (a, b) =>
                                    a + toNumber(b.qty) * toNumber(b.unitPrice),
                                  0,
                                ),
                              }}
                            />
                          </div>
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

            {/* Cart Accessories */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Cart Aksesoris</CardTitle>
                    <CardDescription>
                      Tambah item via picker atau cari cepat
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Cari cepat (nama aksesoris)..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={disableFormInputs}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        lookupQuick();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={lookupQuick}
                    disabled={disableFormInputs || isLookingUp}
                  >
                    {isLookingUp ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Cari
                      </>
                    )}
                  </Button>
                </div>

                <form.Field name="items">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const lines = (field.state.value ??
                      []);

                    const updateLine = (
                      idx: number,
                      patch: Partial<LineAccessories>,
                    ) => {
                      if (disableFormInputs) return;
                      const next = lines.map((it, i) =>
                        i === idx ? { ...it, ...patch } : it,
                      );
                      field.handleChange(next);
                    };

                    return (
                      <Field data-invalid={isInvalid} className="space-y-4">
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
                                : "Tambah aksesoris ke cart"}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-130 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Cari aksesoris..." />
                              <CommandList>
                                <CommandEmpty>
                                  Tidak ada aksesoris.
                                </CommandEmpty>
                                <CommandGroup>
                                  {accessoriesInStock.map((acc: any) => {
                                    const selected = lines.some(
                                      (i) => i.accessoryId === acc.id,
                                    );
                                    return (
                                      <CommandItem
                                        key={acc.id}
                                        value={`${acc.name ?? ""}`}
                                        onSelect={() => addAccessory(acc.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selected
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex-1">
                                          <div className="font-medium">
                                            {acc.name}
                                          </div>
                                          <div className="text-muted-foreground text-xs">
                                            Stock:{" "}
                                            {Number(acc.qty ?? 0).toFixed(2)} •
                                            Cost:{" "}
                                            {toRupiah(
                                              Number(acc.supplierPrice ?? 0),
                                            )}{" "}
                                            • Default sell:{" "}
                                            {toRupiah(
                                              Number(acc.sellingPrice ?? 0),
                                            )}
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

                        {lines.length > 0 && (
                          <div className="space-y-3">
                            {lines.map((line, idx) => {
                              const acc = (accessories ?? []).find(
                                (a: any) => a.id === line.accessoryId,
                              );

                              const qtyNum = Math.max(0, toNumber(line.qty));
                              const unitPriceNum = Math.max(
                                0,
                                toNumber(line.unitPrice),
                              );
                              const cost = Math.max(
                                0,
                                Number(line.costPrice ?? 0),
                              );

                              const subtotal = qtyNum * unitPriceNum;
                              const costTotal = qtyNum * cost;
                              const profit = subtotal - costTotal;
                              const profitPct = costTotal
                                ? (profit / costTotal) * 100
                                : 0;

                              const availableStock = Number(
                                line.stock ?? acc?.qty ?? 0,
                              );

                              return (
                                <Card
                                  key={line.accessoryId}
                                  className="overflow-hidden"
                                >
                                  <CardContent className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                          <Package className="h-5 w-5 text-emerald-600" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold">
                                            {line.name ??
                                              acc?.name ??
                                              "Unknown"}
                                          </h4>

                                          <div className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
                                            <span className="font-medium text-emerald-600">
                                              Stock:{" "}
                                              {Number(availableStock).toFixed(
                                                2,
                                              )}
                                            </span>
                                          </div>

                                          <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge className="bg-amber-100 text-amber-700">
                                              <Calculator className="mr-1 h-3.5 w-3.5" />
                                              Cost: {toRupiah(cost)}
                                            </Badge>

                                            <Badge className="bg-emerald-100 text-emerald-700">
                                              <TrendingUp className="mr-1 h-3.5 w-3.5" />
                                              Profit: {toRupiah(profit)} (
                                              {profitPct.toFixed(1)}%)
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <ConfirmActionDialog
                                        trigger={
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="hover:bg-destructive hover:text-destructive-foreground shrink-0"
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
                                        icon={
                                          <TriangleAlert className="size-6" />
                                        }
                                        isLoading={disableFormInputs}
                                        onConfirm={() => {
                                          if (disableFormInputs) return;
                                          field.handleChange(
                                            lines.filter(
                                              (x) =>
                                                x.accessoryId !==
                                                line.accessoryId,
                                            ),
                                          );
                                        }}
                                      />
                                    </div>

                                    <Separator />

                                    <div className="grid gap-3 sm:grid-cols-4">
                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">
                                          Qty
                                        </FieldLabel>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          min={0}
                                          value={line.qty ?? ""}
                                          onChange={(e) => {
                                            const nextQty = Math.max(
                                              0,
                                              Number(e.target.value || 0),
                                            );

                                            if (nextQty > availableStock) {
                                              validateStockQuantity(
                                                nextQty,
                                                availableStock,
                                                line.name ??
                                                  acc?.name ??
                                                  "Unknown",
                                                idx,
                                              );
                                              return;
                                            }

                                            updateLine(idx, {
                                              qty: nextQty,
                                              lineTotal: nextQty * unitPriceNum,
                                            });
                                          }}
                                          disabled={disableFormInputs}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">
                                          Margin %
                                        </FieldLabel>
                                        <Input
                                          type="number"
                                          value={String(line.marginPct ?? 0)}
                                          onChange={(e) => {
                                            const m = Number(
                                              e.target.value || 0,
                                            );

                                            if (!cost) {
                                              updateLine(idx, { marginPct: m });
                                              return;
                                            }

                                            const selling =
                                              computeSellingFromMargin(cost, m);
                                            updateLine(idx, {
                                              marginPct: m,
                                              unitPrice: selling,
                                              lineTotal: qtyNum * selling,
                                            });
                                          }}
                                          disabled={disableFormInputs}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">
                                          Harga / Unit
                                        </FieldLabel>
                                        <Input
                                          inputMode="numeric"
                                          value={formatRupiah(line.unitPrice)}
                                          onChange={(e) => {
                                            const selling = Math.max(
                                              0,
                                              parseRupiah(e.target.value),
                                            );
                                            const m = cost
                                              ? computeMarginFromPrices(
                                                  cost,
                                                  selling,
                                                )
                                              : 0;

                                            updateLine(idx, {
                                              unitPrice: selling,
                                              marginPct: Number.isFinite(m)
                                                ? m
                                                : 0,
                                              lineTotal: qtyNum * selling,
                                            });
                                          }}
                                          onFocus={(e) => {
                                            if (
                                              !e.target.value.startsWith("Rp")
                                            ) {
                                              e.target.value =
                                                "Rp" + e.target.value;
                                            }
                                          }}
                                          disabled={disableFormInputs}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <FieldLabel className="text-xs">
                                          Jumlah Harga
                                        </FieldLabel>
                                        <Input
                                          inputMode="numeric"
                                          value={formatRupiah(
                                            line.lineTotal ?? subtotal,
                                          )}
                                          onChange={(e) => {
                                            const total = Math.max(
                                              0,
                                              parseRupiah(e.target.value),
                                            );
                                            const qtySafe = Math.max(
                                              1,
                                              qtyNum || 1,
                                            );
                                            const unit = total / qtySafe;
                                            const m = cost
                                              ? computeMarginFromPrices(
                                                  cost,
                                                  unit,
                                                )
                                              : 0;

                                            updateLine(idx, {
                                              lineTotal: total,
                                              unitPrice: unit,
                                              marginPct: Number.isFinite(m)
                                                ? m
                                                : 0,
                                            });
                                          }}
                                          onFocus={(e) => {
                                            if (
                                              !e.target.value.startsWith("Rp")
                                            ) {
                                              e.target.value =
                                                "Rp" + e.target.value;
                                            }
                                          }}
                                          disabled={disableFormInputs}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">
                                          Subtotal
                                        </FieldLabel>
                                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm font-semibold">
                                          {toRupiah(subtotal)}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">
                                          Total Cost
                                        </FieldLabel>
                                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm font-semibold">
                                          {toRupiah(costTotal)}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <FieldLabel className="text-xs">
                                          Profit
                                        </FieldLabel>
                                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm font-semibold">
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

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <form.Subscribe selector={(s) => s.values.items}>
                {(items) => {
                  const summary = computeSummaryAccessories(items);
                  return <SaleFinishedGoodSummarySection summary={summary} />;
                }}
              </form.Subscribe>

              <SaleAccessoriesActionsSection
                mode={mode}
                initialData={initialData}
                canCancel={canCancel}
                lockUI={lockUI}
                canSetFinished={canSetFinished}
                canSetOngoing={canSetOngoing}
                disableSubmit={disableSubmit}
                isReadOnlyByStatus={isReadOnlyByStatus}
                isSetCanceled={isSetCanceled}
                isSetFinished={isSetFinished}
                isSetOngoing={isSetOngoing}
                isSubmitting={isSubmitting}
                updateStatus={updateStatus}
                setActiveAction={setActiveAction}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
