'use client';

import { Button } from '@/components/ui/button';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg backdrop-blur-[2px] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            Start with one department, scale to the whole campus
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80">
            Launch quickly with guided setup, role mapping, and data migration. Choose a plan that
            matches your institution size and booking volume.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg">Request Pricing</Button>
            <Button variant="secondary" size="lg">Talk to Sales</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
