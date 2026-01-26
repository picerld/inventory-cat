"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { Textarea } from "~/components/ui/textarea";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReturnGood } from "~/types/return-good";
import { returnedGoodFormSchema } from "../../form/returned-good";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";

type ReturnGoodActionDialogProps = {
  currentRow?: ReturnGood;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReturnGoodsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ReturnGoodActionDialogProps) {
  const isEdit = !!currentRow;
  const utils = trpc.useUtils();

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const { data: user } = trpc.auth.authMe.useQuery();

  const { data: finishedGoods } = trpc.finishedGood.getAll.useQuery();

  const { mutate: createReturned, isPending: isPendingCreate } =
    trpc.returnGood.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!", {
          description: "Barang retur berhasil ditambahkan.",
        });

        utils.returnGood.getPaginated.invalidate();
        utils.returnGood.getStats.invalidate();

        form.reset();
        onOpenChange(false);
      },
    });

  const { mutate: updateReturned, isPending: isPendingUpdate } =
    trpc.returnGood.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!", {
          description: "Barang retur berhasil diperbarui.",
        });

        utils.returnGood.getPaginated.invalidate();
        utils.returnGood.getStats.invalidate();

        form.reset();
        onOpenChange(false);
      },
    });

  const form = useForm({
    defaultValues: {
      userId: user?.id ?? "",
      finishedGoodId: "",
      qty: 0,
      from: "",
      description: "",
    },
    validators: {
      // @ts-expect-error type
      onSubmit: returnedGoodFormSchema,
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateReturned({ id: currentRow.id, ...value });
      } else {
        createReturned(value);
      }
    },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      form.setFieldValue("userId", currentRow.userId);
      form.setFieldValue("finishedGoodId", currentRow.finishedGoodId);
      form.setFieldValue("qty", currentRow.qty);
      form.setFieldValue("from", currentRow.from);
      form.setFieldValue("description", currentRow.description ?? "");
    } else {
      form.reset();
    }
  }, [isEdit, currentRow]);

  const isLoading = isPendingCreate || isPendingUpdate;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="backdrop-blur-xl sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Barang Retur" : "Tambah Barang Retur"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-[0.93rem]">
            {isEdit
              ? "Perbarui data barang retur di sini."
              : "Tambahkan barang retur di sini."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6 py-1 pe-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="finishedGoodId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Barang Jadi <IsRequired />
                    </FieldLabel>

                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-[200px] justify-between"
                          disabled={isEdit}
                        >
                          {field.state.value
                            ? finishedGoods?.find(
                                (fg) => fg.id === field.state.value,
                              )?.name
                            : "Pilih Barang Jadi"}

                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search framework..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {finishedGoods?.map((finishedGood) => (
                                <CommandItem
                                  key={finishedGood.id}
                                  value={finishedGood.id}
                                  onSelect={(currentValue) => {
                                    field.handleChange(currentValue);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  {finishedGood.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      finishedGood.id === field.state.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

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
                      Jumlah <IsRequired />
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

            <form.Field name="from">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Dari <IsRequired />
                    </FieldLabel>

                    <Input
                      placeholder="Contoh: Customer, Gudang, QC..."
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
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">Deskripsi</FieldLabel>

                  <Textarea
                    placeholder="Masukkan deskripsi retur (opsional)…"
                    className="h-32"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="py-6 font-medium"
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
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
