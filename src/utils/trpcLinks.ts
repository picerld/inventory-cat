import type { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import { queryClient } from "./queryClient";
import type { AppRouter } from "~/server/api/root";

export const authErrorLink: TRPCLink<AppRouter> = () => ({ op, next }) => {
  return observable((observer) => {
    const unsub = next(op).subscribe({
      next(value) {
        observer.next(value);
      },
      error(err) {
        if (err instanceof TRPCClientError) {
          if (err.data?.code === "UNAUTHORIZED") {
            if (err.message === "Token expired") {
              toast.error("Your session expired. Please log in again.");
            } else {
              toast.error("You are not authorized. Please log in.");
            }
            queryClient.setQueryData(["auth.authMe"], null);
          }
        }
        observer.error(err);
      },

      complete() {
        observer.complete();
      },
    });

    return unsub;
  });
};
