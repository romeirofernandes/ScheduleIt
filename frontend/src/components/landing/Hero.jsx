"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  CalendarItem,
} from "./Calendar";

const Grainient = dynamic(() => import("./Grainient"), { ssr: false });

const MOCK_BOOKINGS = [
  { id: "1", name: "CS Lab A1", startAt: new Date(2026, 2, 3), endAt: new Date(2026, 2, 3), status: { id: "1", name: "Confirmed", color: "#C87030" } },
  { id: "2", name: "Seminar Hall", startAt: new Date(2026, 2, 5), endAt: new Date(2026, 2, 5), status: { id: "2", name: "Pending", color: "#4A5590" } },
  { id: "3", name: "Physics Lab", startAt: new Date(2026, 2, 7), endAt: new Date(2026, 2, 7), status: { id: "3", name: "Confirmed", color: "#C87030" } },
  { id: "4", name: "Workshop C2", startAt: new Date(2026, 2, 10), endAt: new Date(2026, 2, 10), status: { id: "2", name: "Pending", color: "#4A5590" } },
  { id: "5", name: "Conference Rm", startAt: new Date(2026, 2, 12), endAt: new Date(2026, 2, 12), status: { id: "1", name: "Confirmed", color: "#C87030" } },
  { id: "6", name: "Chem Lab B1", startAt: new Date(2026, 2, 14), endAt: new Date(2026, 2, 14), status: { id: "3", name: "Confirmed", color: "#C87030" } },
  { id: "7", name: "Auditorium", startAt: new Date(2026, 2, 17), endAt: new Date(2026, 2, 17), status: { id: "2", name: "Pending", color: "#4A5590" } },
  { id: "8", name: "CS Lab B2", startAt: new Date(2026, 2, 19), endAt: new Date(2026, 2, 19), status: { id: "1", name: "Confirmed", color: "#C87030" } },
  { id: "9", name: "Seminar Hall", startAt: new Date(2026, 2, 21), endAt: new Date(2026, 2, 21), status: { id: "3", name: "Confirmed", color: "#C87030" } },
  { id: "10", name: "Physics Lab", startAt: new Date(2026, 2, 24), endAt: new Date(2026, 2, 24), status: { id: "2", name: "Pending", color: "#4A5590" } },
  { id: "11", name: "Workshop C2", startAt: new Date(2026, 2, 26), endAt: new Date(2026, 2, 26), status: { id: "1", name: "Confirmed", color: "#C87030" } },
  { id: "12", name: "Conference Rm", startAt: new Date(2026, 2, 28), endAt: new Date(2026, 2, 28), status: { id: "2", name: "Pending", color: "#4A5590" } },
];

function SplitText({ text, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");

  return (
    <h1 ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: "bottom" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{
              delay: i * 0.07,
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Grainient
          color1="#D4833A"
          color2="#4A5590"
          color3="#E6EDF4"
          timeSpeed={0.1}
          warpStrength={0.4}
          warpFrequency={4.0}
          warpSpeed={1.2}
          warpAmplitude={80.0}
          contrast={1.02}
          saturation={0.55}
          grainAmount={0.055}
          grainScale={1.8}
          zoom={0.95}
          rotationAmount={300}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-0">
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium tracking-wide text-primary">
              Smart campus booking
            </span>
          </motion.div>

          <SplitText
            text="Stop fighting over room bookings."
            className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            ScheduleIt replaces paper registers and email chains with one
            platform where the whole campus sees what's available, right now.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button asChild size="lg">
              <a href="#cta">Reserve Your First Slot</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">See How It Works</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start"
          >
            {[
              "Real-time availability",
              "Zero double-bookings",
              "Admin approvals built in",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                </svg>
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex-1"
        >
          <CalendarProvider
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
          >
            <CalendarDate>
              <CalendarDatePicker>
                <CalendarMonthPicker />
                <CalendarYearPicker start={2025} end={2027} />
              </CalendarDatePicker>
              <CalendarDatePagination />
            </CalendarDate>
            <CalendarHeader />
            <CalendarBody features={MOCK_BOOKINGS}>
              {({ feature }) => (
                <CalendarItem key={feature.id} feature={feature} />
              )}
            </CalendarBody>
          </CalendarProvider>
        </motion.div>
      </div>
    </section>
  );
}
