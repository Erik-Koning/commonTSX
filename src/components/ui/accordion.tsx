"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from '../../lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<React.ComponentRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(
  ({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  hideChevron?: boolean;
  chevronRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  children: React.ReactNode;
  id?: string;
  key?: string;
  hidden?: boolean;
  rotateChevron?: boolean;
}

const AccordionTrigger = React.forwardRef<React.ComponentRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(
  ({ className, hideChevron, children, chevronRef, rotateChevron = false, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex w-full justify-between">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {!hideChevron && (
          <div ref={chevronRef}>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", rotateChevron && "rotate-180")} />
          </div>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & { animationDuration?: string }
>(({ className, children, animationDuration = "0.22s", ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      //"data-[state=open]:transition-overflow overflow-visible duration-1000 delay-",
      className
    )}
    //Use a property to set the duration of the accordion
    style={animationDuration ? ({ "--accordion-duration": animationDuration } as React.CSSProperties) : undefined}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
