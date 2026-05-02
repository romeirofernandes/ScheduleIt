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
  <div style="
    background: #f4f4f5;
    padding: 24px;
    font-family: 'Outfit', Arial, sans-serif;
    color: #111827;
  ">
    <div style="
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    ">
      
      <!-- Header -->
      <div style="
        background: #f97316;
        color: #ffffff;
        padding: 16px 20px;
        font-weight: 600;
        font-size: 18px;
      ">
        ScheduleIt
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">
          Hello <strong style="color:#111827;">${userName}</strong>,
        </p>

        <p style="margin: 0 0 20px; font-size: 14px; color: #6b7280;">
          Here is your upcoming lecture:
        </p>

        <!-- Highlight Card -->
        <div style="
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 16px;
        ">
          <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">
            SUBJECT
          </p>
          <p style="margin: 0; font-size: 18px; font-weight: 600;">
            ${lecture.subject}
          </p>
        </div>

        <!-- Details -->
        <div style="font-size: 14px;">
          <p style="margin: 6px 0;"><strong>Class:</strong> ${studentClass}</p>
          <p style="margin: 6px 0;"><strong>Type:</strong> ${lecture.entryType}</p>
          <p style="margin: 6px 0;">
            <strong>When:</strong> ${startSummary} (${lecture.startLabel} - ${lecture.endLabel})
          </p>
          <p style="margin: 6px 0;"><strong>Venue:</strong> ${lecture.venue}</p>
        </div>

        <!-- Divider -->
        <div style="
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        "></div>

        <!-- Footer -->
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          All the best for your lecture.
        </p>
        <p style="margin: 4px 0 0; font-size: 13px; font-weight: 500;">
          — ScheduleIt
        </p>
      </div>
    </div>
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
