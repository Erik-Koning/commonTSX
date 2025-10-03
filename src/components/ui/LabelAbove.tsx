"use client";

import { cn } from '../../lib/utils';
import { forwardRef } from "react";

interface LabelAboveProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string | boolean | undefined | null | React.ReactNode;
  labelClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export const LabelAbove = forwardRef<HTMLDivElement, LabelAboveProps>(({ label, labelClassName, className, children, ...props }, ref) => {
  if (typeof label !== "string" && typeof label !== "object") {
    label = undefined;
  }
  return (
    <>
      {label && <h4 className={cn("flex self-start text-base text-primary-dark", labelClassName)}>{label}</h4>}
      <div className={cn("", !!children && className)} {...props}>
        {children}
      </div>
    </>
  );
});

LabelAbove.displayName = "LabelAbove";
