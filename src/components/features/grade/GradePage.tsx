import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { GradesProvider } from "./components/datatable/grade-provider";
import GradeStatsContainer from "./components/GradeStatsContainer";
import { GradesTable } from "./components/datatable/grades-table";
import { GradesDialogs } from "./components/datatable/grades-dialog";
import { Button } from "~/components/ui/button";
import { ChartNoAxesCombined } from "lucide-react";

export default function GradePage() {
  return (
    <GradesProvider>
      <GuardedLayout>
        <HeadMetaData title="Grade" />
        <Header
          title="Grade"
          subtitle="Manage your Grade network and track performance"
        >
          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </Header>

        <GradeStatsContainer />

        <GradesTable />

        <GradesDialogs />
      </GuardedLayout>
    </GradesProvider>
  );
}
