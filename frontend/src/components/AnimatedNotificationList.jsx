'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, CheckmarkBadge02Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

const notificationMeta = {
  lecture: { icon: Calendar03Icon, label: 'Class update', dotClass: 'bg-blue-500' },
  approval: { icon: CheckmarkBadge02Icon, label: 'Approval', dotClass: 'bg-emerald-500' },
  notice: { icon: Mail01Icon, label: 'Notice', dotClass: 'bg-amber-500' },
};

const ITEM_HEIGHT = 66;
const ITEM_GAP = 8;
const CONTAINER_SLOTS = 5;

function AnimatedItem({ children, onMouseEnter, index }) {
  return (
    <motion.div
      layout
      className="h-[66px]"
      onMouseEnter={onMouseEnter}
      initial={{ opacity: 0, scale: 0.985, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -10 }}
      transition={{
        layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.22, ease: 'easeOut', delay: index * 0.015 },
        y: { type: 'spring', stiffness: 220, damping: 28, delay: index * 0.015 },
        scale: { duration: 0.2, ease: 'easeOut', delay: index * 0.015 },
      }}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedNotificationList({ items, className, visibleCount = 3, interval = 2000 }) {
  const [selectedId, setSelectedId] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const sequenceRef = useRef(0);

  const resolvedItems = useMemo(
    () =>
      items || [
        { type: 'lecture', text: 'Next lecture: Thermodynamics, Room B-204, 10:00 AM' },
        { type: 'approval', text: 'Your request for Seminar Hall A was approved' },
        { type: 'lecture', text: 'Next lecture: Data Structures, Lab 2, 2:00 PM' },
        { type: 'approval', text: 'Lab C-12 booking approved for Robotics Club' },
        { type: 'notice', text: 'Reminder: Return projector kit to Admin Desk by 5:30 PM' },
      ],
    [items]
  );

  const templates = useMemo(
    () => resolvedItems.map((item, index) => ({ ...item, baseId: `${item.type}-${index}` })),
    [resolvedItems]
  );

  useEffect(() => {
    if (templates.length === 0) {
      setVisibleItems([]);
      sequenceRef.current = 0;
      return;
    }

    const count = Math.max(1, visibleCount);
    const initial = Array.from({ length: count }, (_, index) => {
      const template = templates[index % templates.length];
      const sequence = index + 1;
      return {
        ...template,
        id: `${template.baseId}-${sequence}`,
      };
    });

    sequenceRef.current = initial.length;
    setVisibleItems(initial);
    setSelectedId(null);
  }, [templates, visibleCount]);

  useEffect(() => {
    if (templates.length === 0) return undefined;

    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        const count = Math.max(1, visibleCount);
        const lastBaseId = prev.length > 0 ? prev[prev.length - 1].baseId : null;
        let nextTemplate = templates[Math.floor(Math.random() * templates.length)];

        if (templates.length > 1 && nextTemplate.baseId === lastBaseId) {
          const nextTemplateIndex = (templates.findIndex((item) => item.baseId === lastBaseId) + 1) % templates.length;
          nextTemplate = templates[nextTemplateIndex];
        }

        sequenceRef.current += 1;
        const newItem = {
          ...nextTemplate,
          id: `${nextTemplate.baseId}-${sequenceRef.current}`,
        };

        return [...prev, newItem].slice(-count);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval, templates, visibleCount]);

  useEffect(() => {
    if (!selectedId) return;
    if (visibleItems.some((item) => item.id === selectedId)) return;
    setSelectedId(null);
  }, [selectedId, visibleItems]);

  const listHeight = CONTAINER_SLOTS * ITEM_HEIGHT + (CONTAINER_SLOTS - 1) * ITEM_GAP;

  return (
    <div className={cn('w-full rounded-xl border border-border bg-muted/35 p-2.5', className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Live notifications</p>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-foreground/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-hidden" style={{ height: `${listHeight}px` }}>
        <AnimatePresence mode="sync" initial={false}>
          {visibleItems.map((item, index) => {
            const meta = notificationMeta[item.type] || notificationMeta.notice;

            return (
              <AnimatedItem key={item.id} index={index} onMouseEnter={() => setSelectedId(item.id)}>
                <div
                  className={cn(
                    'h-full rounded-md border border-border bg-background px-3 py-2.5 shadow-xs transition-colors',
                    selectedId === item.id && 'bg-accent/60'
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/75">
                      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {visibleItems.length - 1 - index === 0
                        ? 'Just now'
                        : `${visibleItems.length - 1 - index}m ago`}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <HugeiconsIcon icon={meta.icon} size={15} strokeWidth={1.8} className="mt-0.5 text-primary" />
                    <p className="overflow-hidden text-[12px] leading-4 text-foreground/90 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
