import { CircleCheck, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export const OnLoadItem = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AlertDialog open={isLoading}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="flex items-center">
          {isLoading ? (
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Info className="text-secondary size-8" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <CircleCheck className="text-secondary size-8" strokeWidth={2.5} />
            </div>
          )}

          <AlertDialogTitle className="text-xl">
            {isLoading ? "Tunggu sebentar ya!" : "Data berhasil dimuat!"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            {isLoading
              ? "Sedang memuat data..."
              : "Yay! Data berhasil diambil!"}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
