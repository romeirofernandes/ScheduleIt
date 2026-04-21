import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { StudentScheduleCalendar } from "@/components/student/StudentScheduleCalendar";

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // Staff should never reach the student page
  if (isStaff(session.user.role)) {
    redirect("/dashboard/admin");
  }

  const userClass = session.user.studentClass || "FE";

  const labAllocations = await prisma.labAllocation.findMany({
    where: {
      targetClass: userClass,
    },
    orderBy: [{ day: "asc" }, { timeRange: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Weekly Schedule</h1>
        <p className="text-sm text-muted-foreground">
          {session.user.name || "Student"} - Class {userClass}
          {session.user.isCR && (
            <span className="ml-2 inline-flex items-center rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Class Representative
            </span>
          )}
        </p>
      </div>

      <StudentScheduleCalendar allocations={labAllocations} />
    </div>
  );
}
