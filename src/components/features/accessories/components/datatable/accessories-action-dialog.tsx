"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { IsRequired } from "~/components/ui/is-required";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { formatPrice } from "~/lib/utils";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { PainAccessories } from "~/types/paint-accessories";
import { accessoriesFormSchema } from "../../form/accessories";

type AccessoriesActionDialogProps = {
  currentRow?: PainAccessories;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccessoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AccessoriesActionDialogProps) {
  const isEdit = !!currentRow;
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.authMe.useQuery();

  const { data: suppliers } = trpc.supplier.getAll.useQuery();

  const { mutate: createAcessories, isPending: isPendingCreate } =
    trpc.accessories.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Aksesoris berhasil ditambahkan",
        });

        utils.accessories.getPaginated.invalidate();
        utils.accessories.getStats.invalidate();

        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : "Coba periksa kembali form anda!",
        });
      },
    });

  const { mutate: updateAccessories, isPending: isPendingUpdate } =
    trpc.accessories.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Aksesoris berhasil diperbarui!",
        });

        utils.accessories.getPaginated.invalidate();
        utils.accessories.getStats.invalidate();

        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Gagal!!", {
          description:
            error.data?.code === "UNAUTHORIZED"
              ? "Silahkan login terlebih dahulu"
              : "Coba periksa kembali form anda!",
        });
      },
    });

  const form = useForm({
    defaultValues: {
      userId: user?.id ?? "",
      supplierId: "",
      name: "",
      qty: 0,
      supplierPrice: 0,
      sellingPrice: 0,
    },
    validators: { onSubmit: accessoriesFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && currentRow) {
        updateAccessories({ id: currentRow.id, ...value });
      } else {
        createAcessories(value);
      }

      utils.supplier.getStats.invalidate();
    },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      form.setFieldValue("name", currentRow.name);
      form.setFieldValue("qty", currentRow.qty);
      form.setFieldValue("supplierPrice", currentRow.supplierPrice);
      form.setFieldValue("sellingPrice", currentRow.sellingPrice);
      form.setFieldValue("supplierId", currentRow.supplierId);
    } else {
      form.reset();
    }
  }, [isEdit, currentRow]);

  const isLoading = isPendingCreate || isPendingUpdate;

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <SheetContent
        side="right"
        className="overflow-y-auto px-3 backdrop-blur-xl"
      >
        <form
          className="flex h-full flex-col gap-6 py-1 pe-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
        >
          <SheetHeader className="px-0">
            <SheetTitle className="text-2xl font-bold">
              {isEdit ? "Edit Aksesoris" : "Tambah Aksesoris Baru"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-[0.93rem]">
              {isEdit
                ? "Perbarui aksesoris di sini."
                : "Tambahkan aksesoris baru di sini."}
            </SheetDescription>
          </SheetHeader>

          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Nama Aksesoris <IsRequired />
                    </FieldLabel>
                    <Input
                      placeholder="Roller, Kuas, Selotip, dll."
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

            <form.Field name="supplierId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Pilih Supplier <IsRequired />
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="qty">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Kuantiti <IsRequired />
                    </FieldLabel>
                    <Input
                      placeholder="0"
                      className="h-12 rounded-xl border-2"
                      value={field.state.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.handleChange(Number(value));
                      }}
                    />

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="supplierPrice">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const raw = field.state.value ?? 0;
                const formatted = `Rp${formatPrice(raw)}`;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Harga Supplier <IsRequired />
                    </FieldLabel>

                    <Input
                      placeholder="Rp0"
                      className="h-12 rounded-xl border-2"
                      value={formatted}
                      onChange={(e) => {
                        let val = e.target.value;

                        val = val.replace(/^Rp\s?/, "");

                        const numeric = val.replace(/\D/g, "");

                        field.handleChange(Number(numeric));
                      }}
                      onFocus={(e) => {
                        if (!e.target.value.startsWith("Rp")) {
                          e.target.value = "Rp" + e.target.value;
                        }
                      }}
                    />

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="sellingPrice">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const raw = field.state.value ?? 0;
                const formatted = `Rp${formatPrice(raw)}`;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Harga Jual <IsRequired />
                    </FieldLabel>

                    <Input
                      placeholder="Rp0"
                      className="h-12 rounded-xl border-2"
                      value={formatted}
                      onChange={(e) => {
                        let val = e.target.value;

                        val = val.replace(/^Rp\s?/, "");

                        const numeric = val.replace(/\D/g, "");

                        field.handleChange(Number(numeric));
                      }}
                      onFocus={(e) => {
                        if (!e.target.value.startsWith("Rp")) {
                          e.target.value = "Rp" + e.target.value;
                        }
                      }}
                    />

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="font-medium"
              >
                {isLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : isEdit ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan Data"
                )}
              </Button>
            </Field>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
