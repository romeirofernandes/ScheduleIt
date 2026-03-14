"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Team", href: "#team" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-2.5 shadow-sm backdrop-blur-xl sm:px-6">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-primary-foreground">
                <rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <path d="M1 6.5h13" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ScheduleIt
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button asChild size="sm">
              <a href="#cta">Book a Resource</a>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {mobileOpen ? (
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M3 5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-1.5 overflow-hidden rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 border-t border-border/60 pt-3">
                  <Button asChild className="w-full">
                    <a href="#cta" onClick={() => setMobileOpen(false)}>
                      Book a Resource
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
