'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getDay, getDaysInMonth, isSameDay, isToday as isTodayFn } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsUpDown } from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useCalendar = create(
  devtools((set) => ({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    setMonth: (month) => set(() => ({ month })),
    setYear: (year) => set(() => ({ year })),
  }))
);

const CalendarContext = createContext({
  locale: 'en-US',
  startDay: 0,
});

export const monthsForLocale = (localeName, monthFormat = 'long') => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m % 12)))
  );
};

export const daysForLocale = (locale, startDay) => {
  const weekdays = [];
  const baseDate = new Date(2024, 0, startDay);
  for (let i = 0; i < 7; i++) {
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate));
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return weekdays;
};

const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Combobox = ({ value, setValue, data, labels, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex h-8 w-36 cursor-pointer items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-sm capitalize text-foreground transition-colors hover:bg-muted',
          className
        )}
      >
        {value ? data.find((item) => item.value === value)?.label : labels.button}
        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-36 p-0">
        <Command
          filter={(val, search) => {
            const label = data.find((item) => item.value === val)?.label;
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
                  data-checked={value === item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
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
};

const OutOfBoundsDay = ({ day }) => (
  <div className="relative h-full w-full bg-muted p-2 text-xs text-muted-foreground select-none">
    {day}
  </div>
);

export const CalendarBody = ({ features, children }) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const [selectedDay, setSelectedDay] = useState(null);

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
    const date = new Date(year, month, day);
    const featuresForDay = features.filter((f) => isSameDay(new Date(f.endAt), date));
    const isToday = isTodayFn(date);
    const isSelected = selectedDay === day;
    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    days.push(
      <div
        key={day}
        onClick={() => setSelectedDay(isSelected ? null : day)}
        className={cn(
          'group relative flex h-full w-full cursor-pointer flex-col gap-1 bg-card p-2 text-xs transition-colors',
          'hover:bg-accent',
          isSelected && !isToday && 'bg-accent',
          isWeekend && !isSelected && 'bg-muted',
        )}
      >
        {/* Day number */}
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors',
            isToday && 'bg-primary text-primary-foreground font-semibold',
            isSelected && !isToday && 'bg-muted font-semibold text-foreground',
            !isToday && !isSelected && 'text-muted-foreground group-hover:text-foreground',
          )}
        >
          {day}
        </span>

        {/* Events */}
        <div className="flex flex-col gap-0.5">
          {featuresForDay.slice(0, 3).map((feature) => children({ feature }))}
        </div>

        {featuresForDay.length > 3 && (
          <span className="text-[9px] font-medium text-muted-foreground">
            +{featuresForDay.length - 3} more
          </span>
        )}
      </div>
    );
  }

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDaysArray = Array.from(
      { length: getDaysInMonth(new Date(nextMonthYear, nextMonth, 1)) },
      (_, i) => i + 1
    );
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];
      if (day) days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
    }
  }

  return (
    <div className="grid grow grid-cols-7">
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            'relative min-h-28 overflow-hidden border-t border-r border-border',
            index % 7 === 6 && 'border-r-0'
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export const CalendarDatePicker = ({ className, children }) => (
  <div className={cn('flex items-center gap-1', className)}>{children}</div>
);

export const CalendarMonthPicker = ({ className }) => {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);
  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={(value) => setMonth(parseInt(value))}
      data={monthsForLocale(locale).map((m, index) => ({ value: index.toString(), label: m }))}
      labels={{ button: 'Select month', empty: 'No month found', search: 'Search month' }}
    />
  );
};

export const CalendarYearPicker = ({ className, start, end }) => {
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
      labels={{ button: 'Select year', empty: 'No year found', search: 'Search year' }}
    />
  );
};

export const CalendarDatePagination = ({ className }) => {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const handleNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={handlePrev}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeftIcon size={14} />
      </button>
      <button
        onClick={handleNext}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
};

export const CalendarDate = ({ children }) => (
  <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3">{children}</div>
);

export const CalendarHeader = ({ className }) => {
  const { locale, startDay } = useContext(CalendarContext);
  return (
    <div className={cn('grid grid-cols-7 border-b border-border bg-muted', className)}>
      {daysForLocale(locale, startDay).map((day) => (
        <div
          key={day}
          className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export const CalendarItem = ({ feature, className }) => (
  <div
    key={feature.id}
    className={cn('flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-[1.4] text-foreground', className)}
    style={{
      backgroundColor: hexToRgba(feature.status.color, 0.16),
      borderColor: hexToRgba(feature.status.color, 0.36),
    }}
    title={feature.name}
  >
    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: feature.status.color }} />
    <span className="truncate">{feature.name}</span>
  </div>
);

export const CalendarLegend = ({ statuses, className }) => (
  <div className={cn('flex flex-wrap items-center gap-4 border-t border-border bg-muted px-4 py-2.5', className)}>
    {statuses.map((s) => (
      <div key={s.name} className="flex items-center gap-1.5">
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
        <span className="text-xs text-muted-foreground">{s.name}</span>
      </div>
    ))}
  </div>
);

export const CalendarProvider = ({ locale = 'en-US', startDay = 0, children, className }) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col', className)}>{children}</div>
  </CalendarContext.Provider>
);
