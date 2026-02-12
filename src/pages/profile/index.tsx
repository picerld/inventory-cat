import { useEffect } from "react";
import { useRouter } from "next/router";
import GuardedLayout from "~/components/layout/GuardedLayout";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/general");
  }, [router]);

  return (
    <GuardedLayout>
      <p>Loading...</p>
    </GuardedLayout>
  );
}
