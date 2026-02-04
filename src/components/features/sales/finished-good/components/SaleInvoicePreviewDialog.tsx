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
import { buildSaleFinishedGoodInvoiceHTML } from "../invoice/invoiceHtml";

type Props = {
  trigger: React.ReactNode;

  sale: {
    id: string;
    saleNo: string;
    invoiceNo: string; // sudah ada (atau hasil generate)
    soldAt: Date | string;
    status?: string | null;
    notes?: string | null;

    customer: {
      name: string;
      phone?: string | null;
      address?: string | null;
    };

    user: { name: string };

    items: Array<{
      id: string;
      name: string;
      qty: number;
      unitPrice: number;
      subtotal: number;
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

export function SaleInvoicePreviewDialog({ trigger, sale, summary }: Props) {
  const [open, setOpen] = React.useState(false);

  const handlePrint = () => {
    const html = buildSaleFinishedGoodInvoiceHTML({ sale, summary });

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
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-extrabold">INVOICE PENJUALAN</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Invoice No:{" "}
                  <span className="text-foreground font-semibold">
                    {sale.invoiceNo}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Sale No:{" "}
                  <span className="text-foreground font-semibold">
                    {sale.saleNo}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex rounded-full border px-3 py-1 text-xs">
                  {sale.status ? (
                    <>
                      Status:{" "}
                      <span className="ml-1 font-semibold">{sale.status}</span>
                    </>
                  ) : (
                    <>Invoice</>
                  )}
                </span>

                <div className="text-muted-foreground mt-2 text-sm">
                  Tanggal:{" "}
                  <span className="text-foreground font-semibold">
                    {formatDateID(sale.soldAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Customer</div>
                <div className="mt-1">{sale.customer.name}</div>

                <div className="text-muted-foreground mt-2 text-sm">
                  Phone:{" "}
                  <span className="text-foreground font-medium">
                    {sale.customer.phone ?? "-"}
                  </span>
                </div>

                <div className="text-muted-foreground mt-2 text-sm">
                  Address:{" "}
                  <span className="text-foreground font-medium">
                    {sale.customer.address ?? "-"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-semibold">Dibuat oleh</div>
                <div className="mt-1">{sale.user.name}</div>

                {sale.notes ? (
                  <div className="text-muted-foreground mt-2 text-sm">
                    Notes:{" "}
                    <span className="text-foreground font-medium">
                      {sale.notes}
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
                    {sale.items.map((it, idx) => (
                      <tr key={it.id} className="border-b last:border-b-0">
                        <td className="py-2">
                          <div className="font-medium">
                            {idx + 1}. {it.name}
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          {Number(it.qty).toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 text-right">{toRupiah(it.unitPrice)}</td>
                        <td className="py-2 text-right">{toRupiah(it.subtotal)}</td>
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
                      {summary.totalQty.toLocaleString("id-ID", {
                        maximumFractionDigits: 2,
                      })}
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
                  ({sale.user.name})
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
