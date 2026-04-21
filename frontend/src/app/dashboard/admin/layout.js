import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/permissions";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardBreadcrumb } from "@/components/shared/DashboardBreadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // Students cannot access the admin area — redirect them home
  if (!isStaff(session.user.role)) {
    redirect("/dashboard/student");
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        userName={session.user.name}
        userRole={session.user.role}
      />
      <SidebarInset className="overflow-hidden rounded-xl md:rounded-2xl">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <DashboardBreadcrumb />
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
