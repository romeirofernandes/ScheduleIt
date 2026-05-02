"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signupAction } from "@/actions/auth/signup-action";
import { Button } from "@/components/ui/button";
import {
  AtSignIcon,
  LockIcon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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
          className="text-sm font-medium text-foreground/90 mb-1"
        >
          Username
        </label>
        <InputGroup>
          <InputGroupInput
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="johndoe"
            required
          />
          <InputGroupAddon align="inline-start">
            <UserIcon className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground/90 mb-1"
        >
          Email
        </label>
        <InputGroup>
          <InputGroupInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            required
          />
          <InputGroupAddon align="inline-start">
            <AtSignIcon className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="mobNumber"
          className="text-sm font-medium text-foreground/90 mb-1"
        >
          Mobile Number
        </label>
        <InputGroup>
          <InputGroupInput
            id="mobNumber"
            name="mobNumber"
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            required
          />
          <InputGroupAddon align="inline-start">
            <SmartphoneIcon className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground/90 mb-1"
        >
          Password
        </label>
        <InputGroup>
          <InputGroupInput
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
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
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
