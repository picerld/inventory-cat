"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { Loader } from "lucide-react";
import { updateProfileSchema } from "../form/profile";
import { useRouter } from "next/navigation";

export default function ProfileForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data, isLoading, isError, error } =
    trpc.profile.getMyProfile.useQuery();

  const { mutate: updateProfile, isPending } =
    trpc.profile.updateMyProfile.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil", {
          description: "Profile berhasil diperbarui",
        });

        await utils.profile.getMyProfile.invalidate();
        router.refresh();
      },
      onError: (e) => {
        toast.error("Gagal", { description: e.message });
      },
    });

  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    // @ts-expect-error tanstack form zod resolver not typed yet
    validators: { onSubmit: updateProfileSchema },
    onSubmit: async ({ value }) => {
      updateProfile({
        name: value.name,
        username: value.username,
        currentPassword: value.currentPassword || null,
        newPassword: value.newPassword || null,
        confirmNewPassword: value.confirmNewPassword || null,
      });
    },
  });

  React.useEffect(() => {
    if (data) {
      form.setFieldValue("name", data.name ?? "");
      form.setFieldValue("username", data.username ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-xl border p-6">
        <p className="text-sm font-semibold">Gagal memuat profile.</p>
        <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <form
        className="flex flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-base font-semibold">Informasi Akun</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Ubah nama dan username untuk akun kamu.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-sm">
                        Nama <IsRequired />
                      </FieldLabel>
                      <Input
                        className="h-11 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="username">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-sm">
                        Username <IsRequired />
                      </FieldLabel>
                      <Input
                        className="h-11 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-base font-semibold">Ubah Password</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Kosongkan jika tidak ingin mengganti password.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="currentPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-sm">Password Lama</FieldLabel>
                      <Input
                        type="password"
                        className="h-11 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="newPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-sm">Password Baru</FieldLabel>
                      <Input
                        type="password"
                        className="h-11 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="confirmNewPassword">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-sm">
                        Konfirmasi Password
                      </FieldLabel>
                      <Input
                        type="password"
                        className="h-11 rounded-xl border-2"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="font-medium">
            {isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
