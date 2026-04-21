import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaff } from "@/lib/permissions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // All staff roles (SUPER_ADMIN, ADMIN, TIMETABLE_SETTER, CLASS_TEACHER, NORMAL_TEACHER)
  // are directed to the admin-area interface.
  // Only STUDENT goes to the student interface.
  if (isStaff(session.user.role)) {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/student");
  }
}
