'use client';

import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CallToAction() {
  const router = useRouter();
  return (
    <section id="cta" className="py-24 pb-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between gap-y-6 border-y px-4 py-8">
            <PlusIcon className="absolute left-[-11.5px] top-[-12.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute right-[-11.5px] top-[-12.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute bottom-[-12.5px] right-[-11.5px] z-1 size-6" strokeWidth={1} />

            <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
            <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />
            <div className="-z-10 absolute left-1/2 top-0 h-full border-l border-dashed" />

            <div className="space-y-1">
              <h2 className="text-balance text-center text-2xl font-bold">Launch campus bookings that actually run on time.</h2>
              <p className="text-pretty text-center text-muted-foreground">
                Start your ScheduleIt workspace today and coordinate rooms, labs, and approvals from one place.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => router.push('/signup')}>
                Start Now <ArrowRightIcon className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
