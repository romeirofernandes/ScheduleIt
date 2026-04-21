"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  generateTimetableDraft,
  publishTimetablePlan,
} from "@/actions/schedule/timetable-action";

const CLASS_OPTIONS = ["FE", "SE", "TE", "BE"];

const STATUS_STYLE = {
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PUBLISHED: "bg-green-500/15 text-green-700 dark:text-green-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

const DAY_HEADERS = [
  { key: "Monday", label: "Mon" },
  { key: "Tuesday", label: "Tue" },
  { key: "Wednesday", label: "Wed" },
  { key: "Thursday", label: "Thu" },
  { key: "Friday", label: "Fri" },
];

const TIMETABLE_ROWS = [
  { type: "slot", start: "08:45", end: "09:45" },
  { type: "slot", start: "09:45", end: "10:45" },
  { type: "break", start: "10:45", end: "11:00", label: "Short Break" },
  { type: "slot", start: "11:00", end: "12:00" },
  { type: "slot", start: "12:00", end: "13:00" },
  { type: "break", start: "13:00", end: "13:30", label: "Long Break" },
  { type: "slot", start: "13:30", end: "14:30" },
  { type: "slot", start: "14:30", end: "15:30" },
  { type: "slot", start: "15:30", end: "16:30", extended: true },
];

function toMinutes(timeValue) {
  const [h, m] = String(timeValue).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function overlaps(entry, row) {
  const entryStart = toMinutes(entry.startTime);
  const entryEnd = toMinutes(entry.endTime);
  const rowStart = toMinutes(row.start);
  const rowEnd = toMinutes(row.end);
  return Math.max(entryStart, rowStart) < Math.min(entryEnd, rowEnd);
}

function showExtendedRow(plan) {
  return (
    plan.usedExtendedHours || plan.entries.some((e) => e.endTime === "16:30")
  );
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const dayScore = (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99);
    if (dayScore !== 0) return dayScore;
    return a.slotIndex - b.slotIndex;
  });
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[value] ?? STATUS_STYLE.ARCHIVED}`}
    >
      {value}
    </span>
  );
}

export default function TimetableGeneratorClient({ initialPlans }) {
  const [plans, setPlans] = useState(initialPlans ?? []);
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState({
    title: "",
    targetClass: "FE",
    allowExtendedHours: false,
    requirements: [{ subjectName: "", theoryHours: 0, labHours: 0 }],
  });

  const [effectiveFromByPlanId, setEffectiveFromByPlanId] = useState({});
  const [roomAssignmentsByPlanId, setRoomAssignmentsByPlanId] = useState({});

  const draftPlans = useMemo(
    () => plans.filter((plan) => plan.status === "DRAFT"),
    [plans],
  );

  const updateRequirement = (index, field, value) => {
    setFormState((prev) => {
      const next = [...prev.requirements];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, requirements: next };
    });
  };

  const addRequirement = () => {
    setFormState((prev) => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        { subjectName: "", theoryHours: 0, labHours: 0 },
      ],
    }));
  };

  const removeRequirement = (index) => {
    setFormState((prev) => {
      if (prev.requirements.length === 1) return prev;
      const next = prev.requirements.filter((_, i) => i !== index);
      return { ...prev, requirements: next };
    });
  };

  const onGenerateDraft = (event) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await generateTimetableDraft(formState);
      if (!result.success) {
        toast.error(result.error ?? "Failed to generate timetable.");
        return;
      }

      setPlans((prev) => [result.plan, ...prev]);
      toast.success("Draft timetable generated.");
    });
  };

  const updateRoom = (planId, entryId, room) => {
    setRoomAssignmentsByPlanId((prev) => ({
      ...prev,
      [planId]: {
        ...(prev[planId] ?? {}),
        [entryId]: room,
      },
    }));
  };

  const onPublish = (plan) => {
    const effectiveFrom = effectiveFromByPlanId[plan.id] ?? "";
    const assignments = roomAssignmentsByPlanId[plan.id] ?? {};

    startTransition(async () => {
      const result = await publishTimetablePlan({
        planId: plan.id,
        effectiveFrom,
        classroomAssignments: assignments,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to publish timetable.");
        return;
      }

      setPlans((prev) =>
        prev.map((item) => {
          if (item.targetClass !== plan.targetClass) return item;
          if (item.id === plan.id) {
            return {
              ...item,
              status: "PUBLISHED",
              effectiveFrom: `${effectiveFrom}T00:00:00.000Z`,
              entries: item.entries.map((entry) => ({
                ...entry,
                classroom: assignments[entry.id] ?? entry.classroom ?? null,
              })),
            };
          }

          if (item.status === "PUBLISHED") {
            return { ...item, status: "ARCHIVED" };
          }

          return item;
        }),
      );

      toast.success("Timetable published as official.");
    });
  };

  return (
    <div className="grid gap-6">
      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Create Draft Timetable</CardTitle>
          <CardDescription>
            Enter theory/lab weekly hours per subject. Labs are placed in 2-hour
            blocks, and the generator uses Monday to Friday only. Breaks are
            fixed at 10:45-11:00 (short break) and 1:00-1:30 (long break).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onGenerateDraft}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. SE CSE Semester 4"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Target Class</Label>
                <Select
                  value={formState.targetClass}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, targetClass: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allowExtendedHours">
                  Allow Stretch Till 4:30
                </Label>
                <select
                  id="allowExtendedHours"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formState.allowExtendedHours ? "yes" : "no"}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      allowExtendedHours: e.target.value === "yes",
                    }))
                  }
                >
                  <option value="no">Only if required</option>
                  <option value="yes">Always allow</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Subject Requirements</Label>
              <div className="hidden md:grid md:grid-cols-12 gap-2 px-1 text-xs text-muted-foreground">
                <span className="md:col-span-6">Subject Name</span>
                <span className="md:col-span-2">Theory Hours / Week</span>
                <span className="md:col-span-2">Lab Hours / Week</span>
                <span className="md:col-span-2">Action</span>
              </div>
              <p className="text-xs text-muted-foreground md:hidden">
                Fill subject name, theory hours/week, and lab hours/week.
              </p>
              {formState.requirements.map((row, index) => (
                <div
                  key={`req-${index}`}
                  className="grid gap-2 md:grid-cols-12"
                >
                  <Input
                    className="md:col-span-6"
                    placeholder="Subject name"
                    value={row.subjectName}
                    onChange={(e) =>
                      updateRequirement(index, "subjectName", e.target.value)
                    }
                  />
                  <Input
                    className="md:col-span-2"
                    type="number"
                    min={0}
                    placeholder="Theory h/week"
                    value={row.theoryHours}
                    onChange={(e) =>
                      updateRequirement(index, "theoryHours", e.target.value)
                    }
                  />
                  <Input
                    className="md:col-span-2"
                    type="number"
                    min={0}
                    step={2}
                    placeholder="Lab h/week"
                    value={row.labHours}
                    onChange={(e) =>
                      updateRequirement(index, "labHours", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="md:col-span-2"
                    onClick={() => removeRequirement(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={addRequirement}>
                Add Subject
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Generating..." : "Generate Draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Timetable Plans</CardTitle>
          <CardDescription>
            Publish a draft with classroom assignments and an effective date.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plans yet.</p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{plan.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Class {plan.targetClass} • by{" "}
                      {plan.createdBy?.username ?? "Unknown"}
                    </p>
                  </div>
                  <StatusBadge value={plan.status} />
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-border/60">
                  <table className="min-w-[960px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="w-[140px] border-b border-r px-3 py-3 text-left font-semibold text-muted-foreground">
                          Time
                        </th>
                        {DAY_HEADERS.map((day) => (
                          <th
                            key={`${plan.id}-head-${day.key}`}
                            className="border-b border-r last:border-r-0 px-3 py-3 text-center font-semibold"
                          >
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIMETABLE_ROWS.filter(
                        (row) => !row.extended || showExtendedRow(plan),
                      ).map((row) => {
                        if (row.type === "break") {
                          return (
                            <tr
                              key={`${plan.id}-break-${row.start}`}
                              className="bg-amber-500/10"
                            >
                              <td className="border-b border-r px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                {row.start} - {row.end}
                              </td>
                              <td
                                colSpan={5}
                                className="border-b px-3 py-2 text-center text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400"
                              >
                                {row.label}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={`${plan.id}-slot-${row.start}`}>
                            <td className="border-b border-r px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {row.start} - {row.end}
                            </td>
                            {DAY_HEADERS.map((day) => {
                              const matches = sortEntries(plan.entries).filter(
                                (entry) =>
                                  entry.day === day.key && overlaps(entry, row),
                              );
                              const first = matches[0];

                              return (
                                <td
                                  key={`${plan.id}-${day.key}-${row.start}`}
                                  className="border-b border-r last:border-r-0 px-2 py-2 align-top"
                                >
                                  {first ? (
                                    <div className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1">
                                      <p className="text-xs font-semibold leading-tight">
                                        {first.subjectName}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {first.entryType}
                                        {first.classroom
                                          ? ` • Room ${first.classroom}`
                                          : ""}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold">
                    Classroom Assignment & Publish
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Room</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortEntries(plan.entries).map((entry) => (
                        <TableRow key={`${plan.id}-assign-${entry.id}`}>
                          <TableCell>{entry.day}</TableCell>
                          <TableCell>
                            {entry.startTime} - {entry.endTime}
                          </TableCell>
                          <TableCell>{entry.subjectName}</TableCell>
                          <TableCell>{entry.entryType}</TableCell>
                          <TableCell>
                            {plan.status === "DRAFT" ? (
                              <Input
                                className="max-w-[140px]"
                                placeholder="Room"
                                value={
                                  roomAssignmentsByPlanId?.[plan.id]?.[
                                    entry.id
                                  ] ??
                                  entry.classroom ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateRoom(plan.id, entry.id, e.target.value)
                                }
                              />
                            ) : (
                              (entry.classroom ?? "-")
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {plan.status === "DRAFT" && (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="grid gap-1">
                        <Label htmlFor={`effective-${plan.id}`}>
                          Effective From
                        </Label>
                        <Input
                          id={`effective-${plan.id}`}
                          type="date"
                          value={effectiveFromByPlanId[plan.id] ?? ""}
                          onChange={(e) =>
                            setEffectiveFromByPlanId((prev) => ({
                              ...prev,
                              [plan.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        disabled={isPending}
                        onClick={() => onPublish(plan)}
                      >
                        Publish Official Timetable
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {draftPlans.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Tip: Publish only one final draft per class to make it official
              from that date onward.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
