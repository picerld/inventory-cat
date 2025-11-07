import z from "zod";
import { passwordSchema, usernameSchema } from "~/schemas/auth";

export const loginFormSchema = z.object({
    username: usernameSchema,
    password: passwordSchema
});
