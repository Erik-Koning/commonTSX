import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import { HoverCardClickable } from "../inputs/HoverCardClickable";
import { getHumanFriendlyDateDifference } from "../../utils/getHumanFriendlyDateDifference";

const SecurityStatusVariants = cva("", {
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

interface SecurityStatusProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof SecurityStatusVariants> {
  className?: string;
  lastReviewed?: Date;
}

export const SecurityStatus = forwardRef<HTMLDivElement, SecurityStatusProps>(({ className, variant, size, lastReviewed, ...props }, ref) => {
  return (
    <div {...props} className={cn("h-full", SecurityStatusVariants({ variant, size }), className)} ref={ref}>
      <HoverCardClickable
        //forceOpen={true}
        className="h-full"
        side={"bottom"}
        sideOffset={-9}
        hoverDelay={800}
        openOnClick={true}
        triggerJSX={
          <div className="flex items-center gap-x-2.5 h-[68%] rounded-md transition-all duration-200 outline outline-[1px] outline-background hover:[@media(min-width:619px)]:outline-border px-3">
            <div className="relative flex items-center justify-center ">
              <div className="w-[14px] h-[14px] bg-greenEnergetic opacity-85 rounded-full" />
              <div className="absolute w-[14px] h-[14px] rounded-full bg-greenEnergetic animate-slow-ping" />
            </div>
            <div className="text-base font-normal text-secondary-dark hidden [@media(min-width:619px)]:block">
              {`${
                lastReviewed
                  ? "Security reviewed " + getHumanFriendlyDateDifference(new Date(), lastReviewed, true, "minute", "hour")
                  : "Security review in-progress"
              }`}
            </div>{" "}
            {/* Start needs to be a date object after the end date to be "ago"*/}
          </div>
        }
        triggerClassName={"flex items-center h-full"}
      >
        <div className="space-y-1 p-1.5 px-2.5 mx-1">
          <div className="text-md font-medium text-primary">Continuously monitoring {process.env.NEXT_PUBLIC_APP_TITLE} security posture.</div>
          <div className="text-sm text-primary/70">We will email your account should this page have any action needed items.</div>
        </div>
      </HoverCardClickable>
    </div>
  );
});

SecurityStatus.displayName = "SecurityStatus";
