import { toast } from "sonner";
import type { RefObject } from "react";

export const downloadSvgAsPng = async (
  svg: SVGSVGElement,
  fileName: string,
  scale = 6,
) => {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);

  const svgBlob = new Blob([svgStr], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.src = url;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(url);

  const pngUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = fileName;
  link.click();
};

export const handleDownload = async ({
  qrData,
  qrSvgRef,
  setIsDownloading,
  fileName,
}: {
  qrData: {
    item: {
      name: string;
    };
  };
  qrSvgRef: RefObject<SVGSVGElement | null>;
  setIsDownloading: (isDownloading: boolean) => void;
  fileName: string;
}) => {
  if (!qrSvgRef.current || !qrData) return;

  setIsDownloading(true);

  try {
    await downloadSvgAsPng(qrSvgRef.current, fileName);

    toast.success("Berhasil", {
      description: "QR Code berhasil diunduh",
    });
  } catch (err) {
    console.error(err);
    toast.error("Gagal!", {
      description: "Gagal mengunduh QR Code",
    });
  } finally {
    setIsDownloading(false);
  }
};

export const handlePrint = ({
  qrData,
  qrSvgRef,
}: {
  qrData: {
    item: {
      name: string;
    };
  };
  qrSvgRef: RefObject<SVGSVGElement | null>;
}) => {
  if (!qrSvgRef.current || !qrData) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(qrSvgRef.current);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Gagal!", {
      description: "Pop-up blocker menghalangi print window",
    });
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code – ${qrData.item.name}</title>
    
        <style>
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
    
          * {
            box-sizing: border-box;
          }
    
          body {
            margin: 0;
            padding: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #fff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
    
          .container {
            text-align: center;
            padding: 16px 20px 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            width: fit-content;
          }
    
          h1 {
            margin: 0 0 12px;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            letter-spacing: 0.3px;
            word-break: break-word;
          }
    
          .qr {
            display: flex;
            justify-content: center;
            align-items: center;
          }
    
          svg {
            width: 260px;
            height: 260px;
          }
    
          .footer {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
    
      <body>
        <div class="container">
          <h1>${qrData.item.name}</h1>
          <div class="qr">
            ${svgStr}
          </div>
          <div class="footer">
            Scan to view item
          </div>
        </div>
      </body>
    </html>
    `);
    
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const handleShare = async ({
  qrData,
}: {
  qrData: {
    item: {
      name: string;
    };
    qrValue: string;
  };
}) => {
  if (!qrData) return;

  try {
    if (navigator.share) {
      await navigator.share({
        title: `QR Code - ${qrData.item.name}`,
        text: `QR Code untuk barang: ${qrData.item.name}`,
      });

      toast.success("Berhasil!", {
        description: "Link berhasil dibagikan",
      });
    } else {
      await navigator.clipboard.writeText(qrData.qrValue);

      toast.success("Berhasil!", {
        description: "Data QR Code disalin ke clipboard",
      });
    }
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("Share error:", error);
    }
  }
};
