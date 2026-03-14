'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiSchedulingIcon,
  Analytics01Icon,
  BookOpen01Icon,
  CalendarCheckInIcon,
  CheckmarkCircle02Icon,
  NoteEditIcon,
  PinCodeIcon,
  SchoolIcon,
  Shield01Icon,
  TimeQuarterPassIcon,
} from '@hugeicons/core-free-icons';
import AnimatedNotificationList from '@/components/AnimatedNotificationList';
import { BentoGridShowcase } from '@/components/BentoGridShowcase';
import Folder from '@/components/Folder';
import { cn } from '@/lib/utils';

function StickyNotesBoard() {
  const notes = [
    { text: 'Lab practical\nTue 10:00', color: '#FDE68A', rotate: '-8deg', top: '8%', left: '8%' },
    { text: 'Hall booked\nDept seminar', color: '#BFDBFE', rotate: '6deg', top: '20%', left: '42%' },
    { text: 'Projector\nReturn 5pm', color: '#FBCFE8', rotate: '-3deg', top: '45%', left: '20%' },
    { text: 'Robotics meet\nFri 4:00', color: '#BBF7D0', rotate: '7deg', top: '55%', left: '56%' },
  ];

  return (
    <div className="relative h-[220px] rounded-xl border border-border bg-muted/40 p-4">
      {notes.map((note) => (
        <div
          key={note.text}
          className="absolute h-20 w-28 rounded-md p-2 text-[11px] font-medium leading-snug text-[#1A1A1A] shadow-md transition-transform hover:scale-105"
          style={{
            backgroundColor: note.color,
            transform: `rotate(${note.rotate})`,
            top: note.top,
            left: note.left,
          }}
        >
          <div className="mb-1 flex items-center gap-1 text-[#6B7280]">
            <HugeiconsIcon icon={PinCodeIcon} size={12} strokeWidth={2} />
            Note
          </div>
          {note.text}
        </div>
      ))}
    </div>
  );
}

function CampusKit() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'ID Card', icon: NoteEditIcon },
        { label: 'Lab Book', icon: BookOpen01Icon },
        { label: 'Equipment', icon: SchoolIcon },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-muted px-3 py-4 text-center">
          <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} className="mx-auto mb-2 text-primary" />
          <p className="text-xs font-medium text-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ title, description, icon, className, children }) {
  return (
    <article
      className={cn(
        'relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </article>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 pb-0">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Features</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A booking stack built for real campus operations
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            ScheduleIt keeps availability, approvals, and reporting in one place so teams can
            run labs, rooms, and equipment without scheduling chaos.
          </p>
        </div>

        <BentoGridShowcase
          integration={
            <FeatureCard
              title="Resource hub"
              description="All labs, halls, and equipment live in a single searchable catalog with availability in real time."
              icon={<HugeiconsIcon icon={CalendarCheckInIcon} size={20} strokeWidth={1.8} />}
              className="flex flex-col"
            >
              <AnimatedNotificationList
                visibleCount={5}
                items={[
                  { type: 'lecture', text: 'Next lecture: Control Systems, Room E-302, 9:30 AM' },
                  { type: 'approval', text: 'Your request for Seminar Hall B has been approved' },
                  { type: 'lecture', text: 'Next lecture: DBMS, Lab L-11, 1:00 PM' },
                  { type: 'approval', text: 'Projector booking for Workshop Bay is confirmed' },
                  { type: 'notice', text: 'Reminder: Return Chemistry kit to Store Room by 6:00 PM' },
                ]}
              />

              <div className="mt-4 flex min-h-[170px] items-center justify-center rounded-xl border border-border bg-muted/40">
                <Folder
                  color="#E8733A"
                  size={1.15}
                  items={[
                    <div key="a" className="h-full w-full p-2 text-[9px] leading-tight text-[#141414]">
                      Applied Physics<br />Room B-204
                    </div>,
                    <div key="b" className="h-full w-full p-2 text-[9px] leading-tight text-[#141414]">
                      Hall B Request<br />Approved
                    </div>,
                    <div key="c" className="h-full w-full p-2 text-[9px] leading-tight text-[#141414]">
                      Lab C-12<br />10:30 AM Slot
                    </div>,
                  ]}
                />
              </div>
            </FeatureCard>
          }
          trackers={
            <FeatureCard
              title="Live conflict prevention"
              description="Overlapping requests are blocked before submission so no one double-books shared resources."
              icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} strokeWidth={1.8} />}
            >
              <StickyNotesBoard />
            </FeatureCard>
          }
          statistic={
            <FeatureCard
              title="Approval SLAs"
              description="Track pending approvals by department and keep response time under policy targets."
              icon={<HugeiconsIcon icon={TimeQuarterPassIcon} size={20} strokeWidth={1.8} />}
            >
              <p className="text-3xl font-semibold text-foreground">2h 18m</p>
              <p className="mt-1 text-xs text-muted-foreground">Average admin response</p>
            </FeatureCard>
          }
          focus={
            <FeatureCard
              title="Role-based controls"
              description="Student, faculty, and admin permissions ensure each user sees the right resources and actions."
              icon={<HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={1.8} />}
            >
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {['Student', 'Faculty', 'Admin'].map((role) => (
                  <span key={role} className="rounded-md border border-border bg-background px-2 py-1 text-muted-foreground">
                    {role}
                  </span>
                ))}
              </div>
              <CampusKit />
            </FeatureCard>
          }
          productivity={
            <FeatureCard
              title="AI schedule suggestions"
              description="Recommend the best open slots based on resource rules, expected demand, and timing windows."
              icon={<HugeiconsIcon icon={AiSchedulingIcon} size={20} strokeWidth={1.8} />}
            >
              <div className="rounded-xl border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
                Suggesting 3 low-conflict slots for Week 14
              </div>
            </FeatureCard>
          }
        />
      </div>
    </section>
  );
}
