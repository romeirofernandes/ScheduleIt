"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const BREAK_WINDOWS = [
  { start: "10:45", end: "11:00", label: "Short Break" },
  { start: "13:00", end: "13:30", label: "Long Break" },
];

const BASE_SLOTS = [
  { start: "08:45", end: "09:45" },
  { start: "09:45", end: "10:45" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:30", end: "14:30" },
  { start: "14:30", end: "15:30" },
];

const EXTENDED_SLOT = { start: "15:30", end: "16:30" };

const TIMETABLE_SETTER_ROLES = [
  ROLES.TIMETABLE_SETTER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

function normalizeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function toSessionRequirements(requirements) {
  const normalized = [];

  for (const item of requirements) {
    const subjectName = String(item.subjectName ?? "").trim();
    const theoryHours = normalizeNumber(item.theoryHours);
    const labHours = normalizeNumber(item.labHours);

    if (!subjectName) {
      return { error: "Each subject must have a name." };
    }

    if (labHours % 2 !== 0) {
      return {
        error: `Lab hours for ${subjectName} must be in 2-hour multiples.`,
      };
    }

    if (theoryHours === 0 && labHours === 0) {
      continue;
    }

    normalized.push({
      subjectName,
      theoryHours,
      labHours,
      labSessions: labHours / 2,
    });
  }

  if (!normalized.length) {
    return { error: "Add at least one subject with non-zero hours." };
  }

  return { requirements: normalized };
}

function isConsecutive(slots, idxA, idxB) {
  const first = slots[idxA];
  const second = slots[idxB];
  if (!first || !second) return false;

  const touchesBreak = BREAK_WINDOWS.some(
    (window) => first.end === window.start && second.start === window.end,
  );

  return first.end === second.start || touchesBreak;
}

function slotOverlapsBreak(slot) {
  return BREAK_WINDOWS.some(
    (window) => !(slot.end <= window.start || slot.start >= window.end),
  );
}

function validateSlotsAgainstBreaks(slots) {
  const invalid = slots.find(slotOverlapsBreak);
  if (!invalid) return null;

  return `Slot ${invalid.start}-${invalid.end} overlaps a break window.`;
}

function buildGrid(slots) {
  const grid = {};

  for (const day of DAYS) {
    grid[day] = new Array(slots.length).fill(null);
  }

  return grid;
}

function generateSchedule(requirements, slots) {
  const slotValidationError = validateSlotsAgainstBreaks(slots);
  if (slotValidationError) {
    return { error: slotValidationError };
  }

  const grid = buildGrid(slots);
  const dailyLoad = Object.fromEntries(DAYS.map((day) => [day, 0]));
  const entries = [];

  const theoryQueue = [];
  const labQueue = [];

  for (const req of requirements) {
    for (let i = 0; i < req.theoryHours; i += 1) {
      theoryQueue.push({ subjectName: req.subjectName, entryType: "THEORY" });
    }
    for (let i = 0; i < req.labSessions; i += 1) {
      labQueue.push({ subjectName: req.subjectName, entryType: "LAB" });
    }
  }

  // Place larger lab loads first to reduce fragmentation.
  labQueue.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  for (const session of labQueue) {
    const candidates = [];

    for (const day of DAYS) {
      for (let slotIndex = 0; slotIndex < slots.length - 1; slotIndex += 1) {
        const nextIndex = slotIndex + 1;

        if (!isConsecutive(slots, slotIndex, nextIndex)) {
          continue;
        }

        if (grid[day][slotIndex] || grid[day][nextIndex]) {
          continue;
        }

        candidates.push({ day, slotIndex, score: dailyLoad[day] });
      }
    }

    candidates.sort((a, b) => a.score - b.score || a.slotIndex - b.slotIndex);
    const selected = candidates[0];

    if (!selected) {
      return {
        error: `Unable to place lab sessions for ${session.subjectName}.`,
      };
    }

    const entry = {
      day: selected.day,
      slotIndex: selected.slotIndex,
      startTime: slots[selected.slotIndex].start,
      endTime: slots[selected.slotIndex + 1].end,
      subjectName: session.subjectName,
      entryType: "LAB",
    };

    grid[selected.day][selected.slotIndex] = entry;
    grid[selected.day][selected.slotIndex + 1] = entry;
    dailyLoad[selected.day] += 2;
    entries.push(entry);
  }

  for (const session of theoryQueue) {
    const candidates = [];

    for (const day of DAYS) {
      const sameDaySameSubject = entries.filter(
        (entry) =>
          entry.day === day && entry.subjectName === session.subjectName,
      ).length;

      if (sameDaySameSubject >= 2) {
        continue;
      }

      for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
        if (grid[day][slotIndex]) {
          continue;
        }

        candidates.push({
          day,
          slotIndex,
          score: dailyLoad[day] * 10 + sameDaySameSubject * 2 + slotIndex,
        });
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    const selected = candidates[0];

    if (!selected) {
      return {
        error: `Unable to place all theory sessions for ${session.subjectName}.`,
      };
    }

    const entry = {
      day: selected.day,
      slotIndex: selected.slotIndex,
      startTime: slots[selected.slotIndex].start,
      endTime: slots[selected.slotIndex].end,
      subjectName: session.subjectName,
      entryType: "THEORY",
    };

    grid[selected.day][selected.slotIndex] = entry;
    dailyLoad[selected.day] += 1;
    entries.push(entry);
  }

  return {
    usedExtendedHours: slots.length > BASE_SLOTS.length,
    entries,
  };
}

async function requireTimetableSetter() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to continue." };
  }

  if (!TIMETABLE_SETTER_ROLES.includes(session.user.role)) {
    return { error: "Only timetable setters can manage timetable generation." };
  }

  return { session };
}

export async function generateTimetableDraft(input) {
  const access = await requireTimetableSetter();
  if (access.error) return { error: access.error };

  const title = String(input?.title ?? "").trim() || "Untitled Timetable";
  const targetClass = String(input?.targetClass ?? "").trim();

  if (!targetClass) {
    return { error: "Target class is required." };
  }

  const normalized = toSessionRequirements(input?.requirements ?? []);
  if (normalized.error) return { error: normalized.error };

  const preferredExtended = Boolean(input?.allowExtendedHours);

  const attempts = preferredExtended
    ? [[...BASE_SLOTS, EXTENDED_SLOT]]
    : [BASE_SLOTS, [...BASE_SLOTS, EXTENDED_SLOT]];

  let generated = null;
  for (const slots of attempts) {
    const result = generateSchedule(normalized.requirements, slots);
    if (!result.error) {
      generated = result;
      break;
    }
  }

  if (!generated) {
    return {
      error:
        "Could not fit this timetable with current constraints. Reduce hours or allow more flexibility.",
    };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const plan = await tx.timetablePlan.create({
        data: {
          title,
          targetClass,
          status: "DRAFT",
          usedExtendedHours: generated.usedExtendedHours,
          createdById: access.session.user.id,
        },
      });

      await tx.timetableRequirement.createMany({
        data: normalized.requirements.map((req) => ({
          planId: plan.id,
          subjectName: req.subjectName,
          theoryHours: req.theoryHours,
          labHours: req.labHours,
        })),
      });

      await tx.timetableEntry.createMany({
        data: generated.entries.map((entry) => ({
          planId: plan.id,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          slotIndex: entry.slotIndex,
          subjectName: entry.subjectName,
          entryType: entry.entryType,
        })),
      });

      return tx.timetablePlan.findUnique({
        where: { id: plan.id },
        include: {
          requirements: true,
          entries: {
            orderBy: [{ day: "asc" }, { slotIndex: "asc" }],
          },
        },
      });
    });

    revalidatePath("/dashboard/admin/timetable");
    revalidatePath("/dashboard/student");

    return { success: true, plan: created };
  } catch (error) {
    console.error("Failed to generate timetable draft:", error);
    return { error: "Failed to generate timetable draft." };
  }
}

export async function publishTimetablePlan(input) {
  const access = await requireTimetableSetter();
  if (access.error) return { error: access.error };

  const planId = String(input?.planId ?? "").trim();
  const effectiveFromInput = String(input?.effectiveFrom ?? "").trim();
  const classroomAssignments = input?.classroomAssignments ?? {};

  if (!planId || !effectiveFromInput) {
    return { error: "Plan and effective date are required." };
  }

  const effectiveFrom = new Date(`${effectiveFromInput}T00:00:00`);
  if (Number.isNaN(effectiveFrom.getTime())) {
    return { error: "Invalid effective date." };
  }

  try {
    const plan = await prisma.timetablePlan.findUnique({
      where: { id: planId },
      include: {
        entries: true,
      },
    });

    if (!plan) {
      return { error: "Timetable plan not found." };
    }

    if (plan.status !== "DRAFT") {
      return { error: "Only draft timetables can be published." };
    }

    const classroomUpdates = [];
    for (const entry of plan.entries) {
      const room = String(
        classroomAssignments[entry.id] ?? entry.classroom ?? "",
      ).trim();
      if (!room) {
        return {
          error: `Please assign a classroom for ${entry.subjectName} (${entry.day} ${entry.startTime}-${entry.endTime}).`,
        };
      }
      classroomUpdates.push({ id: entry.id, room });
    }

    await prisma.$transaction(async (tx) => {
      await tx.timetablePlan.updateMany({
        where: {
          targetClass: plan.targetClass,
          status: "PUBLISHED",
        },
        data: {
          status: "ARCHIVED",
        },
      });

      for (const update of classroomUpdates) {
        await tx.timetableEntry.update({
          where: { id: update.id },
          data: { classroom: update.room },
        });
      }

      await tx.timetablePlan.update({
        where: { id: plan.id },
        data: {
          status: "PUBLISHED",
          effectiveFrom,
        },
      });
    });

    revalidatePath("/dashboard/admin/timetable");
    revalidatePath("/dashboard/student");

    return { success: true };
  } catch (error) {
    console.error("Failed to publish timetable:", error);
    return { error: "Failed to publish timetable." };
  }
}
