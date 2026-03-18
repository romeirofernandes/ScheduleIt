"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:45 AM - 10:45 AM",
  "11:00 AM - 01:00 PM",
  "01:30 PM - 03:30 PM",
];

const CLASS_COLORS = {
  FE: { bg: "bg-[#22c55e]/15", border: "border-[#22c55e]/30", text: "text-[#22c55e]", dot: "#22c55e" },
  SE: { bg: "bg-[#3b82f6]/15", border: "border-[#3b82f6]/30", text: "text-[#3b82f6]", dot: "#3b82f6" },
  TE: { bg: "bg-[#f59e0b]/15", border: "border-[#f59e0b]/30", text: "text-[#f59e0b]", dot: "#f59e0b" },
  BE: { bg: "bg-[#8b5cf6]/15", border: "border-[#8b5cf6]/30", text: "text-[#8b5cf6]", dot: "#8b5cf6" },
};

export function StudentScheduleCalendar({ allocations }) {
  const gridData = useMemo(() => {
    const grid = {};
    TIME_SLOTS.forEach((slot) => {
      grid[slot] = {};
      DAYS_OF_WEEK.forEach((day) => {
        grid[slot][day] = [];
      });
    });

    allocations.forEach((allocation) => {
      if (grid[allocation.timeRange] && grid[allocation.timeRange][allocation.day]) {
        grid[allocation.timeRange][allocation.day].push(allocation);
      }
    });

    return grid;
  }, [allocations]);

  const classLegend = useMemo(() => {
    const classes = [...new Set(allocations.map((allocation) => allocation.targetClass))];
    return classes.length > 0 ? classes : ["FE", "SE", "TE", "BE"];
  }, [allocations]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end items-center flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-4 bg-muted/40 px-4 py-2.5 rounded-full border border-border/50">
          <span className="text-sm font-medium text-muted-foreground mr-1">Legend:</span>
          {classLegend.map((className) => {
            const colors = CLASS_COLORS[className] || CLASS_COLORS.FE;
            return (
              <div key={className} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: colors.dot }} />
                <span className="text-sm font-semibold">{className}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[900px] border border-border/60 rounded-2xl overflow-hidden bg-card shadow-sm">
          <div className="flex flex-col w-full">
            <div className="grid grid-cols-[160px_repeat(5,1fr)] divide-x divide-border border-b border-border bg-muted/50">
              <div className="p-4 font-semibold text-muted-foreground flex items-center justify-center border-r border-border">
                Time
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="p-4 font-semibold text-center text-foreground tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            <div className="divide-y divide-border bg-background">
              {TIME_SLOTS.map((timeRange, index) => (
                <div
                  key={timeRange}
                  className="grid grid-cols-[160px_repeat(5,1fr)] divide-x divide-border min-h-[160px] group transition-colors hover:bg-muted/10"
                >
                  <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-muted/20 group-hover:bg-muted/30 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slot {index + 1}</span>
                    <span className="text-sm font-medium text-foreground">{timeRange.split(" - ")[0]}</span>
                    <span className="text-xs text-muted-foreground">to</span>
                    <span className="text-sm font-medium text-foreground">{timeRange.split(" - ")[1]}</span>
                  </div>

                  {DAYS_OF_WEEK.map((day) => {
                    const dayAllocations = gridData[timeRange][day];

                    return (
                      <div key={`${day}-${timeRange}`} className="p-2.5 flex flex-col gap-2 relative">
                        {dayAllocations.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-xs text-muted-foreground/40 font-medium">No Labs</span>
                          </div>
                        ) : (
                          dayAllocations.map((lab) => {
                            const colors = CLASS_COLORS[lab.targetClass] || CLASS_COLORS.FE;

                            return (
                              <div
                                key={lab.id}
                                className={cn(
                                  "flex flex-col gap-1 p-3 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-default relative overflow-hidden",
                                  colors.bg,
                                  colors.border
                                )}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className={cn("text-xs font-bold uppercase tracking-wider", colors.text)}>
                                    {lab.targetClass}
                                  </span>
                                  <span className="text-[10px] font-semibold bg-background/50 px-1.5 py-0.5 rounded border border-border/50 shadow-sm whitespace-nowrap">
                                    Lab {lab.labName}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mt-1 text-foreground">
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
    </div>
  );
}
