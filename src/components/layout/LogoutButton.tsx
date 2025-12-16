"use client";

import { CirclePower, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import Cookies from "js-cookie";

export const LogoutButton = () => {
  const router = useRouter();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      toast.success("Berhasil Logout!", {
        description: "Silahkan login kembali!",
      });

      router.push("/");
    },
    onError(error) {
      console.log(error);
      toast.error("Gagal Logout!", {
        description: "Silahkan coba lagi!",
      });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <Button
      variant="default"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="w-full"
    >
      {logoutMutation.isPending ? (
        <div className="flex items-center">
          <Loader className="mr-2 animate-spin" />
          Tunggu...
        </div>
      ) : (
        <p className="flex items-center gap-3">
          Logout
          <CirclePower className="size-5 text-secondary" />
        </p>
      )}
    </Button>
  );
};

    // <AlertDialog>
    //   <AlertDialogTrigger asChild>
    //   </AlertDialogTrigger>
    //   <AlertDialogContent>
    //     <AlertDialogHeader className="flex flex-col items-center">
    //       <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
    //         <Info className="text-secondary size-8" strokeWidth={2.5} />
    //       </div>
    //       <AlertDialogTitle className="text-center text-xl">
    //         Apakah anda yakin ingin logout?
    //       </AlertDialogTitle>
    //       <AlertDialogDescription className="text-center">
    //         Anda akan diarahkan ke halaman login.
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter className="mt-5 flex">
    //       <AlertDialogCancel className="w-1/2">Tidak, batal!</AlertDialogCancel>
    //       <AlertDialogAction
    //         onClick={handleLogout}
    //         className="w-1/2"
    //         disabled={logoutMutation.isPending}
    //       >
    //         {logoutMutation.isPending ? "Tunggu..." : "Ya, logout!"}
    //       </AlertDialogAction>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
