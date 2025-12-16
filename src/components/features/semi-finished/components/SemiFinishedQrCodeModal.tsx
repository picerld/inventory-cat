"use client";

import { useRef, useState } from "react";
import {
  QrCode,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { trpc } from "~/utils/trpc";
import { SemiFinishedGoodQrInformationSection } from "./qr/SemiFinishedGoodQrInformationSection";
import { SemiFinishedGoodQrSection } from "./qr/SemiFinishedGoodQrSection";

type SemiFinishedQrCodeModalProps = {
  open: boolean;
  currentRow: SemiFinishedGood | null;
  onOpenChange: (open: boolean) => void;
};

export const SemiFinishedQrCodeModal = ({
  currentRow,
  open,
  onOpenChange,
}: SemiFinishedQrCodeModalProps) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const qrSvgRef = useRef<SVGSVGElement>(null);

  const { data: qrData, isLoading } = trpc.semiFinishedGood.getQRData.useQuery(
    { id: currentRow?.id ?? "" },
    {
      enabled: !!currentRow?.id && open,
      refetchOnWindowFocus: false,
    },
  );

  const handleCopyLink = async () => {
    if (!qrData?.previewLink) return;

    try {
      await navigator.clipboard.writeText(qrData.previewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenPreview = () => {
    if (!qrData?.previewLink) return;
    window.open(qrData.previewLink, "_blank");
  };

  if (!currentRow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="pt-5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <QrCode className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle>QR Code</DialogTitle>
              <DialogDescription>
                Barang Setengah Jadi - {currentRow.name}
              </DialogDescription>
            </div>
            {qrData?.previewLink && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenPreview}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Salin Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : qrData ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* @ts-expect-error type */}
            <SemiFinishedGoodQrInformationSection qrData={qrData} />

            <SemiFinishedGoodQrSection
              qrData={qrData}
              qrSvgRef={qrSvgRef}
              isDownloading={isDownloading}
              setIsDownloading={setIsDownloading}
            />
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Data tidak ditemukan
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
