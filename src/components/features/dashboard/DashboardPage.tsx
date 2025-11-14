import { Header } from "~/components/container/Header";
import GuardedLayout from "~/components/layout/GuardedLayout";
import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";
import DashboardCharts from "./components/DashboardChart";
import { HeadMetaData } from "~/components/meta/HeadMetaData";

export default function DashboardPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Dashboard" />
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today"
      />

      <div className="mt-6 space-y-6">
        <DashboardStats />
        <DashboardCharts />
        <RecentActivity />
      </div>
    </GuardedLayout>
  );
}
