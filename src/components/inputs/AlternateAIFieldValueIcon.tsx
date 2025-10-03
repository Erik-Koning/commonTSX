import React, { ReactElement, ReactNode } from "react";
import { forwardRef } from "react";
import { HoverCardClickable } from "./HoverCardClickable";
import { cn } from '../../lib/utils';
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Button } from "../ui/Button";

interface AlternateAIFieldValueIconProps extends React.HTMLAttributes<HTMLDivElement> {
  alternateValues: string[];
  alternateValuesLabels: string[];
  textState?: string | string[] | Record<string, any>;
  triggerJSX?: ReactElement | null;
  side?: "top" | "bottom" | "left" | "right";
  triggerClassName?: string;
  className?: string;
  sideOffset?: number;
  handleAlternativeSelect?: (value: string) => void;
}

export const AlternateAIFieldValueIcon = forwardRef<HTMLDivElement, AlternateAIFieldValueIconProps>(
  (
    {
      textState,
      side = "top",
      sideOffset = -12,
      className,
      triggerClassName,
      alternateValues,
      alternateValuesLabels,
      triggerJSX,
      handleAlternativeSelect,
      ...props
    },
    ref
  ) => {
    //if (textState && typeof textState === "string" && textState?.includes("Grewel")) debugger;

    return (
      <HoverCardClickable
        //forceOpen={true}
        side={side}
        sideOffset={sideOffset}
        className={cn("px-1", className)}
        triggerJSX={triggerJSX ?? <AutoAwesomeIcon sx={{ fontSize: 14 }} className={cn(triggerClassName)} />}
        triggerClassName={triggerClassName}
      >
        <p className="text-sm">Change the field value</p>
        <div className="flex gap-x-2">
          {alternateValues.map((value, index) => {
            //debugger;
            //if the value is not the same as the current value, show the button
            const isDifferent =
              (typeof textState === "string" && textState !== value) ||
              (textState && !Array.isArray(textState) && typeof textState === "object" && value !== (textState as Record<string, any>).value) ||
              (Array.isArray(textState) &&
                !textState.some((v) => {
                  if (v && typeof v === "object") return v.hasOwnProperty("value") ? (v as Record<string, any>).value !== value : false;
                  if (typeof v === "string") return v !== value;
                }));
            if (value !== undefined) {
              return (
                <Button
                  key={"changeField" + index}
                  variant="link"
                  size={"tight"}
                  className={cn("px-0 py-0 pb-1 text-secondary-dark", {
                    "hover:text-purple": isDifferent,
                    "cursor-default text-darkPurple underline": !isDifferent,
                  })}
                  onClick={() => {
                    if (!isDifferent) return;
                    handleAlternativeSelect && handleAlternativeSelect(value);
                  }}
                >
                  <span>{alternateValuesLabels[index]}</span>
                </Button>
              );
            }
          })}
        </div>
      </HoverCardClickable>
    );
  }
);

AlternateAIFieldValueIcon.displayName = "AlternateAIFieldValueIcon";
