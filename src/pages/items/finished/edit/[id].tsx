import { ChartNoAxesCombined, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Header } from "~/components/container/Header";
import { FinishedGoodForm } from "~/components/features/finished/components/FinishedForm";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Button, buttonVariants } from "~/components/ui/button";
import { trpc } from "~/utils/trpc";

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: initialData } = trpc.finishedGood.getById.useQuery({
    id,
  });

  return (
    <GuardedLayout>
      <HeadMetaData title="Edit Barang Jadi" />

      <Link
        href="/items/finished"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>
      <Header
        title="Edit Barang Jadi"
        subtitle="Manage your Barang Jadi network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      {/* @ts-expect-error type */}
      <FinishedGoodForm mode="edit" initialData={initialData} />
    </GuardedLayout>
  );
}
