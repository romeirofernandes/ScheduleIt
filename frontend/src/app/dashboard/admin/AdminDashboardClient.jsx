"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilEdit01Icon,
  Delete02Icon,
  Loading03Icon,
  Calendar01Icon,
  ListViewIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import {
  createLabAllocation,
  updateLabAllocation,
  deleteLabAllocation,
} from "@/actions/schedule/lab-action";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:45 AM - 10:45 AM",
  "11:00 AM - 01:00 PM",
  "01:30 PM - 03:30 PM",
];
const LAB_ROOMS = [
  "601", "602", "603", "604", "608", "609", "610", "611", "612",
  "708", "709", "710", "711", "712",
  "801", "802", "803", "804", "809", "810", "811", "812"
];

/**
 * @param {object}  props
 * @param {Array}   props.initialLabAllocations
 * @param {boolean} props.canWrite  – true for SUPER_ADMIN / ADMIN / TIMETABLE_SETTER
 */
export default function AdminDashboardClient({ initialLabAllocations, canWrite }) {
  const [labAllocations, setLabAllocations] = useState(initialLabAllocations);
  const [isPending, startTransition] = useTransition();

  // For Editing
  const [editingId, setEditingId] = useState(null);
  const [formDataState, setFormDataState] = useState({
    targetClass: "FE",
    subject: "",
    labName: LAB_ROOMS[0],
    day: "Monday",
    timeRange: TIME_SLOTS[0],
  });

  const [itemToDelete, setItemToDelete] = useState(null);

  const handleEditClick = (lab) => {
    setEditingId(lab.id);
    setFormDataState({
      targetClass: lab.targetClass,
      subject: lab.subject,
      labName: lab.labName,
      day: lab.day,
      timeRange: lab.timeRange,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormDataState({
      targetClass: "FE",
      subject: "",
      labName: LAB_ROOMS[0],
      day: "Monday",
      timeRange: TIME_SLOTS[0],
    });
  };

  const handleChange = (name, value) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const targetClass = formData.get("targetClass");
    const subject = formData.get("subject");
    const labName = formData.get("labName");
    const day = formData.get("day");
    const timeRange = formData.get("timeRange");

    startTransition(async () => {
      if (editingId) {
        const res = await updateLabAllocation(editingId, formData);
        if (res.success) {
          setLabAllocations(
            labAllocations.map((lab) =>
              lab.id === editingId
                ? { ...lab, targetClass, subject, labName, day, timeRange }
                : lab
            )
          );
          handleCancelEdit();
          toast.success("Allocation updated successfully!", {
            icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={1.8} className="text-green-500" />
          });
        } else {
          toast.error(res.error, {
            icon: <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.8} className="text-destructive" />
          });
        }
      } else {
        const res = await createLabAllocation(formData);
        if (res.success) {
          setLabAllocations([
            { id: res.id, targetClass, subject, labName, day, timeRange },
            ...labAllocations,
          ]);
          handleCancelEdit();
          e.target.reset();
          toast.success("New allocation created!", {
            icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={1.8} className="text-green-500" />
          });
        } else {
          toast.error(res.error, {
            icon: <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.8} className="text-destructive" />
          });
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const res = await deleteLabAllocation(itemToDelete);
      if (res.success) {
        setLabAllocations(labAllocations.filter((lab) => lab.id !== itemToDelete));
        toast.success("Allocation deleted", {
          icon: <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} className="text-destructive" />
        });
        setItemToDelete(null);
      } else {
        toast.error(res.error, {
          icon: <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.8} className="text-destructive" />
        });
      }
    });
  };

  // Group allocations for Calendar format
  const allocationsByDay = useMemo(() => {
    const groups = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    labAllocations.forEach((lab) => {
      if (groups[lab.day]) groups[lab.day].push(lab);
    });
    Object.keys(groups).forEach(day => {
      groups[day].sort((a, b) => {
        return TIME_SLOTS.indexOf(a.timeRange) - TIME_SLOTS.indexOf(b.timeRange);
      });
    });
    return groups;
  }, [labAllocations]);

  return (
    <div className="flex flex-col gap-12">
      {/* Top Section: Form on Left (write-only), List on Right */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* ── Form Panel (hidden for read-only roles) ─────────────────────── */}
        {canWrite ? (
          <Card className="w-full xl:w-[400px] shrink-0 sticky top-24 shadow-xl bg-card/60 backdrop-blur border-border/60">
            <CardHeader className="border-b border-border/40 pb-4 mb-4">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                {editingId
                  ? <HugeiconsIcon icon={PencilEdit01Icon} size={20} strokeWidth={1.8} className="text-primary" />
                  : <HugeiconsIcon icon={Calendar01Icon} size={20} strokeWidth={1.8} className="text-primary" />}
                {editingId ? "Edit Allocation" : "New Allocation"}
              </CardTitle>
              <CardDescription>
                {editingId
                  ? "Update lab assignment safely with strict time rules."
                  : "Allocate a new lab slot to a class."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      name="targetClass"
                      value={formDataState.targetClass}
                      onValueChange={(v) => handleChange("targetClass", v)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FE">FE</SelectItem>
                        <SelectItem value="SE">SE</SelectItem>
                        <SelectItem value="TE">TE</SelectItem>
                        <SelectItem value="BE">BE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select
                      name="day"
                      value={formDataState.day}
                      onValueChange={(v) => handleChange("day", v)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((d) => (
                          <SelectItem key={d} value={d}>{d.substring(0, 3)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    name="subject"
                    placeholder="e.g. Data Structures"
                    value={formDataState.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lab Number / Room</Label>
                  <Select
                    name="labName"
                    value={formDataState.labName}
                    onValueChange={(v) => handleChange("labName", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Lab Room" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_ROOMS.map((room) => (
                        <SelectItem key={room} value={room}>Lab {room}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Range (Slot)</Label>
                  <Select
                    name="timeRange"
                    value={formDataState.timeRange}
                    onValueChange={(v) => handleChange("timeRange", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isPending} className="flex-1 gap-2">
                    {isPending && <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />}
                    {editingId ? "Save Changes" : "Create"}
                  </Button>
                  {editingId && (
                    <Button variant="outline" type="button" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Read-only notice card */
          <Card className="w-full xl:w-[400px] shrink-0 sticky top-24 bg-muted/30 border-border/40">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={LockIcon} size={22} strokeWidth={1.8} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">View-only access</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your role can view all schedules but cannot create, edit, or delete lab allocations.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── List View ───────────────────────────────────────────────────── */}
        <Card className="flex-1 w-full shadow-lg bg-card/60 backdrop-blur border-border/60 overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={ListViewIcon} size={20} strokeWidth={1.8} className="text-primary" />
              Complete Lab List
            </CardTitle>
            <CardDescription>
              A fast, readable list of every currently scheduled lab.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Class</TableHead>
                  <TableHead className="font-semibold text-foreground min-w-[150px]">Subject</TableHead>
                  <TableHead className="font-semibold text-foreground">Lab / Room</TableHead>
                  <TableHead className="font-semibold text-foreground min-w-[200px]">Schedule</TableHead>
                  {canWrite && (
                    <TableHead className="text-right font-semibold text-foreground whitespace-nowrap">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {labAllocations.map((lab) => (
                  <TableRow
                    key={lab.id}
                    className={`hover:bg-muted/30 transition-colors duration-200 ${editingId === lab.id ? "bg-primary/5" : ""}`}
                  >
                    <TableCell className="font-medium">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">{lab.targetClass}</span>
                    </TableCell>
                    <TableCell className="font-medium">{lab.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{lab.labName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{lab.day}</span>
                        <span className="text-xs text-muted-foreground">{lab.timeRange}</span>
                      </div>
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => handleEditClick(lab)}
                            disabled={isPending}
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.8} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => setItemToDelete(lab.id)}
                            disabled={isPending}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {labAllocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canWrite ? 5 : 4} className="text-center py-12 text-muted-foreground">
                      No lab allocations exist.{canWrite ? " Start creating one!" : ""}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Full Calendar View */}
      <div className="w-full space-y-6 pt-6 border-t border-border/40">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <HugeiconsIcon icon={Calendar01Icon} size={32} strokeWidth={1.6} className="text-primary" />
            Weekly Lab Calendar
          </h2>
          <p className="text-muted-foreground text-sm">
            Overview of all lab assignments mapped directly into a responsive weekly grid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
          {DAYS_OF_WEEK.map((day) => {
            const dayAllocations = allocationsByDay[day] || [];

            return (
              <div key={day} className="flex flex-col gap-4 min-w-[220px]">
                {/* Day Header */}
                <div className="sticky top-0 z-10 w-full rounded-2xl bg-card border border-border/60 py-3 text-center shadow-md backdrop-blur-md">
                  <span className="text-xl font-semibold tracking-tight text-foreground">{day}</span>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{dayAllocations.length} Sessions</div>
                </div>

                {/* Day Cards (Slots) */}
                <div className="flex flex-col gap-4">
                  {dayAllocations.length === 0 ? (
                    <div className="w-full h-28 border border-dashed border-border/60 rounded-2xl flex items-center justify-center text-sm font-medium text-muted-foreground/60 bg-muted/10">
                      Free Day
                    </div>
                  ) : (
                    dayAllocations.map((lab) => (
                      <Card
                        key={lab.id}
                        className={`group relative overflow-hidden bg-card/80 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${editingId === lab.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="bg-primary/5 px-4 py-2 border-b border-border/50 text-xs font-semibold text-primary uppercase tracking-wider flex justify-between items-center">
                          {lab.targetClass}
                          <span className="text-foreground font-bold bg-background px-2.5 overflow-hidden py-1 rounded-md border border-border shadow-sm">
                            {lab.timeRange}
                          </span>
                        </div>
                        <CardHeader className="p-4 pb-0 relative z-10">
                          <CardTitle className="text-lg font-semibold leading-tight mb-1">
                            {lab.subject}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium text-foreground/80 flex items-center gap-1.5 pb-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60"></div> {lab.labName}
                          </CardDescription>
                        </CardHeader>
                        {canWrite && (
                          <CardFooter className="px-4 py-3 bg-muted/10 border-t border-border/30 flex justify-end gap-2 relative z-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-full"
                              onClick={() => handleEditClick(lab)}
                              disabled={isPending}
                            >
                              <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.8} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                              onClick={() => setItemToDelete(lab.id)}
                              disabled={isPending}
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lab allocation from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending
                ? <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin mr-1" />
                : <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} className="mr-1" />}
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
