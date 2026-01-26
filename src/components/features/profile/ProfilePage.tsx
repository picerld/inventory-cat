import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import ProfileForm from "./components/ProfileForm";

export default function ProfilePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Profile" />

      <Header
        title="Profile"
        subtitle="Update data akun dan password kamu"
      />

      <ProfileForm />
    </GuardedLayout>
  );
}
