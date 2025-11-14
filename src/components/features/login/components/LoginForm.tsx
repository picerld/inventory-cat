"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { loginFormSchema } from "../forms/login";
import { trpc } from "~/utils/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff, User, Lock, Shield, Loader } from "lucide-react";
import Cookies from "js-cookie";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { mutate: loginUser, isPending } = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Sukses!", {
        description: "Mengarahkan ke halaman dashboard",
      });

      Cookies.set("auth.token", data.token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: error.message,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: ({ value }) => {
      loginUser(value);
    },
  });

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
      {...props}
    >
      <FieldGroup>
        <div className="mb-4 flex flex-col gap-3 text-center">
          <div className="bg-primary mx-auto mb-2 flex size-16 items-center justify-center rounded-2xl shadow-lg">
            <Shield className="size-8 text-white" />
          </div>
          <h1 className="text-primary text-4xl font-extrabold tracking-tight">
            Selamat Datang!
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Sign in untuk mengakses dashboard
          </p>
        </div>

        <form.Field name="username">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel className="text-sm font-semibold">
                  Username
                </FieldLabel>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    className="h-12 rounded-xl border-2 pl-10"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel className="text-sm font-semibold">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-2 px-10"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex items-center justify-end">
          <Link
            href="#"
            className="text-primary hover:text-primary/80 text-sm font-semibold underline-offset-4 transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Field>
          <Button
            type="submit"
            disabled={isPending}
            className="py-6 font-medium text-white"
          >
            {isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Sign in to Dashboard"
            )}
          </Button>
        </Field>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="border-muted w-full border-t-2" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="text-muted-foreground bg-background px-3">
              Secure Login
            </span>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-sm">
          Need help?{" "}
          <Link
            href="#"
            className="text-primary font-semibold underline-offset-4 transition-colors hover:underline"
          >
            Contact support
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
