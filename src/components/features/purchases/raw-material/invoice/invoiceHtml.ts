import { toRupiah } from "~/lib/utils";

function formatDateID(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function buildPurchaseRawMaterialInvoiceHTML(args: {
  purchase: any;
  summary: any;
}) {
  const { purchase, summary } = args;

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

  const rows = purchase.items
    .map((it: any, idx: number) => {
      const name = it.rawMaterial?.name ?? "Raw Material (deleted)";
      const qty = Number(it.qty as unknown as string).toLocaleString("id-ID");
      return `
        <tr>
          <td>
            <div style="font-weight:600;">${idx + 1}. ${escapeHtml(name)}</div>
          </td>
          <td class="right">${escapeHtml(qty)}</td>
          <td class="right">${escapeHtml(toRupiah(it.unitPrice))}</td>
          <td class="right">${escapeHtml(toRupiah(it.subtotal))}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div class="invoice-root">
      <style>${style}</style>

      <div class="row">
        <div>
          <p class="title">INVOICE PEMBELIAN (BAHAN BAKU)</p>
          <p class="muted" style="margin-top:6px;">
            Purchase No: <b>${escapeHtml(purchase.purchaseNo)}</b>
          </p>
        </div>

        <div style="text-align:right;">
          <span class="badge">Status: ${escapeHtml(purchase.status)}</span>
          <div class="muted" style="margin-top:8px; font-size:12px;">
            Tanggal: <b>${escapeHtml(formatDateID(purchase.purchasedAt))}</b>
          </div>
        </div>
      </div>

      <div class="row" style="margin-top:12px;">
        <div class="card" style="flex:1;">
          <div style="font-weight:700; margin-bottom:6px;">Supplier</div>
          <div>${escapeHtml(purchase.supplier.name)}</div>
          ${
            purchase.receivedNote
              ? `<div class="muted" style="margin-top:6px; font-size:12px;">Received note: ${escapeHtml(purchase.receivedNote)}</div>`
              : ""
          }
        </div>

        <div class="card" style="flex:1;">
          <div style="font-weight:700; margin-bottom:6px;">Dibuat oleh</div>
          <div>${escapeHtml(purchase.user.name)}</div>
          ${
            purchase.notes
              ? `<div class="muted" style="margin-top:6px; font-size:12px;">Notes: ${escapeHtml(purchase.notes)}</div>`
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
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div class="box">
            <div class="line">
              <span class="muted">Total Qty</span>
              <span><b>${escapeHtml(summary.totalQty.toLocaleString("id-ID"))}</b></span>
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

  return html;
}

function escapeHtml(input: any) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
