import React, { forwardRef, useState, useEffect } from "react";
import { cn } from '../../lib/utils';

export interface LineSpacerProps {
  children?: React.ReactNode;
  className?: string;
  thicknessPx?: number;
  hidden?: boolean;
}

export const LineSpacer = forwardRef<HTMLDivElement, LineSpacerProps>(({ children, thicknessPx = 0.5, className, hidden, ...props }, ref) => {
  // Format the dates

  return (
    <div
      hidden={hidden}
      ref={ref}
      className={cn("w-full items-center justify-center border border-b border-border", className)}
      style={{ borderWidth: thicknessPx }}
      {...props}
    >
      {children}
    </div>
  );
});

LineSpacer.displayName = "LineSpacer";
