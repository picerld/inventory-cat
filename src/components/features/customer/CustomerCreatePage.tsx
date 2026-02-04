import { ChartNoAxesCombined, ChevronLeft, Plus } from "lucide-react";
import { Header } from "~/components/container/Header";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Button, buttonVariants } from "~/components/ui/button";
import { CustomerForm } from "./components/CustomerForm";
import Link from "next/link";

export default function CustomerCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Customer" />
      <Header
        title="Customer"
        subtitle="Manage your customer network and track performance"
      >
        <div className="flex gap-2">
          <Link
            href="/customers"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
            })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>
      <CustomerForm mode="create" />
    </GuardedLayout>
  );
}
