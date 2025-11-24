import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChartNoAxesCombined, ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { FinishedGoodForm } from "./components/FinishedForm";

export default function FinishedCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Bahan Jadi" />
      <Link
        href="/items/finished"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>
      <Header
        title="Bahan Jadi"
        subtitle="Manage your Bahan Jadi network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      <FinishedGoodForm mode="create" />
    </GuardedLayout>
  );
}
