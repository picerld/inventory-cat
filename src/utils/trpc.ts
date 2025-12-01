import type { AppRouter } from '~/server/api/root';
import { createTRPCReact, TRPCClientError } from '@trpc/react-query';
import { toast } from 'sonner';

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
      
      window.location.href = "/login";
    }
  },
};
