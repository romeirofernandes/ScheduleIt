"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Calendar01Icon, 
  PlusSignIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Loading03Icon,
  ListViewIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const CLASS_COLORS = {
  FE: { bg: "bg-[#22c55e]/15", border: "border-[#22c55e]/30", text: "text-[#22c55e]", dot: "#22c55e" },
  SE: { bg: "bg-[#3b82f6]/15", border: "border-[#3b82f6]/30", text: "text-[#3b82f6]", dot: "#3b82f6" },
  TE: { bg: "bg-[#f59e0b]/15", border: "border-[#f59e0b]/30", text: "text-[#f59e0b]", dot: "#f59e0b" },
  BE: { bg: "bg-[#8b5cf6]/15", border: "border-[#8b5cf6]/30", text: "text-[#8b5cf6]", dot: "#8b5cf6" },
};

export default function AdminDashboardClient({ initialLabAllocations }) {
  const [labAllocations, setLabAllocations] = useState(initialLabAllocations || []);
  const [isPending, startTransition] = useTransition();

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formDataState, setFormDataState] = useState({
    targetClass: "FE",
    subject: "",
    labName: LAB_ROOMS[0],
    day: "Monday",
    timeRange: TIME_SLOTS[0],
  });

  const [itemToDelete, setItemToDelete] = useState(null);

  const resetForm = () => {
    setEditingId(null);
    setFormDataState({
      targetClass: "FE",
      subject: "",
      labName: LAB_ROOMS[0],
      day: "Monday",
      timeRange: TIME_SLOTS[0],
    });
  };

  const handleOpenChange = (open) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  const handleEditClick = (lab) => {
    setEditingId(lab.id);
    setFormDataState({
      targetClass: lab.targetClass,
      subject: lab.subject,
      labName: lab.labName,
      day: lab.day,
      timeRange: lab.timeRange,
    });
    setIsDialogOpen(true);
  };

  const handleChange = (name, value) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formDataState).forEach(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(async () => {
      if (editingId) {
        const res = await updateLabAllocation(editingId, formData);
        if (res.success) {
          setLabAllocations(
            labAllocations.map((lab) =>
              lab.id === editingId
                ? { ...lab, ...formDataState }
                : lab
            )
          );
          handleOpenChange(false);
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
            { id: res.id, ...formDataState },
            ...labAllocations,
          ]);
          handleOpenChange(false);
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
  const gridData = useMemo(() => {
    const grid = {};
    TIME_SLOTS.forEach(slot => {
      grid[slot] = {};
      DAYS_OF_WEEK.forEach(day => {
        grid[slot][day] = [];
      });
    });

    labAllocations.forEach((lab) => {
      if (grid[lab.timeRange] && grid[lab.timeRange][lab.day]) {
        grid[lab.timeRange][lab.day].push(lab);
      }
    });
    return grid;
  }, [labAllocations]);

  return (
    <div className="flex flex-col gap-10 w-full pb-10">
      {/* Header & Button Flex Row */}
      <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage lab allocations and schedules.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger
            render={
              <Button size="lg" variant="default" className="gap-2 shadow-sm" />
            }
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
            Create a New Allocation
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                {editingId
                  ? <HugeiconsIcon icon={PencilEdit01Icon} size={20} className="text-primary" />
                  : <HugeiconsIcon icon={Calendar01Icon} size={20} className="text-primary" />}
                {editingId ? "Edit Allocation" : "New Allocation"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update lab assignment safely with strict time rules."
                  : "Allocate a new lab slot to a class."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select 
                    name="targetClass" 
                    value={formDataState.targetClass} 
                    onValueChange={(v) => handleChange("targetClass", v)}
                    required
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
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
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
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
                  className="rounded-md"
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
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select Lab Room" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
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
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select Time Slot" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)} className="rounded-md">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 rounded-md">
                  {isPending && <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={1.8} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Legend & Grid Layout Container */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-end items-center flex-wrap gap-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 bg-muted/40 px-4 py-2.5 rounded-full border border-border/50">
            <span className="text-sm font-medium text-muted-foreground mr-1">Legend:</span>
            {Object.entries(CLASS_COLORS).map(([className, colors]) => (
              <div key={className} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: colors.dot }}></span>
                <span className="text-sm font-semibold">{className}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[900px] border border-border/60 rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="flex flex-col w-full">
              
              <div className="grid grid-cols-[160px_repeat(5,1fr)] divide-x divide-border border-b border-border bg-muted/50">
                <div className="p-4 font-semibold text-muted-foreground flex items-center justify-center border-r border-border">
                  Time
                </div>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="p-4 font-semibold text-center text-foreground tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-border bg-background">
                {TIME_SLOTS.map((timeRange, index) => (
                  <div key={timeRange} className="grid grid-cols-[160px_repeat(5,1fr)] divide-x divide-border min-h-[160px] group transition-colors hover:bg-muted/10">
                    
                    {/* Time cell */}
                    <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-muted/20 group-hover:bg-muted/30 transition-colors">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slot {index + 1}</span>
                      <span className="text-sm font-medium text-foreground">{timeRange.split(' - ')[0]}</span>
                      <span className="text-xs text-muted-foreground">to</span>
                      <span className="text-sm font-medium text-foreground">{timeRange.split(' - ')[1]}</span>
                    </div>

                    {/* Day cells */}
                    {DAYS_OF_WEEK.map(day => {
                      const dayAllocations = gridData[timeRange][day];

                      return (
                        <div key={`${day}-${timeRange}`} className="p-2.5 flex flex-col gap-2 relative">
                          {dayAllocations.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="text-xs text-muted-foreground/40 font-medium">No Labs</span>
                            </div>
                          ) : (
                            dayAllocations.map(lab => {
                              const colors = CLASS_COLORS[lab.targetClass] || CLASS_COLORS.FE;
                              return (
                                <div 
                                  key={lab.id} 
                                  className={cn(
                                    "group/card flex flex-col gap-1 p-3 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-default relative overflow-hidden",
                                    colors.bg,
                                    colors.border
                                  )}
                                >
                                  {/* Hover Actions */}
                                  <div className="absolute top-2 right-2 flex bg-background/80 backdrop-blur-md rounded-md border border-border/40 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-7 w-7 rounded-none rounded-l-md hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                                      onClick={() => handleEditClick(lab)}
                                      disabled={isPending}
                                    >
                                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} strokeWidth={2} />
                                    </Button>
                                    <div className="w-[1px] bg-border/40" />
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-7 w-7 rounded-none rounded-r-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                                      onClick={() => setItemToDelete(lab.id)}
                                      disabled={isPending}
                                    >
                                      <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
                                    </Button>
                                  </div>

                                  <div className="flex justify-between items-start gap-1">
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", colors.text)}>
                                      {lab.targetClass}
                                    </span>
                                    <span className="text-[10px] font-semibold bg-background/50 px-1.5 py-0.5 rounded border border-border/50 shadow-sm whitespace-nowrap">
                                      Lab {lab.labName}
                                    </span>
                                  </div>
                                  <h4 className={cn("text-sm font-bold leading-tight mt-1", "text-foreground pr-10")}>
                                    {lab.subject}
                                  </h4>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Complete Lab List integrated for quick tabular overview */}
        <Card className="w-full shadow-lg bg-card/60 backdrop-blur border-border/60 overflow-hidden mt-4">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <CardTitle className="font-semibold flex items-center gap-2">
               <HugeiconsIcon icon={ListViewIcon} size={20} className="text-primary" />
               Complete Lab List
            </CardTitle>
            <CardDescription>
              A fast, readable list of every currently scheduled lab.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-semibold text-foreground whitespace-nowrap">Class</TableHead>
                  <TableHead className="font-semibold text-foreground min-w-[150px]">Subject</TableHead>
                  <TableHead className="font-semibold text-foreground">Lab / Room</TableHead>
                  <TableHead className="font-semibold text-foreground min-w-[200px]">Schedule</TableHead>
                  <TableHead className="text-right font-semibold text-foreground whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labAllocations.map((lab) => (
                  <TableRow
                    key={lab.id}
                    className={`hover:bg-muted/30 transition-colors duration-200 ${editingId === lab.id ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="font-medium">
                       <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">{lab.targetClass}</span>
                    </TableCell>
                    <TableCell className="font-medium">{lab.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{lab.labName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{lab.day}</span>
                        <span className="text-xs text-muted-foreground">
                          {lab.timeRange}
                        </span>
                      </div>
                    </TableCell>
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
                  </TableRow>
                ))}
                {labAllocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No lab allocations exist. Start creating one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
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
              variant="destructive" 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
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
