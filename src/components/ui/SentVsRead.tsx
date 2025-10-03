import React from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import CallMadeOutlinedIcon from "@mui/icons-material/CallMadeOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

const SentVsReadVariants = cva("flex items-center gap-x-2 text-xs text-gray-600", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface SentVsReadProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof SentVsReadVariants> {
  className?: string;
  numSent?: number;
  numRead?: number;
  subtractReadFromSent?: boolean;
  allowTooltip?: boolean;
  sentClassName?: string;
  readClassName?: string;
}

export const SentVsRead = forwardRef<HTMLDivElement, SentVsReadProps>(
  (
    { className, variant, size, numSent = 0, numRead = 0, subtractReadFromSent = false, allowTooltip = true, sentClassName, readClassName, ...props },
    ref
  ) => {
    const effectiveNumSent = subtractReadFromSent ? Math.max(0, numSent - numRead) : numSent;
    const showSent = effectiveNumSent > 0;
    const showRead = numRead > 0;

    if (!showSent && !showRead) {
      return null;
    }

    return (
      <TooltipProvider delayDuration={100} disableHoverableContent={!allowTooltip}>
        <Tooltip open={allowTooltip ? undefined : false}>
          <TooltipTrigger asChild>
            <div {...props} className={cn(SentVsReadVariants({ variant, size }), className)} ref={ref}>
              {showSent && (
                <span className={cn("flex items-center gap-x-0.5", sentClassName)}>
                  <CallMadeOutlinedIcon fontSize="inherit" />
                  <span>{effectiveNumSent}</span>
                </span>
              )}
              {showRead && (
                <span className={cn("flex items-center gap-x-0.5", readClassName)}>
                  <DoneAllOutlinedIcon fontSize="inherit" />
                  <span>{numRead}</span>
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs" showArrow={false}>
            {subtractReadFromSent ? `${effectiveNumSent} Unread, ${numRead} Read` : `${numSent} Sent, ${numRead} Read`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

SentVsRead.displayName = "SentVsRead";
