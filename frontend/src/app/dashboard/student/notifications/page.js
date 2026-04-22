import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationSettingsClient } from "@/components/student/NotificationSettingsClient";
import { getStudentNotificationSettings } from "@/actions/notifications/student-notification-action";

export default async function StudentNotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  const data = await getStudentNotificationSettings();

  if (data.error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-6 text-sm text-destructive">{data.error}</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure where lecture reminders are delivered and test your next lecture email.
        </p>
      </div>

      <NotificationSettingsClient initialData={data} />
    </section>
  );
}
