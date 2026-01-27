import { Loader } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { PurchaseStatus } from "../../config/purchase";

type ActionKey =
  | "submit"
  | "set-ongoing"
  | "set-finished"
  | "set-canceled"
  | null;

type PurchaseRawMaterialFormActionProps = {
  props: {
    lockUI: boolean;
    isReadOnlyByStatus: boolean;
    canSetOngoing: boolean;
    canSetFinished: boolean;
    canCancel: boolean;
    isSetOngoing: boolean;
    isSetFinished: boolean;
    isSetCanceled: boolean;
    setActiveAction: React.Dispatch<React.SetStateAction<ActionKey>>;
    updateStatus: (data: { id: string; status: PurchaseStatus }) => void;
    initialData: {
      id: string;
    };
  };
};

export const PurchaseRawMaterialFormAction = ({
  props: {
    lockUI,
    isReadOnlyByStatus,
    canSetOngoing,
    canSetFinished,
    canCancel,
    isSetOngoing,
    isSetFinished,
    isSetCanceled,
    setActiveAction,
    updateStatus,
    initialData,
  },
}: PurchaseRawMaterialFormActionProps) => {
  return (
    <div className="flex items-center gap-2">
      {canSetOngoing && (
        <Button
          type="button"
          variant="outline"
          disabled={lockUI || isReadOnlyByStatus}
          onClick={() => {
            setActiveAction("set-ongoing");
            updateStatus({ id: initialData.id, status: "ONGOING" });
          }}
        >
          {isSetOngoing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            "Set Ongoing"
          )}
        </Button>
      )}

      {canSetFinished && (
        <Button
          type="button"
          variant="outline"
          disabled={lockUI || isReadOnlyByStatus}
          onClick={() => {
            setActiveAction("set-finished");
            updateStatus({ id: initialData.id, status: "FINISHED" });
          }}
        >
          {isSetFinished ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            "Finish (Tambah Stok)"
          )}
        </Button>
      )}

      {canCancel && (
        <Button
          type="button"
          variant="destructive"
          disabled={lockUI || isReadOnlyByStatus}
          onClick={() => {
            setActiveAction("set-canceled");
            updateStatus({ id: initialData.id, status: "CANCELED" });
          }}
        >
          {isSetCanceled ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            "Cancel"
          )}
        </Button>
      )}
    </div>
  );
};
