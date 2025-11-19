"use client";

import { type LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";

interface StatData {
  id: number;
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  description: string;
  details?: {
    label: string;
    value: string | number;
  }[];
}

interface StatsCardProps {
  stat: StatData;
  Icon: LucideIcon;
  isPositive: boolean;
  onClick?: () => void;
}

export const StatsCard = ({
  stat,
  Icon,
  isPositive,
  onClick,
}: StatsCardProps) => {
  return (
    <Card
      className="cursor-pointer transition-all hover:scale-[1.005] hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">
              {stat.title}
            </p>
            <h3 className="mt-2 text-2xl font-bold">{stat.value}</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {stat.description}
            </p>
          </div>
          <div className="ml-4">
            <div
              className={`rounded-full p-3 ${
                isPositive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {stat.change}
          </span>
          <span className="text-muted-foreground ml-2 text-xs">
            vs tahun lalu
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stat: StatData;
  Icon: LucideIcon;
  isPositive: boolean;
}

export const StatsModal = ({
  isOpen,
  onClose,
  stat,
  Icon,
  isPositive,
}: StatsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                isPositive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            {stat.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Value */}
          <div className="bg-muted rounded-lg p-6">
            <p className="text-muted-foreground text-sm">Nilai Saat Ini</p>
            <p className="mt-2 text-4xl font-bold">{stat.value}</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-muted-foreground text-sm">
                {stat.description}
              </span>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {stat.details && stat.details.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Detail Informasi</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {stat.details.map((detail, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                  >
                    <p className="text-muted-foreground text-sm">
                      {detail.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
