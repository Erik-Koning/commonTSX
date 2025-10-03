import { useMaxWidthBetween } from '../../hooks/useMaxWidthBetween';
import useOverflowing from '../../hooks/useOverflowing';
import { cn } from '../../lib/utils';
import { colourIsDark, lightenHex } from '../../utils/colour';
import { setRefs } from '../../utils/ref';
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, useEffect, useRef, useState } from "react";

const ErrorLabelVariants = cva("", {
  variants: {
    size: {
      default: "",
      xs: "text-xs font-normal",
      sm: "text-sm font-normal rounded-md",
      blank: "",
    },
    variant: {
      default: "left-0 z-40 my-1 text-sm text-rose-500",
      purple: "bg-purple text-white outline-darkPurple px-[5px] py-0",
      blank: "bg-transparent outline-none rounded-none outline-0 px-0 py-0",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

interface ErrorLabelProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof ErrorLabelVariants> {
  className?: string;
  show?: boolean;
  children?: React.ReactNode;
}

export const ErrorLabel = forwardRef<HTMLDivElement, ErrorLabelProps>(({ className, show, size, variant, children, ...props }, ref) => {
  if (!show) return null;
  return (
    <div {...props}>
      <span className={cn(ErrorLabelVariants({ size, variant }))}>{children}</span>
    </div>
  );
});

ErrorLabel.displayName = "ErrorLabel";
