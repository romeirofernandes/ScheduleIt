"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore, useTransition } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { cn } from "@/lib/utils";
import { toggleThemeWithViewTransition } from "@/lib/theme-transition";
import {
  getRoleLabel,
  canManageUsers,
  canWriteSchedule,
  ROLES,
} from "@/lib/permissions";
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
  Calendar01Icon,
  Logout01Icon,
  Moon02Icon,
  Sun03Icon,
  UserCircleIcon,
  UserMultiple02Icon,
  Building03Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";

/**
 * Returns the navigation groups dynamically based on the user's role.
 * Items are filtered so that each role only sees what it can access.
 */
function buildNavigationGroups(role) {
  const groups = [];

  // ── Overview group (visible to all staff) ─────────────────────────────────
  groups.push({
    label: "Overview",
    items: [
      {
        title: "Allocations",
        href: "/dashboard/admin",
        icon: Calendar01Icon, // Changed to Calendar icon
      },
    ],
  });

  if (canWriteSchedule(role)) {
    groups.push({
      label: "Scheduling",
      items: [
        {
          title: "Timetable Generator",
          href: "/dashboard/admin/timetable",
          icon: BookOpen01Icon,
        },
      ],
    });
  }

  // ── Admin group (SUPER_ADMIN only) ────────────────────────────────────────
  if (canManageUsers(role)) {
    groups.push({
      label: "Administration",
      items: [
        {
          title: "User Management",
          href: "/dashboard/admin/users",
          icon: UserMultiple02Icon,
        },
      ],
    });
  }

  // ── Class teacher workflow ─────────────────────────────────────────────────
  if (role === ROLES.CLASS_TEACHER) {
    groups.push({
      label: "Class Teacher",
      items: [
        {
          title: "Lock Proof Reviews",
          href: "/dashboard/admin/classroom-requests",
          icon: Building03Icon,
        },
      ],
    });
  }

  return groups;
}

export function AdminSidebar({ userName, userRole }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  const navigationGroups = buildNavigationGroups(userRole);
  const roleLabel = getRoleLabel(userRole);

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
              render={<Link href="/dashboard/admin" />}
              size="lg"
              className="data-active:bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent"
              isActive={pathname === "/dashboard/admin"}
              tooltip="ScheduleIt"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-foreground">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">ScheduleIt</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {roleLabel} Portal
                </span>
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
                      isActive={pathname.startsWith(item.href)}
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
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {userName || "Administrator"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-sidebar-foreground/70">
                <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
                {roleLabel}
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0 bg-muted-foreground/30" />
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <Button
              onClick={() => toggleThemeWithViewTransition(resolvedTheme, setTheme)}
              variant="secondary"
              className="w-full"
              tooltip="Toggle theme"
            >
              {isDark ? (
                <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
              ) : (
                <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
              )}
              <span>Toggle theme</span>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              onClick={handleLogout}
              disabled={isPending}
              tooltip="Sign Out"
              variant="destructive"
              className={cn("w-full", isPending && "cursor-not-allowed")}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
              <span>{isPending ? "Signing out" : "Sign Out"}</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
