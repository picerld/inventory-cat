"use client";

import {
  Package,
  TrendingUp,
  Box,
  Layers,
  BarChart3,
  Calendar,
  Award,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";
import { StatsCard, StatsModal } from "~/components/elements/StatsCard";
import { trpc } from "~/utils/trpc";

export const FinishedGoodStatsContainer = () => {
  const { data, isLoading } = trpc.finishedGood.getStats.useQuery();
  const [selectedStat, setSelectedStat] = useState<number | null>(null);

  const [showAll, setShowAll] = useState<boolean>(false);

  if (isLoading) return <div>Loading...</div>;

  const statsData = [
    {
      id: 1,
      title: "Total Barang Jadi",
      value: data?.totalFinishedGoods ?? 0,
      change: `+${data?.growth}%`,
      changeType:
        data!.growth >= 0 ? ("positive" as const) : ("negative" as const),
      icon: Package,
      description: "Total Jenis Barang",
      details: [
        {
          label: "Ditambahkan Tahun Ini",
          value: data?.thisYearFinishedGoods ?? 0,
        },
        {
          label: "Ditambahkan Bulan Ini",
          value: data?.thisMonthFinishedGoods ?? 0,
        },
        { label: "Pertumbuhan Tahunan", value: `${data?.growth}%` },
        {
          label: "Rata-rata per Bulan",
          value: Math.round(
            (data?.thisYearFinishedGoods ?? 0) /
              (new Date().getMonth() + 1),
          ),
        },
      ],
    },
    {
      id: 2,
      title: "Total Relasi Bahan Baku",
      value: data?.totalDetails ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: Layers,
      description: "Total Hubungan Material",
      details: [
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        { label: "Total Relasi Bahan Baku", value: data?.totalDetails ?? 0 },
        {
          label: "Rata-rata Bahan per Barang",
          value: data?.avgRawMaterialsPerGood ?? 0,
        },
        {
          label: "Bahan Paling Sering Digunakan",
          value: data?.mostUsedRawMaterial || "Tidak ada",
        },
      ],
    },
    {
      id: 3,
      title: "Rata-rata Bahan per Barang",
      value: data?.avgRawMaterialsPerGood ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: Box,
      description: "Kompleksitas Rata-rata",
      details: [
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        { label: "Total Relasi Bahan", value: data?.totalDetails ?? 0 },
        {
          label: "Rata-rata Bahan per Barang",
          value: data?.avgRawMaterialsPerGood ?? 0,
        },
        { label: "Minimum Bahan", value: 1 },
      ],
    },
    {
      id: 4,
      title: "Bahan Paling Populer",
      value: data?.mostUsedRawMaterial || "Tidak ada",
      change: `${data?.mostUsedCount ?? 0}x`,
      changeType: "positive" as const,
      icon: Award,
      description: "Bahan Paling Sering Digunakan",
      details: [
        {
          label: "Nama Bahan",
          value: data?.mostUsedRawMaterial || "Tidak ada",
        },
        {
          label: "Digunakan dalam",
          value: `${data?.mostUsedCount ?? 0} barang`,
        },
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        {
          label: "Persentase Penggunaan",
          value: `${Math.round(((data?.mostUsedCount ?? 0) / (data?.totalFinishedGoods || 1)) * 100)}%`,
        },
      ],
    },
    {
      id: 5,
      title: `Tahun Ini (${new Date().getFullYear()})`,
      value: data?.thisYearFinishedGoods ?? 0,
      change: `+${data?.growth}%`,
      changeType: "positive" as const,
      icon: Calendar,
      description: "Ditambahkan Tahun Ini",
      details: [
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        {
          label: "Ditambahkan Bulan Ini",
          value: data?.thisMonthFinishedGoods ?? 0,
        },
        { label: "Pertumbuhan", value: `${data?.growth}%` },
        {
          label: "Rata-rata per Bulan",
          value: Math.round(
            (data?.thisYearFinishedGoods ?? 0) /
              (new Date().getMonth() + 1),
          ),
        },
      ],
    },
    {
      id: 6,
      title: "Bulan Ini",
      value: data?.thisMonthFinishedGoods ?? 0,
      change: "+0%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "Penambahan Bulan Ini",
      details: [
        { label: "Tahun Ini", value: data?.thisYearFinishedGoods ?? 0 },
        { label: "Bulan Ini", value: data?.thisMonthFinishedGoods ?? 0 },
        {
          label: "Persentase dari Tahun Ini",
          value: `${Math.round(((data?.thisMonthFinishedGoods ?? 0) / (data?.thisYearFinishedGoods || 1)) * 100)}%`,
        },
        {
          label: "Rata-rata Harian",
          value: Math.round(
            (data?.thisMonthFinishedGoods ?? 0) / new Date().getDate(),
          ),
        },
      ],
    },
    {
      id: 7,
      title: "Pertumbuhan Tahun Ini",
      value: `${data?.growth}%`,
      change: data!.growth >= 0 ? "Positif" : "Negatif",
      changeType:
        data!.growth >= 0 ? ("positive" as const) : ("negative" as const),
      icon: TrendingUp,
      description: "Tren Pertumbuhan",
      details: [
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        {
          label: "Ditambahkan Tahun Ini",
          value: data?.thisYearFinishedGoods ?? 0,
        },
        { label: "Pertumbuhan", value: `${data?.growth}%` },
        {
          label: "Status",
          value: data!.growth >= 0 ? "Berkembang" : "Menurun",
        },
      ],
    },
    {
      id: 8,
      title: "Total Kompleksitas",
      value: `${data?.totalDetails ?? 0} Hub.`,
      change: `${data?.avgRawMaterialsPerGood ?? 0} avg`,
      changeType: "positive" as const,
      icon: PackageCheck,
      description: "Total Hubungan Material",
      details: [
        { label: "Total Relasi Bahan Baku", value: data?.totalDetails ?? 0 },
        {
          label: "Total Barang Setengah Jadi",
          value: data?.totalFinishedGoods ?? 0,
        },
        {
          label: "Rata-rata per Barang",
          value: data?.avgRawMaterialsPerGood ?? 0,
        },
        {
          label: "Bahan Terpopuler",
          value: data?.mostUsedRawMaterial || "Tidak ada",
        },
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
