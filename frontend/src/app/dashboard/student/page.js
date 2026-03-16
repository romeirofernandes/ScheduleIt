import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentScheduleCalendar } from "@/components/student/StudentScheduleCalendar";

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
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
        </p>
      </div>

      <StudentScheduleCalendar allocations={labAllocations} />
    </div>
  );
}
