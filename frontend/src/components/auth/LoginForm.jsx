"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction } from "@/actions/auth/login-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialAuthActionState = {
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="identifier"
          className="text-sm font-medium text-foreground/90"
        >
          Username or Email
        </label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="johndoe or john@example.com"
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
          autoComplete="current-password"
          placeholder="Enter your password"
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
        New here?{" "}
        <Link
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
