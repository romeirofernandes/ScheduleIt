import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
        <HugeiconsIcon
          icon={Calendar01Icon}
          size={15}
          strokeWidth={1.8}
          className="text-primary-foreground"
        />
      </div>
      <span className="text-base font-semibold tracking-tight text-foreground">
        ScheduleIt
      </span>
    </div>
  );
}
