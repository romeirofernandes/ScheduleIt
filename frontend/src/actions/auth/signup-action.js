"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { parseSignupForm } from "@/lib/validations/auth";

export async function signupAction(_prevState, formData) {
  const parsed = parseSignupForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid sign up data.",
    };
  }

  const username = parsed.data.username.toLowerCase();
  const email = parsed.data.email.toLowerCase();
  const { mobNumber, password } = parsed.data;

  let existingUser;

  try {
    existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
          { mobNumber },
        ],
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error:
          "Database access failed. Please verify database user permissions and connection settings.",
      };
    }

    throw error;
  }

  if (existingUser) {
    if (existingUser.username === username) {
      return { error: "Username is already taken." };
    }

    if (existingUser.email === email) {
      return { error: "Email is already registered." };
    }

    return { error: "Mobile number is already registered." };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.user.create({
      data: {
        username,
        email,
        mobNumber,
        passwordHash,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error:
          "Could not create account due to a database permission/configuration issue.",
      };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      identifier: email,
      password,
      redirectTo: "/",
    });

    return {
      error: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created, but auto login failed. Please login manually.",
      };
    }

    throw error;
  }
}
