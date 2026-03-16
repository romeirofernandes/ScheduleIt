import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username or email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters."),
  email: z.string().trim().email("Please enter a valid email."),
  mobNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, "Mobile number must be 10 to 15 digits."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function parseSigninForm(formData) {
  return loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
}

export function parseSignupForm(formData) {
  return signupSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    mobNumber: formData.get("mobNumber"),
    password: formData.get("password"),
  });
}
