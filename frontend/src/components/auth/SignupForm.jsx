"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signupAction } from "@/actions/auth/signup-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialSignupActionState = {
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(
    signupAction,
    initialSignupActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-sm font-medium text-foreground/90"
        >
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="johndoe"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground/90"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="mobNumber"
          className="text-sm font-medium text-foreground/90"
        >
          Mobile Number
        </label>
        <Input
          id="mobNumber"
          name="mobNumber"
          type="tel"
          autoComplete="tel"
          placeholder="9876543210"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground/90"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
