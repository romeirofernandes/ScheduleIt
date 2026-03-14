"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "motion/react";
import { AnimatedSection, StaggerSection, StaggerItem } from "./AnimatedSection";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let animFrame;
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress < 1) animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isInView, to]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const PAIN_POINTS = [
  {
    before: "Walk to the admin office to check",
    after: "Search live availability from anywhere",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    before: "Discover someone else already booked",
    after: "Automatic conflict detection prevents it",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    before: "Wait days for a confirmation email",
    after: "Approved bookings appear on the schedule instantly",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17 5l-9 9-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const STATS = [
  { value: 500, suffix: "+", label: "Bookings per semester" },
  { value: 15, suffix: "", label: "Campus resources tracked" },
  { value: 98, suffix: "%", label: "Fewer scheduling conflicts" },
];

export default function About() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              The problem
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Scheduling campus resources shouldn't require a paper trail
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Students and faculty spend hours each week wrestling with manual booking
              systems that create conflicts, not clarity.
            </p>
          </div>
        </AnimatedSection>

        <StaggerSection delay={0.05} className="mt-12 grid gap-4 sm:grid-cols-3">
          {PAIN_POINTS.map((point, idx) => (
            <StaggerItem key={idx}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  {point.icon}
                </div>
                <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                  {point.before}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  {point.after}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerSection>

        <AnimatedSection delay={0.1} className="mt-16">
          <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-20">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
