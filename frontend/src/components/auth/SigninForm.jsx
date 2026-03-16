"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction } from "@/actions/auth/login-action";
import { Button } from "@/components/ui/button";
import { AtSignIcon, LockIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

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

export function SigninForm() {
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
        <InputGroup>
          <InputGroupInput
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="johndoe or john@example.com"
            required
          />
          <InputGroupAddon align="inline-start">
            <AtSignIcon className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground/90"
        >
          Password
        </label>
        <InputGroup>
          <InputGroupInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
          <InputGroupAddon align="inline-start">
            <LockIcon className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
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
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
