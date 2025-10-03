import React, { forwardRef, useState } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";

const CornerIconVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface CornerIconProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof CornerIconVariants> {
  className?: string;
  containerClassName?: string;
  icon: React.ReactNode;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showOnlyOnHover?: boolean;
}

export const CornerIcon = forwardRef<HTMLDivElement, CornerIconProps>(
  ({ className, containerClassName, showOnlyOnHover, variant, size, icon, corner = "top-right", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
      if (showOnlyOnHover) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setTimeout(() => {
        setIsHovered(false);
      }, 120);
    };

    const cornerPositionClasses = {
      "top-left": "-top-2 -left-2",
      "top-right": "-top-2 -right-2",
      "bottom-left": "-bottom-2 -left-2",
      "bottom-right": "-bottom-2 -right-2",
    };

    return (
      <div {...props} className={cn("relative", className)} ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {(!showOnlyOnHover || isHovered) && (
          <div className={cn("absolute z-50 overflow-visible", cornerPositionClasses[corner])}>
            <div className={cn("", CornerIconVariants({ variant, size }))}>
              <div
                className={cn(
                  "w-full h-full overflow-visible bg-background border border-solid border-border rounded-full flex items-center justify-center",
                  containerClassName
                )}
              >
                {icon}
              </div>
            </div>
          </div>
        )}
        {props.children}
      </div>
    );
  }
);

CornerIcon.displayName = "CornerIcon";
