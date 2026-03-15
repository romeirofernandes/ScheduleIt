import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your username/email and password.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
