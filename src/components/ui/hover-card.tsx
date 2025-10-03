"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import { getCSSVariable } from '../../utils/styles';
import { colourToHex } from '../../utils/colour';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const hoverCardVariants = cva(
  "z-40 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "",
        tooltip: "px-6 text-md",
        subtle: "bg-border/90 text-secondary-foreground",
        purple: "bg-purple hover:bg-darkPurple text-primary-light justify-center",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        destructiveSubtle: "transition-all duration-200 text-primary hover:underline underline-offset-1 hover:text-red-600",
        outline: "outline outline-input outline-1 bg-background hover:bg-accent hover:text-accent-foreground hover:outline-secondary-dark",
        border: "border border-1 border-offset-background hover:border-secondary-dark",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-secondary-dark hover:bg-faintPurple dark:hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline p-[4px]",
        shine: "group relative h-12 overflow-hidden rounded-md bg-purple px-6 text-neutral-50 transition hover:bg-darkPurple",
        blank: "",
      },
      size: {
        default: "",
        tight: "h-fit w-fit p-0.5",
        slim: "h-[36px] px-2",
        sm: "h-9 rounded-md px-3",
        md: "h-10 rounded-md px-4",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        full: "inline-flex min-w-full w-full h-full justify-center",
        fullTall: "inline-flex min-w-full w-full h-[54px] justify-center",
        fullLine: "flex flex-col w-full justify-center min-w-full",
        fit: "inline-flex w-fit h-fit max-w-full p-1 px-1.5",
        blank: "flex flex-col p-0 m-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface HoverCardProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>, VariantProps<typeof hoverCardVariants> {
  className?: string;
  align?: "center" | "start" | "end";
  sideOffset?: number;
  blank?: boolean;
  showArrow?: boolean;
  arrowColour?: string;
  children: React.ReactNode;
}

const HoverCardContent = React.forwardRef<React.ComponentRef<typeof HoverCardPrimitive.Content>, HoverCardProps>(
  ({ className, align = "center", sideOffset = 4, showArrow = false, arrowColour = "--purple", blank, variant, size, ...props }, ref) => {
    if (variant === "blank") blank = true;

    return (
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          !blank && hoverCardVariants({ variant, size }),
          {
            //underlineAnimation: "hover:hover-underline-animation",
            //isClicked: "static-underline",
            underlineAnimation: "",
            blank: "appearance-none",
          },
          className
        )}
        {...props}
      >
        <HoverCardPrimitive.Arrow
          visibility={showArrow ? "visible" : "hidden"}
          className="shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          style={{
            fill: arrowColour.startsWith("--") ? colourToHex(getCSSVariable(arrowColour)) : arrowColour,
            appearance: "none",
            borderColor: arrowColour.startsWith("--") ? colourToHex(getCSSVariable(arrowColour)) : arrowColour,
          }}
        />
        {props.children}
      </HoverCardPrimitive.Content>
    );
  }
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
