import z from "zod";

export const usernameSchema = z
  .string({ message: "Username is required" })
  .min(2, { message: "Username must be at least 2 characters" })
  .max(20, { message: "Username must be less than 20 characters" });

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(2, { message: "Password must be at least 2 characters" });
