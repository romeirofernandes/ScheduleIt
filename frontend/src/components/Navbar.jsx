"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GlassSurface from "@/components/GlassSurface";
import {
  Calendar01Icon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

function NavLink({ href = "#", children }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleBrandClick = (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div
        className={cn(
          "mx-auto transition-all duration-300 ease-out",
          scrolled ? "max-w-5xl" : "max-w-6xl",
        )}
      >
        <GlassSurface
          active={scrolled}
          height={60}
          borderRadius={18}
          backgroundOpacity={scrolled ? (isDark ? 0.2 : 0.52) : 0}
          blur={scrolled ? 14 : 0}
          saturation={1.2}
          isDark={isDark}
          className="transition-all duration-300 ease-out"
        >
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <a
              href="#"
              onClick={handleBrandClick}
              className="flex items-center gap-2"
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
            </a>

            <nav className="hidden items-center gap-7 md:flex">
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#team">Team</NavLink>
            </nav>

            <div className="flex items-center gap-2">
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
                  <HugeiconsIcon
                    icon={Moon02Icon}
                    size={16}
                    strokeWidth={1.8}
                  />
                )}
              </Button>

              {status === "authenticated" ? (
                <>
                  <span className="hidden max-w-36 truncate px-2 text-sm text-foreground/80 sm:inline">
                    {session?.user?.name ?? session?.user?.email}
                  </span>
                  <Button size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signin">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
}
