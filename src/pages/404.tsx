import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-primary text-7xl font-bold tracking-tight">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold">
          Page not found
        </h2>

        <p className="text-muted-foreground mt-2 text-sm">
          Maaf, halaman yang Anda cari tidak ditemukan.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Footer hint */}
        <p className="text-muted-foreground mt-8 text-xs">
          If you think this is a mistake, please contact the administrator.
        </p>
      </div>
    </div>
  );
}
