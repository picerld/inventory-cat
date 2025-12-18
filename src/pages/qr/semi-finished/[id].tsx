import { type GetServerSideProps } from "next";
import { QrCode, Package, Calendar, Hash, UserIcon } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { db } from "~/server/db";
import type { User } from "~/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { QrCard3D } from "~/components/features/qr-code/components/QrCard3D";

type QRPageProps = {
  item: {
    id: string;
    name: string;
    qty: number;
    createdAt: string;
    user: User;
    SemiFinishedGoodDetail: Array<{
      rawMaterial: {
        name: string;
        supplier: string;
      };
      qty: number;
    }>;
  } | null;
};

export default function SemiFinishedGoodQrPage({ item }: QRPageProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item || !qrRef.current) return;

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: `${baseUrl}/qr/semi-finished/${item.id}`,
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    });

    qrRef.current.innerHTML = "";
    qrCode.append(qrRef.current);
  }, [item]);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <QrCode className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Data Tidak Ditemukan</CardTitle>
              <CardDescription>
                QR Code yang Anda cari tidak ditemukan atau telah dihapus.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Toko Budi</h1>
          <p className="text-slate-600">
            Barang Setengah Jadi - Informasi QR Code
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <QrCard3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </CardTitle>
                  <CardDescription>Scan untuk akses cepat</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div ref={qrRef} className="rounded-lg border p-4" />
                </CardContent>
              </Card>
            </QrCard3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <QrCard3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informasi Detail
                  </CardTitle>
                  <CardDescription>Detail lengkap barang</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Package className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Nama Barang
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Hash className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Jumlah
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {item.qty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Calendar className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Tanggal Dibuat
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </QrCard3D>
          </motion.div>
        </div>

        {item.SemiFinishedGoodDetail.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6"
          >
            <QrCard3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Bahan Baku
                  </CardTitle>
                  <CardDescription>
                    Daftar bahan yang digunakan (
                    {item.SemiFinishedGoodDetail.length} item)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {item.SemiFinishedGoodDetail.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border bg-white p-4"
                      >
                        <div className="flex flex-col">
                          <span className="dark:text-secondary text-sm font-medium">
                            {detail.rawMaterial.name}
                          </span>
                          <span className="text-sm text-slate-700">
                            {detail.rawMaterial.supplier}
                          </span>
                        </div>
                        <Badge variant="secondary">{detail.qty}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </QrCard3D>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} - Sistem Manajemen Produksi
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const item = await db.semiFinishedGood.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        SemiFinishedGoodDetail: {
          include: {
            rawMaterial: {
              select: {
                name: true,
                supplier: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return {
        props: {
          item: null,
        },
      };
    }

    return {
      props: {
        item: {
          id: item.id,
          name: item.name,
          qty: item.qty,
          createdAt: item.createdAt.toISOString(),
          user: {
            name: item.user.name,
          },
          SemiFinishedGoodDetail: item.SemiFinishedGoodDetail.map((detail) => ({
            rawMaterial: {
              name: detail.rawMaterial.name,
              supplier: detail.rawMaterial.supplier.name,
            },
            qty: detail.qty,
          })),
        },
      },
    };
  } catch (error) {
    return {
      props: {
        item: null,
      },
    };
  }
};
