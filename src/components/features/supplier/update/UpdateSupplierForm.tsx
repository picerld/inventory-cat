"use client";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { User, Loader } from "lucide-react";
import { supplierFormSchema } from "../form/supplier";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { IsRequired } from "~/components/ui/is-required";
import { Textarea } from "~/components/ui/textarea";

type UpdateSupplierFormProps = {
  supplierId: string;
  open: boolean;
  onClose: () => void;
};

export function UpdateSupplierForm({
  supplierId,
  open,
  onClose,
}: UpdateSupplierFormProps) {
  const utils = trpc.useUtils();

  const form = useForm({
    defaultValues: {
      id: supplierId,
      name: "",
      description: "",
    },
    validators: {
      onSubmit: supplierFormSchema,
    },
    onSubmit: ({ value }) => {
      updateSupplier.mutate(value);
    },
  });

  const updateSupplier = trpc.supplier.update.useMutation({
    onSuccess: () => {
      toast.success("Berhasil!!", {
        description: "Supplier berhasil diperbarui!",
      });

      utils.supplier.getPaginated.invalidate();

      form.reset();
      onClose();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Anda tidak memiliki akses!!", {
          description: "Silahkan login terlebih dahulu",
        });
      } else {
        toast.error("Supplier gagal diubah!!", {
          description: "Coba periksa kembali form anda!",
        });
      }
    },
  });

  const { refetch } = trpc.supplier.getById.useQuery(
    { id: supplierId },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (open) {
      refetch().then((res) => {
        if (res.data) {
          form.reset({
            id: supplierId,
            name: res.data.name ?? "",
            description: res.data.description ?? "",
          });
        }
      });
    }
  }, [open, supplierId, refetch]);

  const isPending = updateSupplier.isPending;

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Update Supplier Baru
          </DialogTitle>
          <p className="text-muted-foreground text-[0.93rem]">
            Isi form di bawah untuk mengubah data supplier
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <form
            className="flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">
                        Nama Supplier <IsRequired />
                      </FieldLabel>
                      <Input
                        type="text"
                        placeholder="PT. Budi Abadi"
                        className="h-12 rounded-xl border-2"
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

              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-base">Deskripsi</FieldLabel>
                      <Textarea
                        id="description"
                        placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        rows={4}
                        className="h-32"
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

              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="py-6 font-medium"
                >
                  {isPending ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
