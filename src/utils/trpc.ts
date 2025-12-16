import type { AppRouter } from '~/server/api/root';
import { createTRPCReact, TRPCClientError } from '@trpc/react-query';
import { toast } from 'sonner';
import Cookies from "js-cookie";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClientOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: { retry: false },
    },
  },
  onError: ( opts: { error: TRPCClientError<AppRouter> }) => {
    const { error } = opts;
    
    if (error.data?.code === "UNAUTHORIZED" && error.message === "Token expired") {
      toast.error("Your session has expired. Please log in again.");

      Cookies.remove("auth.token");
      
      window.location.href = "/login";
    }
  },
};
