import { escapeHtml, formatDateID, toRupiah } from "~/lib/utils";

export function buildSaleFinishedGoodInvoiceHTML(args: {
  sale: {
    invoiceNo: string;
    saleNo: string;
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
}) {
  const { sale, summary } = args;

  const style = `
    @page { size: A4; margin: 12mm; }
    @media print { .no-print { display: none !important; } }
    .invoice-root { font-family: ui-sans-serif, system-ui; color: #111; }
    .row { display: flex; justify-content: space-between; gap: 16px; }
    .muted { color: #555; }
    .title { font-size: 18px; font-weight: 800; margin: 0; }
    .badge { display:inline-block; padding: 4px 10px; border:1px solid #ddd; border-radius: 999px; font-size: 12px; }
    .card { border: 1px solid #e5e5e5; border-radius: 12px; padding: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border-bottom: 1px solid #eee; padding: 10px 6px; text-align: left; font-size: 12px; vertical-align: top; }
    th { font-weight: 700; }
    .right { text-align: right; }
    .totals { margin-top: 12px; display:flex; justify-content:flex-end; }
    .totals .box { min-width: 280px; }
    .totals .line { display:flex; justify-content:space-between; padding: 6px 0; font-size: 12px; }
    .totals .grand { font-weight: 800; font-size: 14px; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 8px; }
    .foot { margin-top: 18px; font-size: 11px; color:#666; }
  `;

  const rows = (sale.items ?? [])
    .map((it, idx) => {
      const qty = Number(it.qty || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      });
      return `
        <tr>
          <td>
            <div style="font-weight:600;">${idx + 1}. ${escapeHtml(it.name)}</div>
          </td>
          <td class="right">${escapeHtml(qty)}</td>
          <td class="right">${escapeHtml(toRupiah(it.unitPrice))}</td>
          <td class="right">${escapeHtml(toRupiah(it.subtotal))}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="invoice-root">
      <style>${style}</style>

      <div class="row">
        <div>
          <p class="title">INVOICE PENJUALAN</p>
          <p class="muted" style="margin-top:6px;">
            Invoice No: <b>${escapeHtml(sale.invoiceNo)}</b>
          </p>
          <p class="muted" style="margin-top:4px;">
            Sale No: <b>${escapeHtml(sale.saleNo)}</b>
          </p>
        </div>

        <div style="text-align:right;">
          ${
            sale.status
              ? `<span class="badge">Status: ${escapeHtml(sale.status)}</span>`
              : `<span class="badge">Invoice</span>`
          }
          <div class="muted" style="margin-top:8px; font-size:12px;">
            Tanggal: <b>${escapeHtml(formatDateID(sale.soldAt))}</b>
          </div>
        </div>
      </div>

      <div class="row" style="margin-top:12px;">
        <div class="card" style="flex:1;">
          <div style="font-weight:700; margin-bottom:6px;">Customer</div>
          <div>${escapeHtml(sale.customer.name)}</div>
          ${
            sale.customer.phone
              ? `<div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(sale.customer.phone)}</div>`
              : ""
          }
          ${
            sale.customer.address
              ? `<div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(sale.customer.address)}</div>`
              : ""
          }
        </div>

        <div class="card" style="flex:1;">
          <div style="font-weight:700; margin-bottom:6px;">Dibuat oleh</div>
          <div>${escapeHtml(sale.user.name)}</div>
          ${
            sale.notes
              ? `<div class="muted" style="margin-top:6px; font-size:12px;">Notes: ${escapeHtml(sale.notes)}</div>`
              : ""
          }
        </div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div style="font-weight:700;">Daftar Item</div>

        <table>
          <thead>
            <tr>
              <th style="width:44%;">Item</th>
              <th class="right" style="width:14%;">Qty</th>
              <th class="right" style="width:21%;">Harga Satuan</th>
              <th class="right" style="width:21%;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="4" class="muted">Tidak ada item</td></tr>`}
          </tbody>
        </table>

        <div class="totals">
          <div class="box">
            <div class="line">
              <span class="muted">Total Qty</span>
              <span><b>${escapeHtml(
                summary.totalQty.toLocaleString("id-ID", {
                  maximumFractionDigits: 2,
                }),
              )}</b></span>
            </div>
            <div class="line grand">
              <span>Total Amount</span>
              <span>${escapeHtml(toRupiah(summary.totalAmount))}</span>
            </div>
          </div>
        </div>

        <div class="foot">
          Dicetak pada: ${escapeHtml(formatDateID(new Date()))}
        </div>
      </div>
    </div>
  `;
}
