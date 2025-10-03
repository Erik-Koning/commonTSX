"use client";

import * as React from "react";

import { HoverCardClickable } from "./HoverCardClickable";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { cn } from '../../lib/utils';

interface FeatureIconsProps {
  tooltipText: string;
  numRelated: number;
  hoverDelay?: number;
  onClickText?: string;
  side?: "top" | "bottom" | "left" | "right";
  iconSize?: number;
  className?: string;
  showArrow?: boolean;
  iconClassName?: string;
}

export const FeatureIcons = React.forwardRef<HTMLDivElement, FeatureIconsProps>(
  ({ tooltipText, numRelated, side = "bottom", iconSize = 16, className, iconClassName = "", showArrow = false, hoverDelay = 600, onClickText }, ref) => {
    return (
      <HoverCardClickable
        side={side}
        triggerJSX={(() => {
          return numRelated > 0 ? (
            numRelated === 1 ? (
              <KeyboardArrowRightIcon sx={{ fontSize: iconSize }} className={iconClassName} />
            ) : (
              <KeyboardDoubleArrowRightIcon sx={{ fontSize: iconSize }} className={iconClassName} />
            )
          ) : null;
        })()}
        className={cn("text-tertiary-dark hover:text-skyBlue", className)}
      >
        <div className="px-2 py-1 text-sm text-primary-dark">{tooltipText}</div>
      </HoverCardClickable>
    );
  }
);
FeatureIcons.displayName = "FeatureIcons";
