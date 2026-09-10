import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#E8E8E8] bg-white/80 backdrop-blur-md text-[#111]",
        secondary: "border-[#E8E8E8] bg-[#F5F5F5] text-[#666]",
        destructive: "border-[#FCA5A5]/60 bg-[#FEF2F2] text-[#7F1D1D]",
        outline: "border-[#E8E8E8] text-[#111]",
        success: "border-[#A7F3D0]/60 bg-[#F2FBF7] text-[#1E3A2F]",
        warning: "border-[#FDE047]/60 bg-[#FEFCE8] text-[#713F12]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
