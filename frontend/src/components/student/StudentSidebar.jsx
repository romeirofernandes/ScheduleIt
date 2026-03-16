"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore, useTransition } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Calendar01Icon,
  Logout01Icon,
  Moon02Icon,
  Sun03Icon,
  TimeQuarter02Icon,
} from "@hugeicons/core-free-icons";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Schedule",
        href: "/dashboard/student",
        icon: BookOpen01Icon,
      },
    ],
  },
];

export function StudentSidebar({ userName, studentClass }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isDark = mounted && resolvedTheme === "dark";

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard/student" />}
              size="lg"
              className="data-active:bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent"
              isActive={pathname === "/dashboard/student"}
              tooltip="ScheduleIt"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-foreground">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">ScheduleIt</span>
                <span className="truncate text-xs text-sidebar-foreground/70">Student Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      tooltip={item.title}
                      isActive={item.href === "/dashboard/student" ? pathname.startsWith(item.href) : pathname === item.href}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{userName || "Student"}</p>
              <p className="mt-1 text-xs text-sidebar-foreground/70">Class {studentClass || "FE"}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-sidebar-foreground/80">
                <HugeiconsIcon icon={TimeQuarter02Icon} strokeWidth={2} />
                Weekly timetable
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
            ) : (
              <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
            )}
          </Button>

          <Button
            variant="destructive"
            className={cn("flex-1 justify-start", state === "collapsed" && "hidden")}
            onClick={handleLogout}
            disabled={isPending}
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} data-icon="inline-start" />
            {isPending ? "Signing out" : "Sign Out"}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
