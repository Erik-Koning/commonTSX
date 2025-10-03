import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";

const TextVariants = cva("", {
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

interface TextProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof TextVariants> {
  className?: string;
}

export const Text = forwardRef<HTMLDivElement, TextProps>(({ className, variant, size, ...props }, ref) => {
  return <div {...props} className={cn("", TextVariants({ variant, size }), className)} ref={ref}></div>;
});

Text.displayName = "Text";
