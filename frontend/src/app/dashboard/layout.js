"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth/logout-action";
import {
  Calendar01Icon,
  Moon02Icon,
  Sun03Icon,
  Home01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-[60px] flex items-center justify-between">
          {/* Brand — identical to landing Navbar */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
              <HugeiconsIcon
                icon={Calendar01Icon}
                size={15}
                strokeWidth={1.8}
                className="text-primary-foreground"
              />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ScheduleIt
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — identical to landing Navbar */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.8} />
              ) : (
                <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.8} />
              )}
            </Button>

            {/* Home — Link wraps Button so flex is guaranteed */}
            <Link href="/" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-3"
              >
                <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8} />
                Home
              </Button>
            </Link>

            {/* Sign Out */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              disabled={isPending}
              className={cn(
                "h-8 gap-1.5 px-3 transition-all",
                isPending && "opacity-60 cursor-not-allowed"
              )}
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={16}
                strokeWidth={1.8}
                className={isPending ? "animate-pulse" : ""}
              />
              {isPending ? "Signing out…" : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
