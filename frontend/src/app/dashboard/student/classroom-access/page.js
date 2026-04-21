import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { ROLES } from "@/lib/permissions";
import { ClassroomAccessClient } from "@/components/student/ClassroomAccessClient";
import { getClassroomAccessRequestsForCR } from "@/actions/schedule/classroom-access-action";

export default async function ClassroomAccessPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard/admin");
  }

  if (!session.user.isCR) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Classroom Access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is only available for Class Representatives.
        </p>
      </div>
    );
  }

  const response = await getClassroomAccessRequestsForCR();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Classroom Access Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Request classroom usage after lecture hours and submit lock proof
          before leaving.
        </p>
      </div>

      <ClassroomAccessClient initialRequests={response.requests ?? []} />
    </div>
  );
}
