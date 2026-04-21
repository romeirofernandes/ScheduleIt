import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { ROLES } from "@/lib/permissions";
import { getClassroomRequestsForTeacher } from "@/actions/schedule/classroom-access-action";
import ClassroomRequestsReviewClient from "@/components/admin/ClassroomRequestsReviewClient";

export default async function ClassroomRequestsReviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== ROLES.CLASS_TEACHER) {
    redirect("/dashboard/admin");
  }

  const response = await getClassroomRequestsForTeacher();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          CR Classroom Lock Confirmation
        </h1>
        <p className="text-sm text-muted-foreground">
          Verify classroom lock proof images and finalize room closure for your
          class.
        </p>
      </div>

      <ClassroomRequestsReviewClient
        initialRequests={response.requests ?? []}
      />
    </div>
  );
}
