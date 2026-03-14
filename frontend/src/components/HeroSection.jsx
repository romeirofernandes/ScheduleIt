'use client';

import { Button } from '@/components/ui/button';
import Grainient from '@/components/Grainient';
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
import { Moon, Sun, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

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

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/8 hover:text-foreground"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function NavLink({ href = '#', children }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}

export default function HeroSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Animated Grainient */}
      <div className="absolute inset-0">
        <Grainient
          color1={isDark ? '#202020' : '#EFE6DE'}
          color2="#E8733A"
          color3={isDark ? '#161B24' : '#FAF6F1'}
          timeSpeed={0.5}
          warpStrength={0.85}
          warpFrequency={4.2}
          warpSpeed={2}
          warpAmplitude={52.0}
          rotationAmount={350.0}
          contrast={1.05}
          saturation={0.72}
          grainAmount={0.1}
          grainScale={2.0}
          zoom={0.78}
          centerX={-0.16}
          centerY={0.02}
        />
      </div>

      {/* Navbar */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
              <CalendarDays size={15} className="text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ScheduleIt
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" size="sm">Sign In</Button>
            <Button size="sm" className="hidden sm:inline-flex">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero content */}
      <main className="relative z-10 flex flex-1 flex-col px-6 py-12 lg:py-16">
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
            <p className="max-w-xl text-base leading-relaxed text-foreground/60 lg:text-lg">
              ScheduleIt gives students and faculty one place to book labs,
              seminar halls, and equipment with live availability and fast
              admin approval.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg">Get Started Free</Button>
              <Button variant="secondary" size="lg">Watch Demo</Button>
            </div>

          </div>

          {/* Calendar — full width below text */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <CalendarProvider>
              <CalendarDate>
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker start={2024} end={2028} />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader />
              <CalendarBody features={demoFeatures}>
                {({ feature }) => <CalendarItem feature={feature} />}
              </CalendarBody>
              <CalendarLegend statuses={STATUSES} />
            </CalendarProvider>
          </div>

        </div>
      </main>
    </section>
  );
}
