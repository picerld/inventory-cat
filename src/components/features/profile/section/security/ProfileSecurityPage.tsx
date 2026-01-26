import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import ProfileLayout from "../../layouts/ProfileLayout";
import ProfileSecurityForm from "../../components/ProfileSecurityForm";

export default function ProfileSecurityPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Profile - Security" />

      <Header
        title="Akun Saya"
        subtitle="Akses dan kelola informasi akun kamu di sini."
      />

      <ProfileLayout>
        <div className="mb-4">
          <h3 className="text-base font-semibold">Security</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Ganti password akun kamu.
          </p>
        </div>

        <ProfileSecurityForm />
      </ProfileLayout>
    </GuardedLayout>
  );
}
