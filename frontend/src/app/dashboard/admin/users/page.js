import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageUsers } from "@/lib/permissions";
import { getAllUsers } from "@/actions/admin/user-action";
import UserManagementClient from "./UserManagementClient";

export const metadata = {
  title: "User Management – ScheduleIt",
  description: "Manage user roles and class representative flags.",
};

export default async function UserManagementPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (!canManageUsers(session.user.role)) {
    redirect("/dashboard/admin");
  }

  const result = await getAllUsers();

  if (result.error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full mx-auto px-4 py-4 md:px-8">
          <p className="text-destructive">{result.error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full mx-auto px-4 py-4 md:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Assign roles, manage class teachers, and configure Class Representatives.
            </p>
          </div>
        </header>

        <UserManagementClient initialUsers={result.users} />
      </div>
    </main>
  );
}
