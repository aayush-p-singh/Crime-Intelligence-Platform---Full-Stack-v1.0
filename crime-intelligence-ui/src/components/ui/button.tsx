import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-[1px] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#000] text-white hover:bg-[#1a1a1a] shadow-[0_2px_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] border border-[#000]",
        destructive: "bg-[#7F1D1D] text-white hover:bg-[#991B1B] shadow-sm border border-[#7F1D1D]",
        outline:
          "border border-[#00000015] bg-white/60 backdrop-blur-md shadow-sm hover:bg-white hover:border-[#00000030] text-[#111]",
        secondary: "glass-panel text-[#111] hover:bg-white/80 hover:shadow-md",
        ghost: "text-[#555] hover:bg-black/5 hover:text-[#111]",
        link: "text-[#111] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-[13px] rounded-2xl",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-[15px]",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
