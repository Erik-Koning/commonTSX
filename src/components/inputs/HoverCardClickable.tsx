"use client";

import React, { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

import { HoverCard, HoverCardContent, HoverCardProps, HoverCardTrigger } from "../ui/hover-card";
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { cn } from '../../lib/utils';

interface HoverCardClickableProps extends HoverCardProps {
  triggerJSX: ReactNode | null;
  hoverDelay?: number;
  hoverExitDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  triggerClassName?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  sideOffset?: number;
  forceOpen?: boolean;
  openOnClick?: boolean;
}

export const HoverCardClickable = React.forwardRef<HTMLDivElement, HoverCardClickableProps>(
  (
    {
      triggerJSX,
      side = "bottom",
      variant = "default",
      size = "default",
      className,
      triggerClassName,
      showArrow = false,
      openOnClick = true,
      forceOpen,
      sideOffset,
      hoverDelay = 450,
      hoverExitDelay = 800,
      children,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [enableUnengage, setEnableUnengage] = useState(false);
    const popoverMenu = useRef<HTMLDivElement>(null);
    const popoverTrigger = useRef<HTMLAnchorElement>(null);
    const onHoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleClose = () => {
      setOpen(false);
      setEnableUnengage(false);
    };

    useUserUnengaged([popoverMenu, popoverTrigger], handleClose, hoverExitDelay, enableUnengage);

    const handleTriggerClick = () => {
      if (open) {
        handleClose();
      } else {
        if (openOnClick) handleOpen();
      }
    };

    const handleOpen = () => {
      setOpen(true);
      setTimeout(() => {
        setEnableUnengage(true);
      }, 350);
    };

    const openOnHover = () => {
      // Open after a delay set in hoverDelay
      onHoverTimeout.current = setTimeout(() => {
        handleOpen();
      }, hoverDelay);
    };

    const handleMouseLeave = () => {
      //if already open leave it up to the handleUSerUnengaged to close it
      if (open) return;
      // Cancel the open immediately if the mouse leaves
      if (onHoverTimeout.current) {
        clearTimeout(onHoverTimeout.current);
        onHoverTimeout.current = null;
      }
      handleClose();
    };

    return (
      <HoverCard open={forceOpen !== undefined ? forceOpen : open}>
        <HoverCardTrigger
          ref={popoverTrigger}
          className={cn("cursor-pointer", triggerClassName)}
          onMouseDown={handleTriggerClick}
          onMouseEnter={openOnHover}
          onMouseLeave={handleMouseLeave}
        >
          {triggerJSX}
        </HoverCardTrigger>
        <HoverCardContent
          style={{ width: "min-content !important" }}
          variant={variant}
          size={size}
          side={side}
          sideOffset={sideOffset}
          ref={popoverMenu}
          className={cn("w-fit p-0", className)}
          {...props}
        >
          {children}
        </HoverCardContent>
      </HoverCard>
    );
  }
);
HoverCardClickable.displayName = "HoverCardClickable";
