import { SigninForm } from "@/components/auth/SigninForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your username/email and password."
    >
      <SigninForm />
    </AuthLayout>
  );
}
