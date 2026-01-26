import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import ProfileLayout from "../../layouts/ProfileLayout";

export default function ProfileActivityPage() {
  const { data, isLoading } = trpc.profile.getMyProfile.useQuery();

  return (
    <GuardedLayout>
      <HeadMetaData title="Profile - Activity" />

      <Header
        title="Akun Saya"
        subtitle="Akses dan kelola informasi akun kamu di sini."
      />

      <ProfileLayout>
        <div className="mb-4">
          <h3 className="text-base font-semibold">Activity</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Informasi akun (basic).
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-medium">{data?.id}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {data?.createdAt
                  ? new Date(data.createdAt).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">
                {data?.updatedAt
                  ? new Date(data.updatedAt).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        )}
      </ProfileLayout>
    </GuardedLayout>
  );
}
