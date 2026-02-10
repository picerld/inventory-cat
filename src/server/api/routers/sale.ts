import z from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { saleFinishedGoodFormSchema } from "~/components/features/sales/finished-good/form/sale-finished-good";
import { escapeHtml, formatDateID, toNumber, toRupiah } from "~/lib/utils";
import { generateInvoiceNo } from "~/components/features/sales/lib/utils";
import { saleAccessoriesFormSchema } from "~/components/features/sales/accessories/forms/sale-accessories";

const saleStatusEnum = z.enum(["DRAFT", "ONGOING", "FINISHED", "CANCELED"]);
type SaleStatus = z.infer<typeof saleStatusEnum>;

export function renderInvoiceHtml(payload: {
  invoiceNo: string;
  saleNo: string;
  soldAt: Date;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  items: Array<{
    name: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
  notes?: string | null;
}) {
  const totalQty = payload.items.reduce((a, b) => a + (Number(b.qty) || 0), 0);
  const totalAmount = payload.items.reduce(
    (a, b) => a + (Number(b.subtotal) || 0),
    0,
  );

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

  const rows = payload.items
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

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.invoiceNo)}</title>
</head>

<body>
  <div class="invoice-root">
    <style>${style}</style>

    <div class="row">
      <div>
        <p class="title">INVOICE PENJUALAN</p>
        <p class="muted" style="margin-top:6px;">
          Invoice No: <b>${escapeHtml(payload.invoiceNo)}</b>
        </p>
        <p class="muted" style="margin-top:4px;">
          Sale No: <b>${escapeHtml(payload.saleNo)}</b>
        </p>
      </div>

      <div style="text-align:right;">
        <span class="badge">Tanggal: ${escapeHtml(formatDateID(payload.soldAt))}</span>
        <div class="muted" style="margin-top:8px; font-size:12px;">
          Dicetak: <b>${escapeHtml(formatDateID(new Date()))}</b>
        </div>
      </div>
    </div>

    <div class="row" style="margin-top:12px;">
      <div class="card" style="flex:1;">
        <div style="font-weight:700; margin-bottom:6px;">Customer</div>
        <div><b>${escapeHtml(payload.customerName)}</b></div>
        ${
          payload.customerPhone
            ? `<div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(payload.customerPhone)}</div>`
            : ""
        }
        ${
          payload.customerAddress
            ? `<div class="muted" style="margin-top:6px; font-size:12px;">${escapeHtml(payload.customerAddress)}</div>`
            : ""
        }
      </div>

      ${
        payload.notes
          ? `
            <div class="card" style="flex:1;">
              <div style="font-weight:700; margin-bottom:6px;">Catatan</div>
              <div class="muted" style="font-size:12px; white-space:pre-wrap;">${escapeHtml(payload.notes)}</div>
            </div>
          `
          : `
            <div class="card" style="flex:1;">
              <div style="font-weight:700; margin-bottom:6px;">Keterangan</div>
              <div class="muted" style="font-size:12px;">-</div>
            </div>
          `
      }
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
            <span><b>${escapeHtml(totalQty.toLocaleString("id-ID", { maximumFractionDigits: 2 }))}</b></span>
          </div>
          <div class="line grand">
            <span>Total Amount</span>
            <span>${escapeHtml(toRupiah(totalAmount))}</span>
          </div>
        </div>
      </div>

      <div class="foot">
        Dokumen ini di-generate oleh sistem.
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

export const saleRouter = createTRPCRouter({
  generateInvoicePreview: protectedProcedure
    .input(
      z.object({
        saleId: z.string(),
        invoiceNo: z.string().optional().nullable(),
        forceRegenerate: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.saleId },
        include: {
          customer: true,
          items: {
            include: {
              finishedGood: true,
              accessory: true,
            },
          },
        },
      });

      if (!sale) throw new Error("Sale not found");

      let nextInvoiceNo =
        (input.invoiceNo ?? "").trim() || (sale.invoiceNo ?? "").trim();

      const shouldGenerate = input.forceRegenerate === true || !nextInvoiceNo;

      if (shouldGenerate) {
        for (let i = 0; i < 5; i++) {
          const candidate = generateInvoiceNo();
          const exists = await ctx.db.sale.findFirst({
            where: { invoiceNo: candidate },
            select: { id: true },
          });
          if (!exists) {
            nextInvoiceNo = candidate;
            break;
          }
        }
        if (!nextInvoiceNo) throw new Error("Failed to generate invoiceNo");
      }

      await ctx.db.sale.update({
        where: { id: sale.id },
        data: { invoiceNo: nextInvoiceNo },
      });

      const items = (sale.items ?? []).map((it) => {
        const name = it.finishedGood?.name ?? it.accessory?.name ?? "Item";

        const qty = Number(it.qty ?? 0);
        const unitPrice = Number(it.unitPrice ?? 0);
        const subtotal = qty * unitPrice;

        return { name, qty, unitPrice, subtotal };
      });

      const html = renderInvoiceHtml({
        invoiceNo: nextInvoiceNo,
        saleNo: sale.saleNo,
        soldAt: sale.soldAt,
        customerName: sale.customer?.name ?? "-",
        customerPhone: sale.customer?.phone ?? null,
        customerAddress: sale.customer?.address ?? null,
        items,
        notes: sale.notes ?? null,
      });

      return { invoiceNo: nextInvoiceNo, html };
    }),

  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
        status: saleStatusEnum.optional(),
        customerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, customerId } = input;

      const where: Prisma.SaleWhereInput = {
        ...(search
          ? {
              OR: [
                { saleNo: { contains: search, mode: "insensitive" } },
                { orderNo: { contains: search, mode: "insensitive" } },
                { invoiceNo: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  customer: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
      };

      const totalItems = await ctx.db.sale.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.sale.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              finishedGood: { include: { paintGrade: true } },
              accessory: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getFinishedGoodPaginated: protectedProcedure
    .input(
      z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(50).default(10),
        search: z.string().optional().default(""),
        status: saleStatusEnum.optional(),
        customerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, customerId } = input;

      const where: Prisma.SaleWhereInput = {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(search
          ? {
              OR: [
                { saleNo: { contains: search, mode: "insensitive" } },
                { orderNo: { contains: search, mode: "insensitive" } },
                { invoiceNo: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  customer: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        items: { some: { itemType: "FINISHED_GOOD" } },
      };

      const totalItems = await ctx.db.sale.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.sale.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { soldAt: "desc" },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "FINISHED_GOOD" },
            include: {
              finishedGood: { include: { paintGrade: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      const mapped = data.map((s) => {
        const totalAmount = s.items.reduce(
          (sum, it) => sum + (it.subtotal ?? 0),
          0,
        );
        const totalQty = s.items.reduce((sum, it) => sum + Number(it.qty), 0);
        const totalItemsLine = s.items.length;

        return { ...s, summary: { totalAmount, totalQty, totalItemsLine } };
      });

      return {
        data: mapped,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getAccessoriesPaginated: protectedProcedure
    .input(
      z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(50).default(10),
        search: z.string().optional().default(""),
        status: saleStatusEnum.optional(),
        customerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search, status, customerId } = input;

      const where: Prisma.SaleWhereInput = {
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(search
          ? {
              OR: [
                { saleNo: { contains: search, mode: "insensitive" } },
                { orderNo: { contains: search, mode: "insensitive" } },
                { invoiceNo: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                {
                  customer: { name: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
        items: { some: { itemType: "PAINT_ACCESSORIES" } },
      };

      const totalItems = await ctx.db.sale.count({ where });
      const lastPage = Math.ceil(totalItems / perPage);

      const data = await ctx.db.sale.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { soldAt: "desc" },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "PAINT_ACCESSORIES" },
            include: { accessory: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return {
        data,
        meta: { currentPage: page, lastPage, perPage, totalItems },
      };
    }),

  getByIdFinishedGood: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "FINISHED_GOOD" },
            include: {
              finishedGood: { include: { paintGrade: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (sale.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale ini bukan penjualan barang jadi (FINISHED_GOOD).",
        });
      }

      const totalAmount = sale.items.reduce(
        (sum, it) => sum + (it.subtotal ?? 0),
        0,
      );
      const totalQty = sale.items.reduce((sum, it) => sum + Number(it.qty), 0);

      return { sale, summary: { totalAmount, totalQty } };
    }),

  getByIdAccessories: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          user: true,
          items: {
            where: { itemType: "PAINT_ACCESSORIES" },
            include: { accessory: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (sale.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale ini bukan penjualan aksesoris (PAINT_ACCESSORIES).",
        });
      }

      const totalAmount = sale.items.reduce(
        (sum, it) => sum + (it.subtotal ?? 0),
        0,
      );
      const totalQty = sale.items.reduce((sum, it) => sum + Number(it.qty), 0);

      return { sale, summary: { totalAmount, totalQty } };
    }),

  createFinishedGood: protectedProcedure
    .input(saleFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      const exists = await ctx.db.sale.findUnique({
        where: { saleNo: input.saleNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor penjualan sudah digunakan.",
        });
      }

      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      const finishedGoodIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: finishedGoodIds } },
        select: { id: true },
      });
      if (fgs.length !== finishedGoodIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.sale.create({
        data: {
          saleNo: input.saleNo,
          customerId: input.customerId,
          orderNo: input.orderNo ?? null,
          invoiceNo: input.invoiceNo ?? null,
          notes: input.notes ?? null,
          status: "DRAFT",
          userId,
          items: {
            create: input.items.map((it) => {
              const qty = toNumber(it.qty);
              const unitPrice = toNumber(it.unitPrice);
              return {
                itemType: "FINISHED_GOOD",
                finishedGoodId: it.finishedGoodId,
                accessoryId: null,
                qty,
                unitPrice,
                subtotal: qty * unitPrice,
              };
            }),
          },
        },
        include: { customer: true, user: true, items: true },
      });
    }),

  createAccessories: protectedProcedure
    .input(saleAccessoriesFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";

      const exists = await ctx.db.sale.findUnique({
        where: { saleNo: input.saleNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor penjualan sudah digunakan.",
        });
      }

      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      return ctx.db.sale.create({
        data: {
          saleNo: input.saleNo,
          customerId: input.customerId,
          orderNo: input.orderNo ?? null,
          invoiceNo: input.invoiceNo ?? null,
          notes: input.notes ?? null,
          status: "DRAFT",
          userId,
          items: {
            create: input.items.map((it) => {
              const qty = toNumber(it.qty);
              const unitPrice = toNumber(it.unitPrice);
              return {
                itemType: "PAINT_ACCESSORIES",
                finishedGoodId: null,
                accessoryId: it.accessoryId,
                qty,
                unitPrice,
                subtotal: qty * unitPrice,
              };
            }),
          },
        },
        include: { customer: true, user: true, items: true },
      });
    }),

  updateFinishedGood: protectedProcedure
    .input(saleFinishedGoodFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID sale wajib." });
      }

      const existing = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { id: true, status: true, invoiceNo: true },
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya sale DRAFT yang boleh diedit.",
        });
      }

      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo, NOT: { id: input.id } },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      const finishedGoodIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: finishedGoodIds } },
        select: { id: true },
      });
      if (fgs.length !== finishedGoodIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.saleItem.deleteMany({ where: { saleId: input.id! } });

        return tx.sale.update({
          where: { id: input.id! },
          data: {
            customerId: input.customerId,
            orderNo: input.orderNo ?? null,
            invoiceNo: input.invoiceNo ?? null,
            notes: input.notes ?? null,
            items: {
              create: input.items.map((it) => {
                const qty = toNumber(it.qty);
                const unitPrice = toNumber(it.unitPrice);
                return {
                  itemType: "FINISHED_GOOD",
                  finishedGoodId: it.finishedGoodId,
                  accessoryId: null,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: {
            customer: true,
            user: true,
            items: { include: { finishedGood: true } },
          },
        });
      });
    }),

  updateAccessories: protectedProcedure
    .input(saleAccessoriesFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID sale wajib." });
      }

      const existing = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { id: true, status: true, invoiceNo: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya sale DRAFT yang boleh diedit.",
        });
      }

      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo, NOT: { id: input.id } },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      const accessoryIds = input.items.map((i) => i.accessoryId);
      const accs = await ctx.db.paintAccessories.findMany({
        where: { id: { in: accessoryIds } },
        select: { id: true },
      });
      if (accs.length !== accessoryIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada accessory yang tidak valid / tidak ditemukan.",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.saleItem.deleteMany({ where: { saleId: input.id! } });

        return tx.sale.update({
          where: { id: input.id! },
          data: {
            customerId: input.customerId,
            orderNo: input.orderNo ?? null,
            invoiceNo: input.invoiceNo ?? null,
            notes: input.notes ?? null,
            items: {
              create: input.items.map((it) => {
                const qty = toNumber(it.qty);
                const unitPrice = toNumber(it.unitPrice);
                return {
                  itemType: "PAINT_ACCESSORIES",
                  finishedGoodId: null,
                  accessoryId: it.accessoryId,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: {
            customer: true,
            user: true,
            items: { include: { accessory: true } },
          },
        });
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: saleStatusEnum,
        notes: z.string().optional().nullable(),
        shippedAt: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const { id, status, notes, shippedAt } = input;

      return ctx.db.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!sale)
          throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });

        const from = sale.status as SaleStatus;

        if (from === "FINISHED" || from === "CANCELED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Sale ${from} tidak bisa diubah lagi.`,
          });
        }

        const allowed: Record<SaleStatus, SaleStatus[]> = {
          DRAFT: ["DRAFT", "ONGOING", "CANCELED"],
          ONGOING: ["ONGOING", "FINISHED", "CANCELED"],
          FINISHED: ["FINISHED"],
          CANCELED: ["CANCELED"],
        };

        if (!allowed[from].includes(status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Transisi status tidak valid: ${from} -> ${status}`,
          });
        }

        // ✅ when FINISHED: decrement finished good stock + create stock movement
        if (status === "FINISHED") {
          const lines = sale.items.filter(
            (x) => x.itemType === "FINISHED_GOOD",
          );

          if (!lines.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Sale tidak memiliki item.",
            });
          }

          // validate stock first
          const fgIds = lines
            .map((l) => l.finishedGoodId)
            .filter(Boolean) as string[];
          const fgs = await tx.finishedGood.findMany({
            where: { id: { in: fgIds } },
            select: { id: true, qty: true },
          });

          const fgMap = new Map(fgs.map((x) => [x.id, Number(x.qty)]));

          for (const l of lines) {
            if (!l.finishedGoodId) continue;
            const need = Number(l.qty);
            const have = fgMap.get(l.finishedGoodId) ?? 0;

            if (have < need) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Stok barang jadi tidak cukup untuk item ${l.finishedGoodId}. Stok: ${have}, butuh: ${need}`,
              });
            }
          }

          // apply stock decrement + movements
          for (const l of lines) {
            if (!l.finishedGoodId) continue;

            await tx.finishedGood.update({
              where: { id: l.finishedGoodId },
              data: { qty: { decrement: l.qty } },
            });

            await tx.stockMovement.create({
              data: {
                type: "SALE_OUT",
                itemType: "FINISHED_GOOD",
                itemId: l.finishedGoodId,
                qty: l.qty,
                refSaleId: sale.id,
                userId: userId || sale.userId,
                refFinishedGoodId: l.finishedGoodId,
              },
            });
          }
        }

        return tx.sale.update({
          where: { id },
          data: {
            status,
            ...(typeof notes !== "undefined" ? { notes } : {}),
            ...(typeof shippedAt !== "undefined" ? { shippedAt } : {}),
          },
        });
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { id: true, status: true },
      });

      if (!sale)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });

      if (sale.status === "FINISHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale FINISHED tidak bisa dibatalkan.",
        });
      }
      if (sale.status === "CANCELED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale sudah CANCELED.",
        });
      }

      return ctx.db.sale.update({
        where: { id: input.id },
        data: { status: "CANCELED" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        select: { status: true },
      });

      if (!sale)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale tidak ditemukan",
        });
      if (sale.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya sale DRAFT yang bisa dihapus.",
        });
      }

      return ctx.db.sale.delete({ where: { id: input.id } });
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.sale.deleteMany({ where: { id: { in: input.ids } } });
    }),

  checkoutFinishedGood: protectedProcedure
    .input(
      saleFinishedGoodFormSchema.extend({
        shippedAt: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? "";
      const shippedAt = input.shippedAt ?? new Date();

      // unique saleNo
      const exists = await ctx.db.sale.findUnique({
        where: { saleNo: input.saleNo },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nomor penjualan sudah digunakan.",
        });
      }

      // unique invoiceNo (optional)
      if (input.invoiceNo) {
        const inv = await ctx.db.sale.findFirst({
          where: { invoiceNo: input.invoiceNo },
          select: { id: true },
        });
        if (inv) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Invoice No sudah digunakan.",
          });
        }
      }

      if (!input.items?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimal pilih 1 barang jadi.",
        });
      }

      // 1) validate FG exist + stock enough (sebelum transaksi create)
      const fgIds = input.items.map((i) => i.finishedGoodId);
      const fgs = await ctx.db.finishedGood.findMany({
        where: { id: { in: fgIds } },
        select: { id: true, qty: true },
      });

      if (fgs.length !== fgIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ada barang jadi yang tidak valid / tidak ditemukan.",
        });
      }

      const fgMap = new Map(fgs.map((x) => [x.id, Number(x.qty)]));

      for (const it of input.items) {
        const need = toNumber(it.qty);
        const have = fgMap.get(it.finishedGoodId) ?? 0;
        if (have < need) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Stok tidak cukup untuk FG ${it.finishedGoodId}. Stok: ${have}, butuh: ${need}`,
          });
        }
      }

      // 2) Transaction: create sale FINISHED + decrement + stock movement
      return ctx.db.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            saleNo: input.saleNo,
            customerId: input.customerId,
            orderNo: input.orderNo ?? null,
            invoiceNo: input.invoiceNo ?? null,
            notes: input.notes ?? null,
            status: "FINISHED",
            shippedAt,
            userId,
            items: {
              create: input.items.map((it) => {
                const qty = toNumber(it.qty);
                const unitPrice = toNumber(it.unitPrice);
                return {
                  itemType: "FINISHED_GOOD",
                  finishedGoodId: it.finishedGoodId,
                  accessoryId: null,
                  qty,
                  unitPrice,
                  subtotal: qty * unitPrice,
                };
              }),
            },
          },
          include: { items: true, customer: true, user: true },
        });

        // apply stock decrement + movements
        for (const line of sale.items) {
          if (line.itemType !== "FINISHED_GOOD") continue;
          if (!line.finishedGoodId) continue;

          await tx.finishedGood.update({
            where: { id: line.finishedGoodId },
            data: { qty: { decrement: line.qty } },
          });

          await tx.stockMovement.create({
            data: {
              type: "SALE_OUT",
              itemType: "FINISHED_GOOD",
              itemId: line.finishedGoodId,
              qty: line.qty,
              refSaleId: sale.id,
              userId: userId || sale.userId,
              refFinishedGoodId: line.finishedGoodId,
            },
          });
        }

        return sale;
      });
    }),
});
