"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Loader } from "lucide-react";
import { securitySchema } from "../form/profile";

export default function ProfileSecurityForm() {
  const utils = trpc.useUtils();
  const { data: me } = trpc.profile.getMyProfile.useQuery();

  const { mutate, isPending } = trpc.profile.updateMyProfile.useMutation({
    onSuccess: async () => {
      toast.success("Berhasil", { description: "Password berhasil diubah" });
      await utils.profile.getMyProfile.invalidate();
    },
    onError: (e) => toast.error("Gagal", { description: e.message }),
  });

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: { onSubmit: securitySchema },
    onSubmit: async ({ value }) => {
      if (!me) return;

      mutate({
        name: me.name,
        username: me.username,
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        confirmNewPassword: value.confirmNewPassword,
      });
    },
  });

  return (
    <div className="pt-2">
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="currentPassword">
            {(field) => {
              const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel>Password Lama</FieldLabel>
                  <Input
                    type="password"
                    className="h-11 rounded-xl border-2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="newPassword">
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Password Baru</FieldLabel>
                    <Input
                      type="password"
                      className="h-11 rounded-xl border-2"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmNewPassword">
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Konfirmasi Password</FieldLabel>
                    <Input
                      type="password"
                      className="h-11 rounded-xl border-2"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
