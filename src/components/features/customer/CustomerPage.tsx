import { ChartNoAxesCombined, Plus } from "lucide-react";
import { Header } from "~/components/container/Header";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";

export default function CustomerPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Customer" />
      <Header
        title="Customer"
        subtitle="Manage your customer network and track performance"
      >
        <div className="flex gap-2">
          <Link
            href="/customers/create"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
              size: "lg",
            })}
          >
            <Plus className="h-4 w-4" />
            Tambah Data Customer
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>
    </GuardedLayout>
  );
}
