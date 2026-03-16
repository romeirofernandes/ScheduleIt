import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/student");
  }

  // Fetch lab allocations
  const labAllocations = await prisma.labAllocation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage lab allocations and schedules.
            </p>
          </div>
          <div className="text-sm font-medium bg-secondary/30 px-4 py-2 rounded-full border border-border/60">
            Welcome, {session.user.name}
          </div>
        </header>

        <AdminDashboardClient initialLabAllocations={labAllocations} />
      </div>
    </main>
  );
}
