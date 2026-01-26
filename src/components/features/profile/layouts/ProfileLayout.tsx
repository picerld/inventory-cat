"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";
import { User, Shield, Activity } from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
};

const items: Item[] = [
  {
    href: "/profile/general",
    label: "General",
    icon: User,
    description: "Update nama & username",
  },
  {
    href: "/profile/security",
    label: "Security",
    icon: Shield,
    description: "Ganti password akun",
  },
  {
    href: "/profile/activity",
    label: "Activity",
    icon: Activity,
    description: "Riwayat & info akun",
  },
];

export default function ProfileLayout({
  title = "Profile",
  subtitle = "Kelola informasi akun kamu",
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 sm:min-h-[70vh]">
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          </div>

          <nav className="space-y-2">
            {items.map((it) => {
              const active = pathname === it.href;

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition",
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border",
                      active ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <it.icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{it.label}</p>
                    {it.description ? (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {it.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <section className="lg:col-span-8">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {children}
        </div>
      </section>
    </div>
  );
}
