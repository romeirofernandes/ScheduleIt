"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { ROLES } from "@/lib/permissions";
import {
  getNextLectureForClass,
  resolveNotificationEmail,
  sendNextLectureNotificationToUser,
} from "@/lib/student-notifications";

function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function requireStudentSession() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  if (session.user.role !== ROLES.STUDENT) {
    return { error: "Only students can manage notification settings." };
  }

  return { session };
}

export async function getStudentNotificationSettings() {
  const access = await requireStudentSession();
  if (access.error) return { error: access.error };

  const user = await prisma.user.findUnique({
    where: { id: access.session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      notificationEmail: true,
      notificationEnabled: true,
      studentClass: true,
    },
  });

  if (!user) {
    return { error: "User profile not found." };
  }

  const nextLecture = await getNextLectureForClass(user.studentClass);

  return {
    user,
    effectiveNotificationEmail: resolveNotificationEmail(user),
    nextLecture,
  };
}

export async function updateStudentNotificationSettings(formData) {
  const access = await requireStudentSession();
  if (access.error) return { error: access.error };

  const notificationEmailRaw = String(formData.get("notificationEmail") || "")
    .trim()
    .toLowerCase();

  const notificationEnabled = String(formData.get("notificationEnabled") || "true") === "true";

  if (notificationEmailRaw && !isValidEmail(notificationEmailRaw)) {
    return { error: "Please enter a valid notification email address." };
  }

  try {
    const accountUser = await prisma.user.findUnique({
      where: { id: access.session.user.id },
      select: { email: true },
    });

    const normalizedNotificationEmail =
      notificationEmailRaw && notificationEmailRaw !== accountUser?.email?.toLowerCase()
        ? notificationEmailRaw
        : null;

    await prisma.user.update({
      where: { id: access.session.user.id },
      data: {
        notificationEmail: normalizedNotificationEmail,
        notificationEnabled,
      },
    });

    revalidatePath("/dashboard/student/notifications");

    return { success: true };
  } catch (error) {
    console.error("Failed to update student notification settings:", error);
    return { error: "Could not update notification settings." };
  }
}

export async function sendMyNextLectureNotification() {
  const access = await requireStudentSession();
  if (access.error) return { error: access.error };

  try {
    const user = await prisma.user.findUnique({
      where: { id: access.session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        notificationEmail: true,
        notificationEnabled: true,
        studentClass: true,
      },
    });

    if (!user) {
      return { error: "User profile not found." };
    }

    const result = await sendNextLectureNotificationToUser(user);

    if (result.sent) {
      return {
        success: true,
        to: result.to,
        lecture: result.lecture,
      };
    }

    if (result.reason === "disabled") {
      return { error: "Notifications are disabled. Enable them first." };
    }

    if (result.reason === "missing-email") {
      return {
        error:
          "No email found for notifications. Add a notification email in settings.",
      };
    }

    if (result.reason === "missing-class") {
      return {
        error:
          "Your class is not configured yet. Contact admin to update your profile.",
      };
    }

    if (result.reason === "no-upcoming-lecture") {
      return {
        error: "No upcoming lecture found for your class.",
      };
    }

    return { error: "Could not send email notification right now." };
  } catch (error) {
    console.error("Failed to send next lecture notification:", error);
    return { error: "Failed to send next lecture notification." };
  }
}
