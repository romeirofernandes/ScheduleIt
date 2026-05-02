"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const LECTURES_ENDS_AT = "15:30";

function parseTimeToMinutes(timeValue) {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
    return null;
  }

  const [hours, minutes] = timeValue.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function toStartOfDay(dateInput) {
  if (!dateInput) return null;
  const parsed = new Date(`${dateInput}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function requireCR() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  if (session.user.role !== ROLES.STUDENT || !session.user.isCR) {
    return {
      error: "Only Class Representatives can request late classroom access.",
    };
  }

  if (!session.user.studentClass) {
    return {
      error:
        "Your student class is missing. Contact admin to complete profile setup.",
    };
  }

  return { session };
}

async function requireClassTeacher() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  if (session.user.role !== ROLES.CLASS_TEACHER) {
    return { error: "Only Class Teachers can review lock proofs." };
  }

  if (!session.user.assignedClass) {
    return { error: "No assigned class found for your account." };
  }

  return { session };
}

export async function createClassroomAccessRequest(formData) {
  const access = await requireCR();
  if (access.error) return { error: access.error };

  const classroomName = String(formData.get("classroomName") ?? "").trim();
  const requestedDateInput = String(formData.get("requestedDate") ?? "").trim();
  const requestedStartTime = String(
    formData.get("requestedStartTime") ?? "",
  ).trim();
  const requestedEndTime = String(
    formData.get("requestedEndTime") ?? "",
  ).trim();
  const purpose = String(formData.get("purpose") ?? "").trim();

  if (
    !classroomName ||
    !requestedDateInput ||
    !requestedStartTime ||
    !requestedEndTime ||
    !purpose
  ) {
    return { error: "All fields are required." };
  }

  const startMinutes = parseTimeToMinutes(requestedStartTime);
  const endMinutes = parseTimeToMinutes(requestedEndTime);
  const minStartMinutes = parseTimeToMinutes(LECTURES_ENDS_AT);
  const requestedDate = toStartOfDay(requestedDateInput);

  if (
    startMinutes === null ||
    endMinutes === null ||
    minStartMinutes === null
  ) {
    return { error: "Invalid time format. Please use valid time values." };
  }

  if (!requestedDate) {
    return { error: "Invalid date selected." };
  }

  if (startMinutes < minStartMinutes) {
    return {
      error:
        "Classroom access can only start after all lectures are done (after 3:30 PM).",
    };
  }

  if (endMinutes <= startMinutes) {
    return { error: "End time must be later than start time." };
  }

  try {
    const classTeacher = await prisma.user.findFirst({
      where: {
        role: ROLES.CLASS_TEACHER,
        assignedClass: access.session.user.studentClass,
      },
      select: {
        id: true,
      },
    });

    if (!classTeacher) {
      return {
        error:
          "No Class Teacher is assigned for your class yet. Ask admin to assign one first.",
      };
    }

    const overlappingRequest = await prisma.classroomAccessRequest.findFirst({
      where: {
        classroomName,
        requestedDate,
        status: {
          not: "LOCK_REJECTED",
        },
        requestedStartTime: {
          lt: requestedEndTime,
        },
        requestedEndTime: {
          gt: requestedStartTime,
        },
      },
    });

    if (overlappingRequest) {
      return {
        error: "This classroom is already booked or has a pending request during the specified time.",
      };
    }

    const request = await prisma.classroomAccessRequest.create({
      data: {
        requestedById: access.session.user.id,
        classTeacherId: classTeacher.id,
        studentClass: access.session.user.studentClass,
        classroomName,
        requestedDate,
        requestedStartTime,
        requestedEndTime,
        purpose,
      },
      include: {
        classTeacher: {
          select: {
            username: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/student/classroom-access");
    revalidatePath("/dashboard/admin/classroom-requests");

    return { success: true, request };
  } catch (error) {
    console.error("Failed to create classroom access request:", error);
    return { error: "Could not create classroom access request." };
  }
}

export async function getClassroomAccessRequestsForCR() {
  const access = await requireCR();
  if (access.error) return { error: access.error };

  try {
    const requests = await prisma.classroomAccessRequest.findMany({
      where: {
        requestedById: access.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        classTeacher: {
          select: {
            username: true,
          },
        },
      },
    });

    return { requests };
  } catch (error) {
    console.error("Failed to load CR requests:", error);
    return { error: "Failed to load classroom access requests." };
  }
}

export async function submitLockProof(requestId, imageUrl) {
  const access = await requireCR();
  if (access.error) return { error: access.error };

  if (!requestId || !imageUrl) {
    return { error: "Missing request reference or lock proof image." };
  }

  try {
    const existing = await prisma.classroomAccessRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requestedById: true,
        status: true,
      },
    });

    if (!existing || existing.requestedById !== access.session.user.id) {
      return { error: "Request not found." };
    }

    if (existing.status !== "APPROVED") {
      return {
        error:
          "Lock proof can only be uploaded after the Class Teacher approves your request.",
      };
    }

    await prisma.classroomAccessRequest.update({
      where: { id: requestId },
      data: {
        lockProofImageUrl: imageUrl,
        lockProofSubmittedAt: new Date(),
        status: "LOCK_PROOF_SUBMITTED",
      },
    });

    revalidatePath("/dashboard/student/classroom-access");
    revalidatePath("/dashboard/admin/classroom-requests");

    return { success: true };
  } catch (error) {
    console.error("Failed to submit lock proof:", error);
    return { error: "Failed to submit lock proof." };
  }
}

export async function approveClassroomAccessRequest(requestId, remarks = "") {
  const access = await requireClassTeacher();
  if (access.error) return { error: access.error };

  if (!requestId) {
    return { error: "Request ID is required." };
  }

  try {
    const existing = await prisma.classroomAccessRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        classTeacherId: true,
        status: true,
      },
    });

    if (!existing || existing.classTeacherId !== access.session.user.id) {
      return { error: "Request not found." };
    }

    if (existing.status !== "REQUESTED") {
      return { error: "Only newly requested entries can be approved." };
    }

    const normalizedRemarks = remarks?.trim() ? remarks.trim() : null;

    const updatedCount = await prisma.$executeRaw`
      UPDATE "ClassroomAccessRequest"
      SET
        "status" = 'APPROVED'::"ClassroomAccessStatus",
        "teacherRemarks" = ${normalizedRemarks},
        "updatedAt" = NOW()
      WHERE "id" = ${requestId}
    `;

    if (!updatedCount) {
      return { error: "Request not found." };
    }

    revalidatePath("/dashboard/admin/classroom-requests");
    revalidatePath("/dashboard/student/classroom-access");

    return { success: true };
  } catch (error) {
    console.error("Failed to approve classroom request:", error);
    return { error: "Failed to approve classroom request." };
  }
}

export async function rejectClassroomAccessRequest(requestId, remarks = "") {
  const access = await requireClassTeacher();
  if (access.error) return { error: access.error };

  if (!requestId) {
    return { error: "Request ID is required." };
  }

  try {
    const existing = await prisma.classroomAccessRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        classTeacherId: true,
        status: true,
      },
    });

    if (!existing || existing.classTeacherId !== access.session.user.id) {
      return { error: "Request not found." };
    }

    if (
      existing.status !== "REQUESTED" &&
      existing.status !== "LOCK_PROOF_SUBMITTED"
    ) {
      return { error: "This request is already finalized." };
    }

    await prisma.classroomAccessRequest.update({
      where: { id: requestId },
      data: {
        status: "LOCK_REJECTED",
        teacherRemarks: remarks?.trim() ? remarks.trim() : null,
        teacherConfirmedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/classroom-requests");
    revalidatePath("/dashboard/student/classroom-access");

    return { success: true };
  } catch (error) {
    console.error("Failed to reject classroom request:", error);
    return { error: "Failed to reject classroom request." };
  }
}

export async function getClassroomRequestsForTeacher() {
  const access = await requireClassTeacher();
  if (access.error) return { error: access.error };

  try {
    const requests = await prisma.classroomAccessRequest.findMany({
      where: {
        classTeacherId: access.session.user.id,
        studentClass: access.session.user.assignedClass,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requestedBy: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return { requests };
  } catch (error) {
    console.error("Failed to load teacher requests:", error);
    return { error: "Failed to load classroom requests." };
  }
}

export async function confirmClassroomLock(requestId, confirmed, remarks = "") {
  const access = await requireClassTeacher();
  if (access.error) return { error: access.error };

  if (!requestId) {
    return { error: "Request ID is required." };
  }

  try {
    const existing = await prisma.classroomAccessRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        classTeacherId: true,
        status: true,
      },
    });

    if (!existing || existing.classTeacherId !== access.session.user.id) {
      return { error: "Request not found." };
    }

    if (existing.status !== "LOCK_PROOF_SUBMITTED") {
      return {
        error: "Lock confirmation can happen only after proof is submitted.",
      };
    }

    await prisma.classroomAccessRequest.update({
      where: { id: requestId },
      data: {
        status: confirmed ? "LOCK_CONFIRMED" : "LOCK_REJECTED",
        teacherRemarks: remarks?.trim() ? remarks.trim() : null,
        teacherConfirmedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/classroom-requests");
    revalidatePath("/dashboard/student/classroom-access");

    return { success: true };
  } catch (error) {
    console.error("Failed to finalize classroom lock confirmation:", error);
    return { error: "Failed to finalize lock confirmation." };
  }
}
