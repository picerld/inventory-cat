import React from "react";
import {
  AlertTriangle,
  Info,
  Loader,
  PackageCheck,
  Save,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { SaleAccessoriesFull, SaleStatus } from "~/types/sale";
import type { ActionKey } from "~/components/features/sales/finished-good/types/forms";

type SaleAccessoriesActionsSectionProps = {
  isSubmitting: boolean;
  initialData?: SaleAccessoriesFull;
  mode: "create" | "edit";
  canSetOngoing: boolean;
  disableSubmit: boolean;
  lockUI: boolean;
  isReadOnlyByStatus: boolean;
  isSetOngoing: boolean;
  canSetFinished: boolean;
  isSetFinished: boolean;
  canCancel: boolean;
  isSetCanceled: boolean;
  setActiveAction: React.Dispatch<React.SetStateAction<ActionKey>>;
  updateStatus: ({ id, status }: { id: string; status: SaleStatus }) => void;
};

export const SaleAccessoriesActionsSection = ({
  isSubmitting,
  initialData,
  mode,
  canSetOngoing,
  disableSubmit,
  lockUI,
  isReadOnlyByStatus,
  isSetOngoing,
  canSetFinished,
  isSetFinished,
  canCancel,
  isSetCanceled,
  setActiveAction,
  updateStatus,
}: SaleAccessoriesActionsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
        <CardDescription>Simpan draft / update / posting.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Button type="submit" className="w-full" disabled={disableSubmit}>
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Simpan Draft" : "Update"}
            </>
          )}
        </Button>

        {mode === "edit" && initialData?.id && (
          <>
            <Separator className="my-3" />

            {canSetOngoing && (
              <ConfirmActionDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={lockUI || isReadOnlyByStatus}
                  >
                    {isSetOngoing ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        Set Berlangsung
                      </>
                    )}
                  </Button>
                }
                variant="default"
                title="Ubah status ke ONGOING?"
                description="Sale aksesoris akan ditandai ONGOING."
                confirmText="Ya"
                cancelText="Batal"
                icon={<Info className="size-6" />}
                isLoading={lockUI}
                onConfirm={() => {
                  setActiveAction("set-ongoing");
                  updateStatus({
                    id: initialData.id,
                    status: "ONGOING",
                  });
                }}
              />
            )}

            {canSetFinished && (
              <ConfirmActionDialog
                trigger={
                  <Button
                    type="button"
                    className="w-full"
                    disabled={lockUI || isReadOnlyByStatus}
                  >
                    {isSetFinished ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PackageCheck className="h-4 w-4" />
                        Tandai Selesai
                      </>
                    )}
                  </Button>
                }
                variant="destructive"
                title="Posting sale aksesoris ini?"
                description="Saat FINISHED, stok aksesoris berkurang dan movement SALE_OUT tercatat."
                confirmText="Posting"
                cancelText="Batal"
                icon={<TriangleAlert className="size-6" />}
                isLoading={lockUI}
                onConfirm={() => {
                  setActiveAction("set-finished");
                  updateStatus({
                    id: initialData.id,
                    status: "FINISHED",
                  });
                }}
              />
            )}

            {canCancel && (
              <ConfirmActionDialog
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={lockUI || isReadOnlyByStatus}
                  >
                    {isSetCanceled ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        Batalkan
                      </>
                    )}
                  </Button>
                }
                variant="destructive"
                title="Batalkan sale aksesoris ini?"
                description="Status berubah menjadi CANCELED."
                confirmText="Batalkan"
                cancelText="Kembali"
                icon={<TriangleAlert className="size-6" />}
                isLoading={lockUI}
                onConfirm={() => {
                  setActiveAction("set-canceled");
                  updateStatus({
                    id: initialData.id,
                    status: "CANCELED",
                  });
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
