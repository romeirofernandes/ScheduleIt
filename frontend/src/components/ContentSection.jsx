'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiSchedulingIcon,
  Calendar01Icon,
  MoreHorizontalIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ScheduleIllustration({ className }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute -top-14 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-lg">
        <Button size="sm" className="rounded-md">
          <HugeiconsIcon icon={Calendar01Icon} size={14} strokeWidth={1.8} />
          <span className="text-xs font-medium">Schedule</span>
        </Button>
        <span className="h-5 w-px bg-border" />
        <div className="flex gap-1">
          {[TextBoldIcon, TextItalicIcon, TextUnderlineIcon, TextStrikethroughIcon].map((icon, index) => (
            <button
              key={index}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors hover:bg-accent"
              type="button"
            >
              <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
            </button>
          ))}
        </div>
        <span className="h-5 w-px bg-border" />
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors hover:bg-accent"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={14} strokeWidth={1.8} />
        </button>
      </div>

      <p className="rounded-xl border border-border bg-background px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-secondary-foreground">Tomorrow 8:30 pm</span>{' '}
        is now blocked for external bookings. The room stays reserved for the robotics club sprint.
      </p>
    </div>
  );
}

function CodeIllustration({ className }) {
  return (
    <div className={cn('relative flex h-full items-center justify-center', className)}>
      <ul className="font-mono text-2xl font-semibold leading-10 text-muted-foreground">
        {['Resources', 'Requests', 'Approvals', 'Conflicts', 'Reports'].map((item, index) => (
          <li key={item} className={cn(index === 2 && 'relative text-foreground')}>
            {index === 2 && (
              <span className="absolute -left-16 text-sm font-medium uppercase tracking-wide text-primary">
                Sync
              </span>
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ContentSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <span className="text-sm font-medium text-primary">Smart workflow</span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground">
            Edit, schedule, and approve from one shared workspace
          </h2>
          <p className="mb-12 mt-4 text-lg leading-relaxed text-foreground/80">
            Teams can update booking notes, run approval actions, and coordinate changes without
            switching between email, sheets, and manual logs.
          </p>
        </div>

        <div className="space-y-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:space-y-0 sm:divide-y sm:p-10">
          <div className="grid gap-8 sm:grid-cols-5 sm:gap-10">
            <CodeIllustration className="sm:col-span-2" />
            <div className="sm:col-span-3 sm:border-l sm:border-border sm:pl-10">
              <h3 className="text-xl font-semibold text-foreground">Automated campaign planning</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Build semester plans from recurring templates and assign the right spaces by
                resource type. ScheduleIt keeps priority events protected while filling open slots.
              </p>
            </div>
          </div>

          <div className="grid gap-8 pt-10 sm:grid-cols-5 sm:gap-10 sm:pt-10">
            <div className="sm:col-span-3 sm:border-r sm:border-border sm:pr-10">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <HugeiconsIcon icon={AiSchedulingIcon} size={20} strokeWidth={1.8} />
                AI meeting scheduler
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Ask ScheduleIt to create or update bookings, summarize meeting load for each week,
                and prepare daily agendas for department coordinators.
              </p>
            </div>
            <div className="row-start-1 flex items-center justify-center sm:col-span-2 sm:row-start-auto">
              <ScheduleIllustration className="pt-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
