import React, { forwardRef, useState, useEffect } from "react";
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from "class-variance-authority";
import { LineSpacer } from "./LineSpacer";

const spacedBoxVariants = cva("peer transition-all w-full appearance-none rounded-md", {
  variants: {
    padding: {
      none: "",
      sm: "py-2",
      md: "py-4",
      lg: "py-6",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

export interface SpacedBoxProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spacedBoxVariants> {
  children?: React.ReactNode;
  className?: string;
  lineSpacer?: boolean;
  lineSpacerAbove?: boolean;
}

export const SpacedBox = forwardRef<HTMLDivElement, SpacedBoxProps>(({ children, className, padding, lineSpacer, lineSpacerAbove, ...props }, ref) => {
  // Format the dates

  return (
    <>
      {lineSpacerAbove && <LineSpacer className="" />}
      <div ref={ref} className={cn(spacedBoxVariants({ padding }), "border-b-1 w-full  border-border", className)} {...props}>
        {children}
      </div>
      {lineSpacer && <LineSpacer className="" />}
    </>
  );
});

SpacedBox.displayName = "SpacedBox";
