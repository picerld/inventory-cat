import { PaintbrushVertical } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "./components/LoginForm";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import Image from "next/image";

export default function LoginPage() {
  return (
    <>
      <HeadMetaData title="Auth" />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-between gap-2">
            <Link
              href="#"
              className="group flex items-center gap-3 font-medium"
            >
              <div className="relative flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-lg ring-2 transition-all group-hover:scale-105 group-hover:shadow-xl">
                <PaintbrushVertical className="size-6 text-secondary drop-shadow-md" />
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">
                  Cat Budi
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-linear-to-t from-black/10 to-transparent lg:block">
          <Image
            width={500}
            height={500}
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
