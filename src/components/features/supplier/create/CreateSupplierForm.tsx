"use client";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { Loader, Building2, Plus } from "lucide-react";
import { supplierFormSchema } from "../form/supplier";
import { Textarea } from "~/components/ui/textarea";
import { IsRequired } from "~/components/ui/is-required";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type CreateSupplierFormProps = {
  className?: string;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (value: boolean) => void;
};

export function CreateSupplierForm({
  className,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: CreateSupplierFormProps) {
  const utils = trpc.useUtils();

  const { mutate: createSupplier, isPending } =
    trpc.supplier.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Supplier berhasil ditambahkan",
        });

        utils.supplier.getPaginated.invalidate();

        form.reset();
      },

      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          toast.error("Anda tidak memiliki akses!!", {
            description: "Silahkan login terlebih dahulu",
          });
        } else {
          toast.error("Supplier gagal ditambahkan!!", {
            description: "Coba periksa kembali form anda!",
          });
        }
      },
    });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: supplierFormSchema,
    },
    onSubmit: ({ value }) => {
      createSupplier(value);
    },
  });

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogTrigger asChild>
        <Button>
          Tambah <Plus className="ml-2 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Tambah Supplier Baru
          </DialogTitle>
          <p className="text-muted-foreground text-[0.93rem]">
            Isi form di bawah untuk menambah supplier baru
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <form
            className={cn("flex flex-col gap-6", className)}
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
                    "Tambah Data"
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
