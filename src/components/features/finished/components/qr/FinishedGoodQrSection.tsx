import { Download, Loader2, Package, Printer, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { RefObject } from "react";
import {
  handleDownload,
  handlePrint,
  handleShare,
} from "~/components/features/qr-code/utils/qr";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

type FinishedGoodQrSectionProps = {
  qrSvgRef: RefObject<SVGSVGElement | null>;
  qrData: {
    item: {
      id: string;
      name: string;
    };
    qrValue: string;
  };
  isDownloading: boolean;
  setIsDownloading: (isDownloading: boolean) => void;
};

export const FinishedGoodQrSection = ({
  qrSvgRef,
  qrData,
  isDownloading,
  setIsDownloading,
}: FinishedGoodQrSectionProps) => {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-xl border-2 bg-white p-6">
            <QRCodeSVG
              ref={qrSvgRef}
              value={qrData.qrValue}
              size={256}
              level="H"
              includeMargin
            />
            <div className="mt-3 text-center">
              <p className="dark:text-secondary text-primary text-sm">
                {qrData.item.name}
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                {qrData.item.id}
              </p>
            </div>
          </div>

          <Badge variant="secondary">
            <Package className="mr-1 h-3 w-3" />
            Setengah Jadi
          </Badge>

          <div className="flex w-full gap-2 pt-4">
            <Button
              onClick={() =>
                handleDownload({
                  qrData,
                  qrSvgRef,
                  setIsDownloading,
                  fileName: `QR-${qrData.item.name.replace(/\s+/g, "-")}.png`,
                })
              }
              disabled={isDownloading}
              className="flex-1"
              size="lg"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>

            <Button
              onClick={() =>
                handlePrint({
                  qrData,
                  qrSvgRef,
                })
              }
              variant="outline"
              size="lg"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => {
                handleShare({
                  qrData,
                });
              }}
              variant="outline"
              size="lg"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
