"use client";

import { createContext, useContext, useState } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getDay, getDaysInMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const useCalendar = create()(
  devtools((set) => ({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    setMonth: (month) => set(() => ({ month })),
    setYear: (year) => set(() => ({ year })),
  }))
);

const CalendarContext = createContext({
  locale: "en-US",
  startDay: 0,
});

export const monthsForLocale = (localeName, monthFormat = "long") => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m % 12)))
  );
};

export const daysForLocale = (locale, startDay) => {
  const weekdays = [];
  const baseDate = new Date(2024, 0, startDay);
  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return weekdays;
};

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronsUpDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 opacity-50">
      <path d="M5 6l3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Combobox({ value, setValue, data, labels, className }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex w-36 items-center justify-between gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm capitalize text-foreground hover:bg-muted",
          className
        )}
      >
        {value !== undefined && value !== ""
          ? data.find((item) => item.value === value)?.label
          : labels.button}
        <ChevronsUpDownIcon />
      </PopoverTrigger>
      <PopoverContent className="w-36 p-0">
        <Command
          filter={(itemValue, search) => {
            const label = data.find((item) => item.value === itemValue)?.label;
            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                  data-checked={value === item.value ? "true" : undefined}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function OutOfBoundsDay({ day }) {
  return (
    <div className="relative h-full w-full bg-muted/40 p-1 text-xs text-muted-foreground/50">
      {day}
    </div>
  );
}

export function CalendarBody({ features, children }) {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const days = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
  const prevMonthDaysArray = Array.from({ length: prevMonthDays }, (_, i) => i + 1);

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDaysArray[prevMonthDays - firstDay + i];
    if (day) days.push(<OutOfBoundsDay key={`prev-${i}`} day={day} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const featuresForDay = features.filter((feature) =>
      isSameDay(new Date(feature.endAt), new Date(year, month, day))
    );

    days.push(
      <div
        key={day}
        className="relative flex h-full w-full flex-col gap-1 p-1 text-xs text-muted-foreground"
      >
        {day}
        <div className="flex flex-col gap-0.5">
          {featuresForDay.slice(0, 3).map((feature) => children({ feature }))}
        </div>
        {featuresForDay.length > 3 && (
          <span className="block text-xs text-muted-foreground">
            +{featuresForDay.length - 3} more
          </span>
        )}
      </div>
    );
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
  const nextMonthDaysArray = Array.from({ length: nextMonthDays }, (_, i) => i + 1);

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];
      if (day) days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
    }
  }

  return (
    <div className="grid flex-grow grid-cols-7">
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            "relative aspect-square overflow-hidden border-t border-r border-border/60",
            index % 7 === 6 && "border-r-0"
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

export function CalendarDatePicker({ className, children }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>{children}</div>
  );
}

export function CalendarMonthPicker({ className }) {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);

  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={(value) => setMonth(parseInt(value))}
      data={monthsForLocale(locale).map((m, index) => ({
        value: index.toString(),
        label: m,
      }))}
      labels={{
        button: "Select month",
        empty: "No month found",
        search: "Search month",
      }}
    />
  );
}

export function CalendarYearPicker({ className, start, end }) {
  const { year, setYear } = useCalendar();

  return (
    <Combobox
      className={className}
      value={year.toString()}
      setValue={(value) => setYear(parseInt(value))}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: "Select year",
        empty: "No year found",
        search: "Search year",
      }}
    />
  );
}

export function CalendarDatePagination({ className }) {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={handlePreviousMonth}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={handleNextMonth}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Next month"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

export function CalendarDate({ children }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
      {children}
    </div>
  );
}

export function CalendarHeader({ className }) {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn("grid flex-grow grid-cols-7 border-b border-border/60", className)}>
      {daysForLocale(locale, startDay).map((day) => (
        <div
          key={day}
          className="p-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground/70"
        >
          {day}
        </div>
      ))}
    </div>
  );
}

export function CalendarItem({ feature, className }) {
  return (
    <div className={cn("flex items-center gap-1.5 rounded px-1 py-0.5", className)} key={feature.id}>
      <div
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: feature.status.color }}
      />
      <span className="truncate text-xs leading-none">{feature.name}</span>
    </div>
  );
}

export function CalendarProvider({ locale = "en-US", startDay = 0, children, className }) {
  return (
    <CalendarContext.Provider value={{ locale, startDay }}>
      <div className={cn("relative flex flex-col", className)}>{children}</div>
    </CalendarContext.Provider>
  );
}
