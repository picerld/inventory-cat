"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";

import { trpc } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { customerFormSchema } from "../form/customer";

type Props = {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    phone?: string | null;
    address?: string | null;
  } | null;
};

export function CustomerForm({ mode, initialData }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const invalidate = async () => {
    await Promise.all([
      utils.customer.getAll.invalidate(),
      ...(initialData?.id
        ? [utils.customer.getById.invalidate({ id: initialData.id })]
        : []),
    ]);
  };

  const form = useForm({
    defaultValues: {
      id: initialData?.id ?? "",
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
    },
    // @ts-expect-error tanstack form
    validators: { onSubmit: customerFormSchema },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createCustomer({
          name: value.name,
          phone: value.phone || null,
          address: value.address || null,
        });
      } else {
        updateCustomer({
          id: value.id,
          name: value.name,
          phone: value.phone || null,
          address: value.address || null,
        });
      }
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldValue("id", initialData.id);
      form.setFieldValue("name", initialData.name);
      form.setFieldValue("phone", initialData.phone ?? "");
      form.setFieldValue("address", initialData.address ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id]);

  const { mutate: createCustomer, isPending: isCreating } =
    trpc.customer.create.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!", {
          description: "Customer berhasil dibuat.",
        });
        await invalidate();
        form.reset();
        router.push("/customers");
      },
      onError: (e) =>
        toast.error("Gagal", {
          description: e.message || "Tidak bisa membuat customer.",
        }),
    });

  const { mutate: updateCustomer, isPending: isUpdating } =
    trpc.customer.update.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil!", {
          description: "Customer berhasil diupdate.",
        });
        await invalidate();
        router.push("/customers");
      },
      onError: (e) =>
        toast.error("Gagal", {
          description: e.message || "Tidak bisa update customer.",
        }),
    });

  const loading = isCreating || isUpdating;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Tambah Customer" : "Edit Customer"}
        </CardTitle>
        <CardDescription>
          Isi data customer untuk transaksi penjualan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Nama <IsRequired />
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nama customer"
                      disabled={loading}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <Field>
                  <FieldLabel>Phone (opsional)</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="address">
              {(field) => (
                <Field>
                  <FieldLabel>Alamat (opsional)</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Alamat customer"
                    rows={3}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Simpan" : "Update"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/customers")}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
