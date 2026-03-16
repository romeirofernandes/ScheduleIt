"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { parseLoginForm } from "@/lib/validations/auth";

export async function loginAction(_prevState, formData) {
  const parsed = parseLoginForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid login data.",
    };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });

    return {
      error: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Invalid username/email or password.",
        };
      }

      return {
        error: "Authentication failed. Please try again.",
      };
    }

    throw error;
  }
}
