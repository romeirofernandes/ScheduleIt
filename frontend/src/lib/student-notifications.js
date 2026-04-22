import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function parse24HourTime(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

function parse12HourTime(value) {
  if (!value) return null;

  const parsed = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!parsed) {
    return null;
  }

  let hours = Number(parsed[1]);
  const minutes = Number(parsed[2]);
  const period = parsed[3].toUpperCase();

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function toDisplayTime(hours, minutes) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function nextOccurrence(day, time, now) {
  const targetDayIndex = DAY_INDEX[day];
  if (targetDayIndex === undefined || !time) {
    return null;
  }

  const candidate = new Date(now);
  candidate.setHours(time.hours, time.minutes, 0, 0);

  const dayDelta = (targetDayIndex - now.getDay() + 7) % 7;
  candidate.setDate(now.getDate() + dayDelta);

  if (dayDelta === 0 && candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

function parseLabAllocationRange(timeRange) {
  if (!timeRange) return null;

  const [startPart, endPart] = timeRange.split("-").map((item) => item.trim());
  const start = parse12HourTime(startPart);
  const end = parse12HourTime(endPart);

  if (!start || !end) {
    return null;
  }

  return {
    start,
    end,
    startLabel: startPart,
    endLabel: endPart,
  };
}

export function resolveNotificationEmail(user) {
  const configured = String(user.notificationEmail || "").trim().toLowerCase();
  const account = String(user.email || "").trim().toLowerCase();

  return configured || account || null;
}

function formatLectureDateTime(date) {
  return date.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

async function getOfficialEntries(studentClass, now) {
  const plan = await prisma.timetablePlan.findFirst({
    where: {
      targetClass: studentClass,
      status: "PUBLISHED",
      effectiveFrom: {
        lte: now,
      },
    },
    include: {
      entries: true,
    },
    orderBy: {
      effectiveFrom: "desc",
    },
  });

  if (!plan) {
    return [];
  }

  return plan.entries
    .map((entry) => {
      const start = parse24HourTime(entry.startTime);
      const end = parse24HourTime(entry.endTime);

      if (!start || !end) {
        return null;
      }

      return {
        day: entry.day,
        subject: entry.subjectName,
        entryType: entry.entryType,
        venue: entry.classroom || "TBA",
        start,
        end,
        startLabel: toDisplayTime(start.hours, start.minutes),
        endLabel: toDisplayTime(end.hours, end.minutes),
      };
    })
    .filter(Boolean);
}

async function getFallbackEntries(studentClass) {
  const allocations = await prisma.labAllocation.findMany({
    where: {
      targetClass: studentClass,
    },
    orderBy: {
      day: "asc",
    },
  });

  return allocations
    .map((allocation) => {
      const parsedRange = parseLabAllocationRange(allocation.timeRange);
      if (!parsedRange) {
        return null;
      }

      return {
        day: allocation.day,
        subject: allocation.subject,
        entryType: "LAB",
        venue: allocation.labName,
        start: parsedRange.start,
        end: parsedRange.end,
        startLabel: parsedRange.startLabel,
        endLabel: parsedRange.endLabel,
      };
    })
    .filter(Boolean);
}

export async function getNextLectureForClass(studentClass, now = new Date()) {
  if (!studentClass) {
    return null;
  }

  const officialEntries = await getOfficialEntries(studentClass, now);
  const sourceEntries = officialEntries.length
    ? officialEntries
    : await getFallbackEntries(studentClass);

  if (!sourceEntries.length) {
    return null;
  }

  const withDates = sourceEntries
    .map((entry) => {
      const startsAt = nextOccurrence(entry.day, entry.start, now);
      if (!startsAt) {
        return null;
      }

      return {
        ...entry,
        startsAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startsAt - b.startsAt);

  return withDates[0] || null;
}

function buildEmailContent({ userName, studentClass, lecture }) {
  const subject = `ScheduleIt: Next lecture - ${lecture.subject}`;
  const startSummary = formatLectureDateTime(lecture.startsAt);

  const text = [
    `Hello ${userName},`,
    "",
    "Here is your next lecture update from ScheduleIt:",
    `Class: ${studentClass}`,
    `Subject: ${lecture.subject}`,
    `Type: ${lecture.entryType}`,
    `When: ${startSummary} (${lecture.startLabel} - ${lecture.endLabel})`,
    `Venue: ${lecture.venue}`,
    "",
    "All the best for your lecture.",
    "- ScheduleIt",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">ScheduleIt Lecture Notification</h2>
      <p style="margin: 0 0 12px;">Hello <strong>${userName}</strong>,</p>
      <p style="margin: 0 0 12px;">Here is your next lecture update:</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 520px;">
        <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">Class</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>${studentClass}</strong></td></tr>
        <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">Subject</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>${lecture.subject}</strong></td></tr>
        <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">Type</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${lecture.entryType}</td></tr>
        <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">When</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${startSummary} (${lecture.startLabel} - ${lecture.endLabel})</td></tr>
        <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">Venue</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${lecture.venue}</td></tr>
      </table>
      <p style="margin: 14px 0 0;">All the best for your lecture.<br/>- ScheduleIt</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendNextLectureNotificationToUser(user) {
  if (!user?.studentClass) {
    return { skipped: true, reason: "missing-class" };
  }

  if (!user.notificationEnabled) {
    return { skipped: true, reason: "disabled" };
  }

  const to = resolveNotificationEmail(user);
  if (!to) {
    return { skipped: true, reason: "missing-email" };
  }

  const lecture = await getNextLectureForClass(user.studentClass);
  if (!lecture) {
    return { skipped: true, reason: "no-upcoming-lecture" };
  }

  const { subject, text, html } = buildEmailContent({
    userName: user.username || "Student",
    studentClass: user.studentClass,
    lecture,
  });

  await sendEmail({
    to,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    to,
    lecture,
  };
}

export async function sendNextLectureNotificationsForClass(studentClass) {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      studentClass,
      notificationEnabled: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      notificationEmail: true,
      notificationEnabled: true,
      studentClass: true,
    },
  });

  let sent = 0;
  const skipped = [];

  for (const student of students) {
    try {
      const result = await sendNextLectureNotificationToUser(student);
      if (result.sent) {
        sent += 1;
      } else if (result.skipped) {
        skipped.push({ userId: student.id, reason: result.reason });
      }
    } catch (error) {
      skipped.push({ userId: student.id, reason: "send-failed" });
      console.error("Failed to send lecture notification", error);
    }
  }

  return {
    sent,
    skipped,
    total: students.length,
  };
}
