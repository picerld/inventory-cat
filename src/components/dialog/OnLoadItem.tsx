"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "~/lib/utils";

type OnLoadItemProps = {
  isLoading: boolean;
  title?: string;
  description?: string;
  /**
   * If true, show a close button on success (optional UX).
   * Keep false if you want it to behave like a pure loading modal.
   */
  showSuccessCloseHint?: boolean;
};

export const OnLoadItem = ({
  isLoading,
  title,
  description,
  showSuccessCloseHint = false,
}: OnLoadItemProps) => {
  const isSuccess = !isLoading;

  const computedTitle =
    title ?? (isLoading ? "Tunggu sebentar ya" : "Selesai!");
  const computedDescription =
    description ??
    (isLoading ? "Sedang memuat data…" : "Data berhasil dimuat.");

  return (
    <AlertDialog open>
      <AlertDialogContent
        className={cn(
          "sm:max-w-[420px]",
          "overflow-hidden p-0",
          "border bg-background shadow-xl",
        )}
      >
        {/* Top accent + subtle progress shimmer */}
        <div
          className={cn(
            "relative h-1 w-full",
            isLoading ? "bg-primary/20" : "bg-emerald-500/20",
          )}
        >
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-1/2",
              isLoading
                ? "animate-[shimmer_1.2s_infinite] bg-primary/60"
                : "bg-emerald-500/60",
            )}
            style={{
              // fallback if your Tailwind doesn't include this animation name:
              // comment this out if you define @keyframes shimmer in global css
              transform: isLoading ? "translateX(-50%)" : "translateX(0)",
            }}
          />
        </div>

        <AlertDialogHeader className="gap-2 px-6 pb-6 pt-6">
          {/* Icon bubble */}
          <div
            className={cn(
              "mx-auto mb-1 grid h-14 w-14 place-items-center rounded-2xl",
              "ring-1 ring-border/60",
              isLoading
                ? "bg-primary/10 text-primary"
                : "bg-emerald-500/10 text-emerald-600",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                <span className="sr-only">Loading</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-7 w-7" />
                <span className="sr-only">Success</span>
              </>
            )}
          </div>

          <div className="text-center">
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              {computedTitle}
            </AlertDialogTitle>

            <AlertDialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {computedDescription}
            </AlertDialogDescription>

            {/* Small UX hint on success (optional) */}
            {!isLoading && showSuccessCloseHint && (
              <p className="mt-3 text-xs text-muted-foreground">
                Kamu bisa menutup dialog ini.
              </p>
            )}
          </div>

          {/* Extra detail row for loading */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary/70" />
              <span>Mohon jangan tutup halaman…</span>
            </div>
          )}
        </AlertDialogHeader>

        {/* Bottom area for nicer spacing / subtle background */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isLoading ? "Mengambil data" : "Selesai"}</span>
            <span className={cn(isLoading ? "text-primary" : "text-emerald-600")}>
              {isLoading ? "Loading…" : "Done"}
            </span>
          </div>
        </div>
      </AlertDialogContent>

      {/* If you don't have shimmer keyframes in your project, add this to globals.css:
        @keyframes shimmer {
          0% { transform: translateX(-60%); opacity: .35; }
          50% { opacity: .85; }
          100% { transform: translateX(160%); opacity: .35; }
        }
      */}
    </AlertDialog>
  );
};
