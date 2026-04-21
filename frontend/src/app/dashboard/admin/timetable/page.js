import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { canWriteSchedule, isStaff } from "@/lib/permissions";
import TimetableGeneratorClient from "@/components/admin/TimetableGeneratorClient";

export default async function TimetableGeneratorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (!isStaff(session.user.role)) {
    redirect("/dashboard/student");
  }

  if (!canWriteSchedule(session.user.role)) {
    redirect("/dashboard/admin");
  }

  const plans = await prisma.timetablePlan.findMany({
    where: {
      targetClass: session.user.assignedClass ?? undefined,
    },
    include: {
      requirements: true,
      entries: {
        orderBy: [{ day: "asc" }, { slotIndex: "asc" }],
      },
      createdBy: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Timetable Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Create weekly timetables for Monday to Friday and publish them from a
          selected effective date.
        </p>
      </div>

      <TimetableGeneratorClient initialPlans={plans} />
    </div>
  );
}
