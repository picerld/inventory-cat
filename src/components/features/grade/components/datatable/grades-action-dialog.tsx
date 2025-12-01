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
import { Loader } from "lucide-react";
import { useEffect } from "react";
import type { PaintGrade } from "~/types/pain-grade";
import { gradeFormSchema } from "../../form/grade";

type GradeActionDialogProps = {
  currentRow?: PaintGrade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GradesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: GradeActionDialogProps) {
  const isEdit = !!currentRow;
  const utils = trpc.useUtils();

  const { mutate: createGrade, isPending: isPendingCreate } =
    trpc.paintGrade.create.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Grade berhasil ditambahkan",
        });

        utils.paintGrade.getPaginated.invalidate();
        utils.paintGrade.getStats.invalidate();
        
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

  const { mutate: updateGrade, isPending: isPendingUpdate } =
    trpc.paintGrade.update.useMutation({
      onSuccess: () => {
        toast.success("Berhasil!!", {
          description: "Grade berhasil diperbarui!",
        });

        utils.paintGrade.getPaginated.invalidate();
        utils.paintGrade.getStats.invalidate();

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
      name: "",
      description: "",
    },
    // @ts-expect-error type
    validators: { onSubmit: gradeFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && currentRow) {
        updateGrade({ id: currentRow.id, ...value });
      } else {
        createGrade(value);
      }

      utils.supplier.getStats.invalidate();
    },
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      form.setFieldValue("name", currentRow.name);
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
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="backdrop-blur-xl">
        <DialogHeader className="text-start">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Grade" : "Tambah Grade Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[0.93rem]">
            {isEdit
              ? "Perbarui data grade di sini."
              : "Tambahkan grade baru di sini."}
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
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field>
                    <FieldLabel className="text-base">
                      Nama Grade <IsRequired />
                    </FieldLabel>
                    <Input
                      placeholder="A"
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
                      placeholder="Masukkan deskripsi supplier…"
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
