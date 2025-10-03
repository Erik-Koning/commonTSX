import React from "react";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";

const ProgressDotsVariants = cva("", {
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

interface ProgressDotsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof ProgressDotsVariants> {
  className?: string;
  quantity: number;
  current?: number;
  currentWidth?: number;
  nonCurrentWidth?: number;
  height?: number;
}

export const ProgressDots = forwardRef<HTMLDivElement, ProgressDotsProps>(
  ({ className, variant, size, quantity, current = 0, currentWidth = 32, nonCurrentWidth = 16, height = 5, ...props }, ref) => {
    return (
      <div {...props} className={cn("flex justify-center gap-2", ProgressDotsVariants({ variant, size }), className)} ref={ref}>
        {Array.from({ length: quantity }, (_, index) => (
          <motion.div
            key={index}
            className={cn("duration- h-2 rounded-full transition-colors duration-500", index <= current - 1 ? "bg-purple" : "bg-gray-200")}
            animate={{
              width: index === current - 1 ? currentWidth : nonCurrentWidth,
            }}
            transition={{
              ease: "easeInOut",
            }}
            style={{
              height: height,
            }}
          />
        ))}
      </div>
    );
  }
);

ProgressDots.displayName = "ProgressDots";
