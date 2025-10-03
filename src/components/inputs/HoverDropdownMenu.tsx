"use client";

import React, { ReactElement, useRef, useState } from "react";

import { HoverCard, HoverCardContent, HoverCardProps, HoverCardTrigger } from "../ui/hover-card";
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/DropdownMenu";
import { cn } from '../../lib/utils';

interface HoverDropdownMenuProps {
  forceCardOpen?: boolean;
  forceOpen?: boolean;
  triggerJSX: ReactElement | null;
  cardJSX?: ReactElement | null;
  cardClassName?: string;
  hoverDelay?: number;
  hoverExitDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  triggerClassName?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  sideOffset?: number;

  style?: React.CSSProperties;
  variant?: HoverCardProps["variant"];
  size?: HoverCardProps["size"];
}

export const HoverDropdownMenu = React.forwardRef<HTMLDivElement, HoverDropdownMenuProps>(
  (
    {
      triggerJSX,
      side = "bottom",
      className,
      triggerClassName,
      showArrow = false,
      forceCardOpen = undefined,
      forceOpen = undefined,
      sideOffset,
      hoverDelay = 450,
      hoverExitDelay = 800,
      style,
      variant,
      size,
      cardClassName,
      cardJSX,
      children,
    },
    ref
  ) => {
    const [enableCardUnengage, setEnableCardUnengage] = useState(false);
    const [enableMenuUnengage, setEnableMenuUnengage] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const onHoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [cardOpen, setCardOpen] = useState(false);

    const enableUnengageDelay = 200;

    //dropdown menu
    const handleMenuOpen = () => {
      if (menuOpen) {
        handleMenuClose();
        return;
      }
      //open menu
      setMenuOpen(true);
      setCardOpen(false);
      setTimeout(() => {
        setEnableMenuUnengage(true);
      }, enableUnengageDelay);
    };
    const handleMenuClose = () => {
      setMenuOpen(false);
      if (cardOpen) setCardOpen(false);
      setEnableMenuUnengage(false);
    };

    //hover card
    const handleCardOpen = () => {
      setCardOpen(true);
      setTimeout(() => {
        setEnableCardUnengage(true);
      }, enableUnengageDelay);
    };

    const handleCardClose = () => {
      setCardOpen(false);
      setEnableCardUnengage(false);
    };

    const openOnHover = () => {
      //menu is open, don't open the card
      if (menuOpen) return;
      // Open after a delay set in hoverDelay
      onHoverTimeout.current = setTimeout(() => {
        handleCardOpen();
      }, hoverDelay);
    };

    const handleMouseLeave = () => {
      //if already open leave it up to the handleUSerUnengaged to close it
      if (cardOpen) return;
      // Cancel the open immediately if the mouse leaves
      if (onHoverTimeout.current) {
        clearTimeout(onHoverTimeout.current);
        onHoverTimeout.current = null;
      }
      handleCardClose();
    };

    const handleCloseAll = () => {
      handleMenuClose();
      handleCardClose();
    };

    useUserUnengaged([triggerRef, cardRef], handleCardClose, hoverExitDelay, enableCardUnengage);
    useUserUnengaged([triggerRef, menuRef], handleMenuClose, hoverExitDelay, enableMenuUnengage);

    return (
      <DropdownMenu open={forceOpen ?? menuOpen}>
        <HoverCard openDelay={800} open={forceCardOpen ?? cardOpen}>
          <HoverCardTrigger asChild>
            <DropdownMenuTrigger
              asChild
              ref={triggerRef}
              className={cn("cursor-pointer", triggerClassName)}
              onClick={handleMenuOpen}
              onMouseEnter={openOnHover}
              onMouseLeave={handleMouseLeave}
            >
              {triggerJSX}
            </DropdownMenuTrigger>
          </HoverCardTrigger>
          <HoverCardContent ref={cardRef} className={cn("w-full p-2.5", cardClassName)} variant={variant} size={size}>
            {cardJSX}
          </HoverCardContent>
          <DropdownMenuContent
            style={{ ...style, width: "min-content !important" }}
            side={side}
            sideOffset={sideOffset}
            ref={menuRef}
            className={cn("w-fit p-0", className)}
          >
            {children}
          </DropdownMenuContent>
        </HoverCard>
      </DropdownMenu>
    );
  }
);
HoverDropdownMenu.displayName = "HoverDropdownMenu";
