import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import ProfileLayout from "../../layouts/ProfileLayout";
import ProfileForm from "../../components/ProfileForm";

export default function ProfileGeneralPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Profile - General" />

      <Header
        title="Akun Saya"
        subtitle="Akses dan kelola informasi akun kamu di sini."
      />

      <ProfileLayout>
        <div className="mb-4">
          <h3 className="text-base font-semibold">General</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Update nama dan username kamu.
          </p>
        </div>

        <ProfileForm />
      </ProfileLayout>
    </GuardedLayout>
  );
}
