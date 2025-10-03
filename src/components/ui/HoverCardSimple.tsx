import { cn } from '../../lib/utils';
import React, { forwardRef, useEffect, useRef, useState } from "react";

export interface HoverCardSimpleProps {
  children?: React.ReactNode;
  className?: string;
}

export const HoverCardSimple = forwardRef<HTMLDivElement, HoverCardSimpleProps>(({ children, className }, ref) => {
  return (
    <div className={cn("m-1 rounded-md border border-border px-2 py-0.5 hover:border-neutral-500 hover:shadow-sm", className)}>{children ?? "Link"}</div>
  );
});
HoverCardSimple.displayName = "HoverCardSimple";
