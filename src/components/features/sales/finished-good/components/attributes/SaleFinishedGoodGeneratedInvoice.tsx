import { Eye, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type SaleFinishedGoodGeneratedInvoiceProps = {
  invoiceOpen: boolean;
  setInvoiceOpen: (open: boolean) => void;
  invoiceNoPreview: string;
  invoiceHtml: string;
  form: any;
};

export const SaleFinishedGoodGeneratedInvoice = ({
  invoiceOpen,
  setInvoiceOpen,
  invoiceNoPreview,
  invoiceHtml,
  form,
}: SaleFinishedGoodGeneratedInvoiceProps) => {
  return (
    <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview Invoice
          </DialogTitle>
          <DialogDescription>
            Invoice No:{" "}
            <b>
              {invoiceNoPreview || String(form.state.values.invoiceNo ?? "-")}
            </b>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/20 overflow-hidden rounded-xl border">
          <iframe
            title="Invoice Preview"
            className="h-[70vh] w-full"
            srcDoc={invoiceHtml}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
            Tutup
          </Button>

          {/* OPTIONAL: kalau nanti kamu buat endpoint PDF */}
          <Button
            disabled
            title="Buat endpoint PDF kalau mau download PDF"
            variant="secondary"
          >
            <Eye className="mr-2 h-4 w-4" />
            Download PDF (optional)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
