import { SignupForm } from "@/components/auth/SignupForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SigninPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up with username, email, mobile number, and password."
    >
      <SignupForm />
    </AuthLayout>
  );
}