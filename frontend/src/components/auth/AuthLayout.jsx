"use client";

import Link from "next/link";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import LandingBackground from "@/components/LandingBackground";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function ThemeToggleBtn() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="secondary" size="icon" disabled>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.8} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.8} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4">
      <LandingBackground />

      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="secondary" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggleBtn />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="relative mx-auto flex w-full flex-col justify-between gap-y-6 border-y px-4 py-12">
            <PlusIcon className="absolute left-[-11.5px] top-[-12.5px] z-10 size-6 text-muted-foreground" strokeWidth={1} />
            <PlusIcon className="absolute right-[-11.5px] top-[-12.5px] z-10 size-6 text-muted-foreground" strokeWidth={1} />
            <PlusIcon className="absolute bottom-[-12.5px] left-[-11.5px] z-10 size-6 text-muted-foreground" strokeWidth={1} />
            <PlusIcon className="absolute bottom-[-12.5px] right-[-11.5px] z-10 size-6 text-muted-foreground" strokeWidth={1} />

            <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
            <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />

            <div className="mb-2 flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-balance text-muted-foreground">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
