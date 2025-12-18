"use client";

import {
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  BarChart3,
  Warehouse,
  Calendar,
  Users,
} from "lucide-react";
import { useState } from "react";
import { StatsCard, StatsModal } from "~/components/elements/StatsCard";
import { trpc } from "~/utils/trpc";

export const RawMaterialStatsContainer = () => {
  const { data, isLoading } = trpc.rawMaterial.getStats.useQuery();
  const [selectedStat, setSelectedStat] = useState<number | null>(null);

  const [showAll, setShowAll] = useState<boolean>(false);

  if (isLoading) return <div>Loading...</div>;

  const statsData = [
    {
      id: 1,
      title: "Total Bahan Baku",
      value: data?.totalRawMaterials ?? 0,
      change: `+${data?.growth}%`,
      changeType:
        data!.growth >= 0 ? ("positive" as const) : ("negative" as const),
      icon: Package,
      description: "Total Jenis Bahan",
      details: [
        {
          label: "Ditambahkan Tahun Ini",
          value: data?.thisYearRawMaterials ?? 0,
        },
        {
          label: "Ditambahkan Bulan Ini",
          value: data?.thisMonthRawMaterials ?? 0,
        },
        { label: "Pertumbuhan Tahunan", value: `${data?.growth}%` },
        {
          label: "Rata-rata per Bulan",
          value: Math.round(
            (data?.thisYearRawMaterials ?? 0) / (new Date().getMonth() + 1),
          ),
        },
      ],
    },
    {
      id: 2,
      title: "Total Stok",
      value: data?.totalQty ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: Warehouse,
      description: "Unit di Gudang",
      details: [
        { label: "Total Bahan Baku", value: data?.totalRawMaterials ?? 0 },
        {
          label: "Rata-rata Stok per Item",
          value: Math.round(
            (data?.totalQty ?? 0) / (data?.totalRawMaterials ?? 1),
          ),
        },
        {
          label: "Stok Normal",
          value: (data?.totalRawMaterials ?? 0) - (data?.lowStockCount ?? 0),
        },
        { label: "Stok Menipis", value: data?.lowStockCount ?? 0 },
      ],
    },
    {
      id: 3,
      title: "Nilai Inventori",
      value: `Rp ${(data?.totalInventoryValue ?? 0).toLocaleString("id-ID")}`,
      change: "+0%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Total Nilai Beli",
      details: [
        {
          label: "Potensi Nilai Jual",
          value: `Rp ${((data?.totalInventoryValue ?? 0) + (data?.totalPotentialProfit ?? 0)).toLocaleString("id-ID")}`,
        },
        {
          label: "Potensi Keuntungan",
          value: `Rp ${(data?.totalPotentialProfit ?? 0).toLocaleString("id-ID")}`,
        },
        {
          label: "Rata-rata Harga Beli",
          value: `Rp ${(data?.avgSupplierPrice ?? 0).toLocaleString("id-ID")}`,
        },
        {
          label: "Margin Keuntungan",
          value: `${Math.round(((data?.totalPotentialProfit ?? 0) / (data?.totalInventoryValue ?? 1)) * 100)}%`,
        },
      ],
    },
    {
      id: 4,
      title: "Potensi Keuntungan",
      value: `Rp ${(data?.totalPotentialProfit ?? 0).toLocaleString("id-ID")}`,
      change: "+0%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Jika Semua Terjual",
      details: [
        {
          label: "Total Nilai Beli",
          value: `Rp ${(data?.totalInventoryValue ?? 0).toLocaleString("id-ID")}`,
        },
        {
          label: "Potensi Nilai Jual",
          value: `Rp ${((data?.totalInventoryValue ?? 0) + (data?.totalPotentialProfit ?? 0)).toLocaleString("id-ID")}`,
        },
        {
          label: "Rata-rata Harga Jual",
          value: `Rp ${(data?.avgSellingPrice ?? 0).toLocaleString("id-ID")}`,
        },
        {
          label: "ROI",
          value: `${Math.round(((data?.totalPotentialProfit ?? 0) / (data?.totalInventoryValue ?? 1)) * 100)}%`,
        },
      ],
    },
    {
      id: 5,
      title: "Stok Menipis",
      value: data?.lowStockCount ?? 0,
      change: "-0%",
      changeType:
        data!.lowStockCount > 0 ? ("negative" as const) : ("positive" as const),
      icon: AlertCircle,
      description: "Perlu Restock",
      details: [
        { label: "Total Bahan Baku", value: data?.totalRawMaterials ?? 0 },
        {
          label: "Stok Normal",
          value: (data?.totalRawMaterials ?? 0) - (data?.lowStockCount ?? 0),
        },
        {
          label: "Persentase Stok Menipis",
          value: `${Math.round(((data?.lowStockCount ?? 0) / (data?.totalRawMaterials ?? 1)) * 100)}%`,
        },
        { label: "Perlu Perhatian", value: data?.lowStockCount ?? 0 },
      ],
    },
    {
      id: 6,
      title: `Tahun Ini (${new Date().getFullYear()})`,
      value: data?.thisYearRawMaterials ?? 0,
      change: `+${data?.growth}%`,
      changeType: "positive" as const,
      icon: Calendar,
      description: "Ditambahkan Tahun Ini",
      details: [
        { label: "Total Bahan Baku", value: data?.totalRawMaterials ?? 0 },
        {
          label: "Ditambahkan Bulan Ini",
          value: data?.thisMonthRawMaterials ?? 0,
        },
        { label: "Pertumbuhan", value: `${data?.growth}%` },
        {
          label: "Rata-rata per Bulan",
          value: Math.round(
            (data?.thisYearRawMaterials ?? 0) / (new Date().getMonth() + 1),
          ),
        },
      ],
    },
    {
      id: 7,
      title: "Bulan Ini",
      value: data?.thisMonthRawMaterials ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "Penambahan Bulan Ini",
      details: [
        { label: "Tahun Ini", value: data?.thisYearRawMaterials ?? 0 },
        { label: "Bulan Ini", value: data?.thisMonthRawMaterials ?? 0 },
        {
          label: "Persentase dari Tahun Ini",
          value: `${Math.round(((data?.thisMonthRawMaterials ?? 0) / (data?.thisYearRawMaterials ?? 1)) * 100)}%`,
        },
        {
          label: "Rata-rata Harian",
          value: Math.round(
            (data?.thisMonthRawMaterials ?? 0) / new Date().getDate(),
          ),
        },
      ],
    },
    {
      id: 8,
      title: "Supplier Aktif",
      value: data?.uniqueSuppliers ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: Users,
      description: "Jumlah Supplier",
      details: [
        { label: "Total Bahan Baku", value: data?.totalRawMaterials ?? 0 },
        { label: "Supplier Aktif", value: data?.uniqueSuppliers ?? 0 },
        {
          label: "Rata-rata Item per Supplier",
          value: Math.round(
            (data?.totalRawMaterials ?? 0) / (data?.uniqueSuppliers ?? 1),
          ),
        },
        { label: "Total Stok", value: data?.totalQty ?? 0 },
      ],
    },
  ];

  const visibleStats = showAll ? statsData : statsData.slice(0, 4);

  const selectedStatData = statsData.find((stat) => stat.id === selectedStat);

  return (
    <>
      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.changeType === "positive";

          return (
            <StatsCard
              key={stat.id}
              stat={stat}
              Icon={Icon}
              isPositive={isPositive}
              onClick={() => setSelectedStat(stat.id)}
            />
          );
        })}
      </div>

      <div className="mt-2 mb-5 flex justify-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-primary cursor-pointer text-sm font-medium underline underline-offset-2"
        >
          {showAll ? "Sembunyikan statistik lainnya" : "Lihat semua statistik"}
        </button>
      </div>

      {selectedStatData && (
        <StatsModal
          isOpen={selectedStat !== null}
          onClose={() => setSelectedStat(null)}
          stat={selectedStatData}
          Icon={selectedStatData.icon}
          isPositive={selectedStatData.changeType === "positive"}
        />
      )}
    </>
  );
};
