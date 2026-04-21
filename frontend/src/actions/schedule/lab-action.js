"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canWriteSchedule } from "@/lib/permissions";

/**
 * Guard helper – throws a formatted error object if the current session
 * does not have schedule-write permission.  Call at the top of every mutation.
 */
async function requireScheduleWrite() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  if (!canWriteSchedule(session.user.role)) {
    return {
      error: "Access denied: you do not have permission to modify the schedule.",
    };
  }

  return null; // no error → caller may proceed
}

export async function createLabAllocation(formData) {
  const denied = await requireScheduleWrite();
  if (denied) return denied;

  try {
    const targetClass = formData.get("targetClass");
    const subject = formData.get("subject");
    const labName = formData.get("labName");
    const day = formData.get("day");
    const timeRange = formData.get("timeRange");

    const newAlloc = await prisma.labAllocation.create({
      data: {
        targetClass,
        subject,
        labName,
        day,
        timeRange,
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/student");
    return { success: true, id: newAlloc.id };
  } catch (error) {
    console.error("Failed to create lab allocation:", error);
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("labName")) {
        return {
          error: `Conflict: ${formData.get("labName")} is already booked on ${formData.get("day")} from ${formData.get("timeRange")}.`,
        };
      }
      if (error.meta?.target?.includes("targetClass")) {
        return {
          error: `Conflict: Class ${formData.get("targetClass")} already has a lab on ${formData.get("day")} from ${formData.get("timeRange")}.`,
        };
      }
      return { error: "Conflict: This allocation overlaps with an existing schedule." };
    }
    return { error: "Failed to create lab allocation" };
  }
}

export async function updateLabAllocation(id, formData) {
  const denied = await requireScheduleWrite();
  if (denied) return denied;

  try {
    const targetClass = formData.get("targetClass");
    const subject = formData.get("subject");
    const labName = formData.get("labName");
    const day = formData.get("day");
    const timeRange = formData.get("timeRange");

    await prisma.labAllocation.update({
      where: { id },
      data: {
        targetClass,
        subject,
        labName,
        day,
        timeRange,
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("Failed to update lab allocation:", error);
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("labName")) {
        return {
          error: `Conflict: ${formData.get("labName")} is already booked on ${formData.get("day")} from ${formData.get("timeRange")}.`,
        };
      }
      if (error.meta?.target?.includes("targetClass")) {
        return {
          error: `Conflict: Class ${formData.get("targetClass")} already has a lab on ${formData.get("day")} from ${formData.get("timeRange")}.`,
        };
      }
      return { error: "Conflict: This allocation overlaps with an existing schedule." };
    }
    return { error: "Failed to update lab allocation" };
  }
}

export async function deleteLabAllocation(id) {
  const denied = await requireScheduleWrite();
  if (denied) return denied;

  try {
    await prisma.labAllocation.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete lab allocation:", error);
    return { error: "Failed to delete lab allocation" };
  }
}
