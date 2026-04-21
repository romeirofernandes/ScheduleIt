import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isStaff, canWriteSchedule } from "@/lib/permissions";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (!isStaff(session.user.role)) {
    redirect("/dashboard/student");
  }

  // Fetch lab allocations
  const labAllocations = await prisma.labAllocation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const canWrite = canWriteSchedule(session.user.role);

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full mx-auto px-4 py-4 md:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {canWrite
                ? "Manage lab allocations and schedules."
                : "View lab allocations and schedules."}
            </p>
          </div>
        </header>

        <AdminDashboardClient
          initialLabAllocations={labAllocations}
          canWrite={canWrite}
        />
      </div>
    </main>
  );
}
