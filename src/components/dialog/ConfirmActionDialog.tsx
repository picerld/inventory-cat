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
import { Loader2, TriangleAlert } from "lucide-react";

type ConfirmActionDialogProps = {
  trigger: React.ReactNode; // usually a <Button/>
  title: React.ReactNode;
  description?: React.ReactNode;

  confirmText?: string;
  cancelText?: string;

  variant?: "default" | "destructive";
  icon?: React.ReactNode;

  isLoading?: boolean;
  disabled?: boolean;

  /**
   * Called when user confirms.
   * If you return a Promise, dialog stays open until it resolves (nice for mutations).
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Optional: control dialog open state externally.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /**
   * Optional: require typing to confirm (good for destructive)
   */
  requireText?: string; // e.g. "CANCEL"
};

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Back",
  variant = "default",
  icon,
  isLoading = false,
  disabled = false,
  onConfirm,
  open,
  onOpenChange,
  requireText,
}: ConfirmActionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [confirmInput, setConfirmInput] = React.useState("");

  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
    if (!v) setConfirmInput("");
  };

  const needsText = typeof requireText === "string" && requireText.length > 0;
  const confirmDisabled =
    disabled ||
    isLoading ||
    (needsText && confirmInput.trim() !== requireText);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // keep dialog open if you want; usually toast handles errors
      // you can decide to close it on error by calling setOpen(false)
    }
  };

  return (
    <AlertDialog open={actualOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-120">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex items-center justify-center",
              )}
            >
              {icon ?? (
                <TriangleAlert
                  className={cn(
                    "h-5 w-5 text-muted-foreground",
                    variant === "destructive" && "text-destructive",
                  )}
                />
              )}
            </div>

            <div className="min-w-0">
              <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
              {description ? (
                <AlertDialogDescription className="mt-1">
                  {description}
                </AlertDialogDescription>
              ) : null}
            </div>
          </div>

          {needsText ? (
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground text-sm">
                Type <span className="font-medium text-foreground">{requireText}</span>{" "}
                to confirm.
              </p>
              <input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={requireText}
                disabled={isLoading}
              />
            </div>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
              disabled={confirmDisabled}
              variant={variant === "destructive" ? "destructive" : "default"}
              className={`min-w-30 ${variant === "destructive" ? "text-white" : ""}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
