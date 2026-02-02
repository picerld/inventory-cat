"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Loader2, TriangleAlert, ShieldAlert } from "lucide-react";

type ConfirmActionDialogProps = {
  trigger: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  processingText?: string;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  requireText?: string;
  closeOnError?: boolean;
  disableCancelOnLoading?: boolean;
};

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  processingText = "Processing…",
  variant = "default",
  icon,
  isLoading = false,
  disabled = false,
  onConfirm,
  open,
  onOpenChange,
  requireText,
  closeOnError = false,
  disableCancelOnLoading = false,
}: ConfirmActionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(false);
  const [confirmInput, setConfirmInput] = React.useState<string>("");

  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open : internalOpen;

  const needsText = typeof requireText === "string" && requireText.trim().length > 0;
  const typedOk = !needsText || confirmInput.trim() === requireText;

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
    if (!v) setConfirmInput("");
  };

  const confirmDisabled = disabled || isLoading || !typedOk;

  const defaultConfirmText = React.useMemo(() => {
    if (confirmText) return confirmText;
    return variant === "destructive" ? "Yes, delete" : "Confirm";
  }, [confirmText, variant]);

  const defaultIcon =
    variant === "destructive" ? (
      <ShieldAlert className="h-6 w-6" />
    ) : (
      <TriangleAlert className="h-6 w-6" />
    );

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      if (closeOnError) setOpen(false);
    }
  };

  return (
    <AlertDialog open={actualOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-120 gap-0 p-0 overflow-hidden">
        <div
          className={cn(
            "h-1.5 w-full",
            variant === "destructive" ? "bg-destructive" : "bg-primary"
          )}
        />

        <div className="p-6 space-y-5">
          <AlertDialogHeader className="space-y-0">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "shrink-0 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  variant === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {icon ?? defaultIcon}
              </div>

              <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                <AlertDialogTitle className="text-lg font-semibold leading-tight">
                  {title}
                </AlertDialogTitle>

                {description && (
                  <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </AlertDialogDescription>
                )}
              </div>
            </div>
          </AlertDialogHeader>

          {variant === "destructive" && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <p className="text-xs font-medium text-destructive">
                Tindakan ini tidak dapat dibatalkan. Pastikan Anda yakin sebelum
                melanjutkan.
              </p>
            </div>
          )}

          {needsText && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Type to confirm
                  </label>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Ketikan{" "}
                  <code className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {requireText}
                  </code>{" "}
                  untuk mengonfirmasi.
                </p>
              </div>

              <input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className={cn(
                  "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm font-mono transition-all outline-none",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-offset-1",
                  typedOk && confirmInput.length > 0
                    ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                    : confirmInput.length > 0
                    ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                    : "border-input focus:border-ring focus:ring-ring/20"
                )}
                aria-label="Type required confirmation text"
                placeholder={requireText}
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
            </div>
          )}
        </div>

        <AlertDialogFooter className="bg-muted/30 px-6 py-4 gap-3 sm:gap-3 flex-row sm:flex-row sm:justify-end border-t">
          <AlertDialogCancel 
            disabled={disableCancelOnLoading ? isLoading : false}
            className="mt-0 hover:bg-background"
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
              disabled={confirmDisabled}
              variant={variant === "destructive" ? "destructive" : "default"}
              className={cn(
                "min-w-30 shadow-sm",
                variant === "destructive" && "hover:bg-destructive/90 text-white"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingText}
                </>
              ) : (
                defaultConfirmText
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}