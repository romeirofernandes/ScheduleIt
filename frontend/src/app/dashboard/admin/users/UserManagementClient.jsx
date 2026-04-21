"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  StarIcon,
  UserCircleIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { assignUserRole, setStudentCR } from "@/actions/admin/user-action";
import { ROLES, getRoleLabel } from "@/lib/permissions";

const STUDENT_CLASSES = ["FE", "SE", "TE", "BE"];

const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: "Super Admin" },
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.TIMETABLE_SETTER, label: "Timetable Setter" },
  { value: ROLES.CLASS_TEACHER, label: "Class Teacher" },
  { value: ROLES.NORMAL_TEACHER, label: "Normal Teacher" },
  { value: ROLES.STUDENT, label: "Student" },
];

/** Colour ring per role for the badge */
function RoleBadge({ role }) {
  const colours = {
    SUPER_ADMIN: "bg-red-500/15 text-red-600 dark:text-red-400",
    ADMIN: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    TIMETABLE_SETTER: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    CLASS_TEACHER: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    NORMAL_TEACHER: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    STUDENT: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${colours[role] ?? "bg-muted text-muted-foreground"}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

export default function UserManagementClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  // Pending role assignment dialog state
  const [pendingAssign, setPendingAssign] = useState(null); // { userId, newRole, assignedClass }

  // Per-row select state (so selects are controlled without dialog yet)
  const [rowSelections, setRowSelections] = useState(() => {
    const init = {};
    initialUsers.forEach((u) => {
      init[u.id] = { role: u.role, assignedClass: u.assignedClass ?? "" };
    });
    return init;
  });

  const handleRoleSelectChange = (userId, value) => {
    setRowSelections((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], role: value, assignedClass: "" },
    }));
  };

  const handleClassSelectChange = (userId, value) => {
    setRowSelections((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], assignedClass: value },
    }));
  };

  const handleApplyRole = (userId) => {
    const sel = rowSelections[userId];
    if (!sel) return;
    setPendingAssign({
      userId,
      newRole: sel.role,
      assignedClass: sel.assignedClass || null,
    });
  };

  const confirmRoleAssign = () => {
    if (!pendingAssign) return;
    const { userId, newRole, assignedClass } = pendingAssign;

    startTransition(async () => {
      const res = await assignUserRole(userId, newRole, assignedClass);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  role: newRole,
                  assignedClass: newRole === ROLES.CLASS_TEACHER ? assignedClass : null,
                  // Clear isCR when promoting to staff
                  isCR: newRole === ROLES.STUDENT ? u.isCR : false,
                }
              : u
          )
        );
        toast.success(`Role updated to ${getRoleLabel(newRole)}`, {
          icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={1.8} className="text-green-500" />,
        });
      } else {
        toast.error(res.error, {
          icon: <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.8} className="text-destructive" />,
        });
      }
      setPendingAssign(null);
    });
  };

  const handleToggleCR = (userId, current) => {
    startTransition(async () => {
      const res = await setStudentCR(userId, !current);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isCR: !current } : u))
        );
        toast.success(!current ? "Marked as Class Representative" : "CR flag removed", {
          icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={1.8} className="text-green-500" />,
        });
      } else {
        toast.error(res.error, {
          icon: <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.8} className="text-destructive" />,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ROLE_OPTIONS.map(({ value, label }) => {
          const count = users.filter((u) => u.role === value).length;
          return (
            <Card key={value} className="bg-card/60 backdrop-blur border-border/60">
              <CardContent className="px-4 py-3 flex flex-col gap-1">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}s</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users table */}
      <Card className="shadow-lg bg-card/60 backdrop-blur border-border/60 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <CardTitle className="font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={UserMultiple02Icon} size={20} strokeWidth={1.8} className="text-primary" />
            All Users
          </CardTitle>
          <CardDescription>
            Change a user's role or toggle their Class Representative status.
            Role changes require confirmation.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-semibold text-foreground">User</TableHead>
                <TableHead className="font-semibold text-foreground">Current Role</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[200px]">Assign Role</TableHead>
                <TableHead className="font-semibold text-foreground">Class</TableHead>
                <TableHead className="font-semibold text-foreground">CR</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Apply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const sel = rowSelections[user.id] ?? { role: user.role, assignedClass: "" };
                const isStudent = user.role === ROLES.STUDENT;
                const pendingIsClassTeacher = sel.role === ROLES.CLASS_TEACHER;

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors duration-200"
                  >
                    {/* User info */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <HugeiconsIcon icon={UserCircleIcon} size={16} strokeWidth={1.8} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Current role badge */}
                    <TableCell>
                      <RoleBadge role={user.role} />
                      {user.isCR && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <HugeiconsIcon icon={StarIcon} size={10} strokeWidth={2} />
                          CR
                        </span>
                      )}
                      {user.assignedClass && user.role === ROLES.CLASS_TEACHER && (
                        <span className="ml-1.5 text-xs text-muted-foreground">({user.assignedClass})</span>
                      )}
                    </TableCell>

                    {/* Role selector */}
                    <TableCell>
                      <Select
                        value={sel.role}
                        onValueChange={(v) => handleRoleSelectChange(user.id, v)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Assigned class (only relevant for CLASS_TEACHER) */}
                    <TableCell>
                      {pendingIsClassTeacher ? (
                        <Select
                          value={sel.assignedClass}
                          onValueChange={(v) => handleClassSelectChange(user.id, v)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="h-8 text-xs w-[80px]">
                            <SelectValue placeholder="Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {STUDENT_CLASSES.map((c) => (
                              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* CR toggle */}
                    <TableCell>
                      {isStudent ? (
                        <Button
                          variant={user.isCR ? "default" : "outline"}
                          size="sm"
                          className={`h-7 px-2 text-xs ${user.isCR ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}`}
                          onClick={() => handleToggleCR(user.id, user.isCR)}
                          disabled={isPending}
                        >
                          <HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} className="mr-1" />
                          {user.isCR ? "CR" : "Set CR"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Apply button */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleApplyRole(user.id)}
                        disabled={isPending || sel.role === user.role}
                      >
                        {isPending ? (
                          <HugeiconsIcon icon={Loading03Icon} size={12} strokeWidth={1.8} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!pendingAssign}
        onOpenChange={(open) => !open && setPendingAssign(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAssign && (
                <>
                  You are changing this user's role to{" "}
                  <strong>{getRoleLabel(pendingAssign.newRole)}</strong>
                  {pendingAssign.newRole === ROLES.CLASS_TEACHER && pendingAssign.assignedClass
                    ? ` (Class ${pendingAssign.assignedClass})`
                    : ""}
                  . This will immediately affect their access permissions.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleAssign} disabled={isPending}>
              {isPending && (
                <HugeiconsIcon icon={Loading03Icon} size={14} strokeWidth={1.8} className="animate-spin mr-1" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
