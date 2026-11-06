import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-sm hover:bg-brand-hover active:translate-y-px",
        secondary:
          "bg-panel text-ink hover:bg-line/60 active:translate-y-px",
        outline:
          "border border-line bg-surface text-ink hover:bg-panel active:translate-y-px",
        ghost: "text-ink hover:bg-panel",
        danger:
          "bg-danger text-white hover:bg-danger/90 active:translate-y-px",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-5 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
