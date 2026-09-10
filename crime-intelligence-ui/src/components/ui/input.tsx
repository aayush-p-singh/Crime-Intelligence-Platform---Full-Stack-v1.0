import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2 text-sm text-[var(--text-primary)] shadow-xs transition-all duration-150",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "focus:border-[var(--neutral-900)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
