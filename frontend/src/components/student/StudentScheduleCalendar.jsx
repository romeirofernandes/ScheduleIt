"use client";

import { useMemo } from "react";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarLegend,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from "@/components/Calendar";

const WEEKDAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const SLOT_STATUS = {
  "08:45 AM - 10:45 AM": { id: "morning", name: "Morning Slot", color: "#22c55e" },
  "11:00 AM - 01:00 PM": { id: "noon", name: "Midday Slot", color: "#f59e0b" },
  "01:30 PM - 03:30 PM": { id: "afternoon", name: "Afternoon Slot", color: "#6366f1" },
};

function getNextWeekdayDate(targetDayName) {
  const now = new Date();
  const targetIndex = WEEKDAY_INDEX[targetDayName] ?? 1;
  const currentIndex = now.getDay();
  const offset = (targetIndex - currentIndex + 7) % 7;

  const result = new Date(now);
  result.setHours(12, 0, 0, 0);
  result.setDate(now.getDate() + offset);

  return result;
}

export function StudentScheduleCalendar({ allocations }) {
  const features = useMemo(() => {
    return allocations.map((allocation, index) => {
      const dayDate = getNextWeekdayDate(allocation.day);
      const status = SLOT_STATUS[allocation.timeRange] || SLOT_STATUS["11:00 AM - 01:00 PM"];

      return {
        id: String(allocation.id || index),
        name: `${allocation.subject} - Lab ${allocation.labName}`,
        startAt: dayDate,
        endAt: dayDate,
        status,
      };
    });
  }, [allocations]);

  const statuses = useMemo(() => Object.values(SLOT_STATUS), []);
  const year = new Date().getFullYear();

  return (
    <div className="rounded-[30px] border border-border/60 bg-background/30 p-[12px] shadow-2xl backdrop-blur-xl">
      <div className="overflow-hidden rounded-[18px] border border-border bg-card/90 shadow-xl backdrop-blur-[2px]">
        <CalendarProvider>
          <CalendarDate>
            <CalendarDatePicker>
              <CalendarMonthPicker />
              <CalendarYearPicker start={year - 1} end={year + 2} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </CalendarDate>
          <CalendarHeader />
          <CalendarBody features={features}>
            {({ feature }) => <CalendarItem feature={feature} />}
          </CalendarBody>
          <CalendarLegend statuses={statuses} />
        </CalendarProvider>
      </div>
    </div>
  );
}
