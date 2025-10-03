import React, { forwardRef, useEffect, useRef, useState } from "react";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { HoverCardSimple } from "./HoverCardSimple";
import { Button } from "./Button";

export interface NavigateArrowsProps {
  onNavLeft?: (e: any) => void;
  onNavRight?: (e: any) => void;
}

export const NavigateArrows = forwardRef<HTMLDivElement, NavigateArrowsProps>(({ onNavLeft, onNavRight }, ref) => {
  return (
    <div className="flex gap-x-1 transition-all" hidden={!onNavLeft && !onNavRight}>
      {true && (
        <Button
          onClick={(e: any) => {
            onNavLeft && onNavLeft(e);
          }}
          disabled={!onNavLeft}
          size="blank"
          variant="ghost"
          className="flex items-center rounded-lg bg-tertiary-light/20 p-1 text-secondary-dark hover:bg-purple hover:text-primary-light"
        >
          <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />
        </Button>
      )}
      {true && (
        <Button
          onClick={(e: any) => {
            onNavRight && onNavRight(e);
          }}
          disabled={!onNavRight}
          size="blank"
          variant="ghost"
          className="flex h-full rotate-180 items-center rounded-lg bg-tertiary-light/20 p-1 text-secondary-dark hover:bg-purple hover:text-primary-light"
        >
          <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />
        </Button>
      )}
    </div>
  );
});
NavigateArrows.displayName = "NavigateArrows";
