import React, { forwardRef } from "react";
import { Button, ButtonProps } from "./Button";
import { cn } from '../../lib/utils';

export interface ListOfButtonsProps {
  id: string;
  options: string[] | Record<string, any>[];
  onSelect: (choice: number | null) => void;
  noOptionsCallback?: (choice: number | null) => void;
  allowSkip?: boolean;
  header?: string;
  buttonClassName?: string;
  className?: string;
  buttonProps?: ButtonProps;
}

export const ListOfButtons = forwardRef<HTMLDivElement, ListOfButtonsProps>(
  ({ id, allowSkip, options, onSelect, header, buttonClassName, className, buttonProps, noOptionsCallback }, ref) => {
    if (!options || options.length === 0) {
      if (noOptionsCallback) {
        setTimeout(() => {
          //noOptionsCallback(null);
        }, 5);
      }
      return null;
    }

    if (allowSkip && options.length > 0) {
      if (typeof options[0] === "string") {
        (options as string[]).push("Skip");
      } else {
        if (!options.some((option) => Object.keys(option)[0] === "Skip")) {
          (options as Record<string, any>[]).push({
            Skip: "__Skip__",
          });
        }
      }
    }

    return (
      <div ref={ref} className={cn(className)}>
        <h2 className="mb-2">{header}</h2>
        <div className="flex flex-col gap-y-2">
          {options.map((choice, index) => {
            // Determine if the choice is a string or an object
            const isString = typeof choice === "string";
            const key = isString ? choice : Object.keys(choice)[0];
            //The value is likely the id
            const value = isString ? key : choice[key];

            return (
              <Button
                key={`${key}-${index}`}
                onClick={() => {
                  if (value === "__Skip__") {
                    onSelect(null);
                  } else {
                    onSelect(index);
                  }
                }}
                variant="ghost"
                size="fullLine"
                className={cn("", buttonClassName, buttonProps?.className)}
                //innerClassName="whitespace-nowrap"
                {...buttonProps}
              >
                {key}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }
);

ListOfButtons.displayName = "ListOfButtons";
