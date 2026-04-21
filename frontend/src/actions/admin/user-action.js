"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canManageUsers, ROLES } from "@/lib/permissions";

/**
 * Guard helper – returns an error object if the current session lacks
 * user-management permission (SUPER_ADMIN only).
 */
async function requireUserManagement() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  if (!canManageUsers(session.user.role)) {
    return {
      error: "Access denied: only a Super Admin can manage user roles.",
    };
  }

  return null;
}

/**
 * Assign a new role to a user.
 * @param {string} userId
 * @param {string} newRole  – must be a value from the Role enum
 * @param {string|null} assignedClass – required when newRole === CLASS_TEACHER
 */
export async function assignUserRole(userId, newRole, assignedClass = null) {
  const denied = await requireUserManagement();
  if (denied) return denied;

  // Validate role value
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(newRole)) {
    return { error: `Invalid role: ${newRole}` };
  }

  // CLASS_TEACHER must have an assignedClass
  if (newRole === ROLES.CLASS_TEACHER && !assignedClass) {
    return { error: "A Class Teacher must have an assigned class." };
  }

  // Non-class-teacher roles should not have an assignedClass
  const resolvedAssignedClass =
    newRole === ROLES.CLASS_TEACHER ? assignedClass : null;

  // When promoting to a staff role, clear isCR (only students can be CR)
  const isCR = newRole === ROLES.STUDENT ? undefined : false;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        assignedClass: resolvedAssignedClass,
        ...(isCR !== undefined && { isCR }),
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign role:", error);
    return { error: "Failed to update user role." };
  }
}

/**
 * Toggle the isCR (Class Representative) flag for a student.
 * Only students can be CR. If the target user is not a student, this is rejected.
 * @param {string} userId
 * @param {boolean} isCR
 */
export async function setStudentCR(userId, isCR) {
  const denied = await requireUserManagement();
  if (denied) return denied;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.role !== ROLES.STUDENT) {
      return { error: "Only students can be assigned the Class Representative flag." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isCR },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to set CR flag:", error);
    return { error: "Failed to update CR status." };
  }
}

/**
 * Fetch all users (for the user management page).
 * SUPER_ADMIN only.
 */
export async function getAllUsers() {
  const denied = await requireUserManagement();
  if (denied) return { error: denied.error };

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        studentClass: true,
        assignedClass: true,
        isCR: true,
        createdAt: true,
      },
    });
    return { users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: "Failed to load users." };
  }
}
