"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Printer, X } from "lucide-react";
import { toRupiah } from "~/lib/utils";
import type { PurchaseStatus } from "~/components/features/purchases/config/purchase";
import { buildPurchaseRawMaterialInvoiceHTML } from "./invoiceHtml";

type Props = {
  trigger: React.ReactNode;
  purchase: {
    id: string;
    purchaseNo: string;
    purchasedAt: Date | string;
    status: PurchaseStatus | string;
    receivedNote?: string | null;
    notes?: string | null;
    supplier: { name: string };
    user: { name: string };
    items: Array<{
      id: string;
      qty: unknown;
      unitPrice: number;
      subtotal: number;
      rawMaterial?: { name: string } | null;
    }>;
  };
  summary: {
    totalQty: number;
    totalAmount: number;
  };
};

function formatDateID(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function InvoicePreviewDialog({ trigger, purchase, summary }: Props) {
  const [open, setOpen] = React.useState(false);

  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const html = buildPurchaseRawMaterialInvoiceHTML({ purchase, summary });

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(
      `<!doctype html><html><head><meta charset="utf-8" /></head><body>${html}</body></html>`,
    );
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      const cleanup = () => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
      setTimeout(cleanup, 3000);
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-4xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="text-base">Preview Invoice</DialogTitle>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="reversedGhost" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogHeader>

        <div className="bg-background max-h-[75vh] overflow-auto rounded-xl border p-4">
          <div ref={invoiceRef} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-extrabold">
                  INVOICE PEMBELIAN (BAHAN BAKU)
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Purchase No:{" "}
                  <span className="text-foreground font-semibold">
                    {purchase.purchaseNo}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex rounded-full border px-3 py-1 text-xs">
                  Status:{" "}
                  <span className="ml-1 font-semibold">{purchase.status}</span>
                </span>
                <div className="text-muted-foreground mt-2 text-sm">
                  Tanggal:{" "}
                  <span className="text-foreground font-semibold">
                    {formatDateID(purchase.purchasedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Supplier</div>
                <div className="mt-1">{purchase.supplier.name}</div>
                <div className="text-muted-foreground mt-2 text-sm">
                  Received note:{" "}
                  <span className="text-foreground font-medium">
                    {purchase.receivedNote ?? "-"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-semibold">Dibuat oleh</div>
                <div className="mt-1">{purchase.user.name}</div>
                {purchase.notes ? (
                  <div className="text-muted-foreground mt-2 text-sm">
                    Notes:{" "}
                    <span className="text-foreground font-medium">
                      {purchase.notes}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="font-semibold">Daftar Item</div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Harga Satuan</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((it, idx) => (
                      <tr key={it.id} className="border-b last:border-b-0">
                        <td className="py-2">
                          <div className="font-medium">
                            {idx + 1}.{" "}
                            {it.rawMaterial?.name ?? "Raw Material (deleted)"}
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          {Number(it.qty as string).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 text-right">
                          {toRupiah(it.unitPrice)}
                        </td>
                        <td className="py-2 text-right">
                          {toRupiah(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Qty</span>
                    <span className="font-semibold">
                      {summary.totalQty.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-sm font-extrabold">
                      {toRupiah(summary.totalAmount)}
                    </span>
                  </div>
                  <div className="text-muted-foreground pt-2 text-xs">
                    Dicetak pada: {formatDateID(new Date())}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2 text-sm">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Dibuat oleh</div>
                <div className="text-muted-foreground mt-10">
                  ({purchase.user.name})
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Diterima oleh</div>
                <div className="text-muted-foreground mt-10">
                  (....................)
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
