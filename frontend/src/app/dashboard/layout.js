"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth/logout-action";
import { LogOut, Home } from "lucide-react";
import { useTransition } from "react";

export default function DashboardLayout({ children }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="font-bold text-lg font-serif">S</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              ScheduleIt
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isPending}
              className="rounded-full shadow-sm hover:shadow-md transition-shadow font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
