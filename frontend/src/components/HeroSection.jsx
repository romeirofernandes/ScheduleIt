'use client';

import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
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
} from '@/components/Calendar';
import { useCalendar } from '@/components/Calendar';
import { motion } from 'motion/react';
import { getDaysInMonth } from 'date-fns';
import { useMemo } from 'react';
 

const STATUSES = [
  { id: 's1', name: 'Confirmed', color: '#22c55e' },
  { id: 's2', name: 'Pending', color: '#f59e0b' },
  { id: 's3', name: 'Active', color: '#6366f1' },
];

const demoFeatures = [
  { id: '1',  name: 'CS Lab A',         startAt: new Date(2026, 2, 2),  endAt: new Date(2026, 2, 2),  status: STATUSES[0] },
  { id: '2',  name: 'Physics Lab',       startAt: new Date(2026, 2, 3),  endAt: new Date(2026, 2, 3),  status: STATUSES[0] },
  { id: '3',  name: 'Seminar Hall B',    startAt: new Date(2026, 2, 4),  endAt: new Date(2026, 2, 4),  status: STATUSES[1] },
  { id: '4',  name: 'Bio Lab',           startAt: new Date(2026, 2, 5),  endAt: new Date(2026, 2, 5),  status: STATUSES[2] },
  { id: '5',  name: 'ECE Lab',           startAt: new Date(2026, 2, 6),  endAt: new Date(2026, 2, 6),  status: STATUSES[0] },
  { id: '6',  name: 'Projector Kit',     startAt: new Date(2026, 2, 9),  endAt: new Date(2026, 2, 9),  status: STATUSES[1] },
  { id: '7',  name: 'Chem Lab',          startAt: new Date(2026, 2, 10), endAt: new Date(2026, 2, 10), status: STATUSES[0] },
  { id: '8',  name: 'Conference Rm 1',   startAt: new Date(2026, 2, 11), endAt: new Date(2026, 2, 11), status: STATUSES[2] },
  { id: '9',  name: 'Design Studio',     startAt: new Date(2026, 2, 12), endAt: new Date(2026, 2, 12), status: STATUSES[0] },
  { id: '10', name: 'Mech Lab',          startAt: new Date(2026, 2, 12), endAt: new Date(2026, 2, 12), status: STATUSES[1] },
  { id: '11', name: 'CS Lab B',          startAt: new Date(2026, 2, 13), endAt: new Date(2026, 2, 13), status: STATUSES[0] },
  { id: '12', name: 'Auditorium',        startAt: new Date(2026, 2, 14), endAt: new Date(2026, 2, 14), status: STATUSES[2] },
  { id: '13', name: 'Seminar Hall A',    startAt: new Date(2026, 2, 14), endAt: new Date(2026, 2, 14), status: STATUSES[0] },
  { id: '14', name: 'Language Lab',      startAt: new Date(2026, 2, 16), endAt: new Date(2026, 2, 16), status: STATUSES[1] },
  { id: '15', name: 'Physics Lab',       startAt: new Date(2026, 2, 17), endAt: new Date(2026, 2, 17), status: STATUSES[0] },
  { id: '16', name: 'CS Lab A',          startAt: new Date(2026, 2, 18), endAt: new Date(2026, 2, 18), status: STATUSES[2] },
  { id: '17', name: 'ECE Lab B',         startAt: new Date(2026, 2, 19), endAt: new Date(2026, 2, 19), status: STATUSES[0] },
  { id: '18', name: 'Bio Lab',           startAt: new Date(2026, 2, 20), endAt: new Date(2026, 2, 20), status: STATUSES[1] },
  { id: '19', name: 'Workshop Bay',      startAt: new Date(2026, 2, 23), endAt: new Date(2026, 2, 23), status: STATUSES[0] },
  { id: '20', name: 'Conference Rm 2',   startAt: new Date(2026, 2, 24), endAt: new Date(2026, 2, 24), status: STATUSES[2] },
  { id: '21', name: 'Seminar Hall B',    startAt: new Date(2026, 2, 25), endAt: new Date(2026, 2, 25), status: STATUSES[0] },
  { id: '22', name: 'Chem Lab',          startAt: new Date(2026, 2, 26), endAt: new Date(2026, 2, 26), status: STATUSES[1] },
  { id: '23', name: 'IT Lab',            startAt: new Date(2026, 2, 27), endAt: new Date(2026, 2, 27), status: STATUSES[0] },
  { id: '24', name: 'Auditorium',        startAt: new Date(2026, 2, 28), endAt: new Date(2026, 2, 28), status: STATUSES[2] },
  { id: '25', name: 'Design Studio',     startAt: new Date(2026, 2, 31), endAt: new Date(2026, 2, 31), status: STATUSES[0] },
];

const headingContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.2,
    },
  },
};

const headingLine = {
  hidden: { opacity: 0, y: 20, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function HeroSection() {
  const { month, year } = useCalendar();

  const features = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(year, month, 1));
    const result = [];
    let id = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const eventIndex = (day - 1) % demoFeatures.length;
        result.push({
          ...demoFeatures[eventIndex],
          id: String(id++),
          startAt: date,
          endAt: date,
        });
      }
    }
    return result;
  }, [month, year]);

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <Navbar />

      {/* Hero content */}
      <main className="relative z-10 flex flex-1 flex-col px-6 pt-32 pb-12 lg:pt-36 lg:pb-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* Text block */}
          <div className="flex flex-col gap-5 pb-12">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Smart campus booking
            </div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={headingContainer}
              className="max-w-3xl text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-6xl xl:text-7xl"
            >
              <motion.span variants={headingLine} className="block">
                Book Every Campus Resource.
              </motion.span>
              <motion.span variants={headingLine} className="block">
                Instantly.
              </motion.span>
            </motion.h1>

            {/* Description */}
            <p className="max-w-xl text-base leading-relaxed text-foreground/80 lg:text-lg">
              ScheduleIt gives students and faculty one place to book labs,
              seminar halls, and equipment with live availability and fast
              admin approval.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg">Get Started Free</Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-[30px] border border-border/60 bg-background/30 p-[12px] shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-[18px] border border-border bg-card/90 shadow-xl backdrop-blur-[2px]">
              <CalendarProvider>
                <CalendarDate>
                  <CalendarDatePicker>
                    <CalendarMonthPicker />
                    <CalendarYearPicker start={2024} end={2028} />
                  </CalendarDatePicker>
                  <CalendarDatePagination />
                </CalendarDate>
                <CalendarHeader />
                <CalendarBody features={features}>
                  {({ feature }) => <CalendarItem feature={feature} />}
                </CalendarBody>
                <CalendarLegend statuses={STATUSES} />
              </CalendarProvider>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
