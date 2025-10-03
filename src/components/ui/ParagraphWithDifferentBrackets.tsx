import { cn } from '../../lib/utils';
import { debug } from "console";
import React, { forwardRef } from "react";

interface ParapgraphWithDifferenceBracketsProps {
  className?: string;
  bracketedClassName?: string;
  text: string;
  prependString?: string;
  regex?: RegExp;
  prependAfterOpeningBracket?: boolean;
  bracketsRegex?: RegExp;
}

export const ParapgraphWithDifferenceBrackets = forwardRef<HTMLDivElement, ParapgraphWithDifferenceBracketsProps>(
  ({ text, className, bracketedClassName, prependString = "", prependAfterOpeningBracket = false, bracketsRegex = /\([^)]+\)/g }, ref) => {
    const bracketedParts = text.match(bracketsRegex) || [];
    const nonBracketedParts = text.split(bracketsRegex);

    return (
      <div className={cn("flex items-baseline gap-x-1", className)}>
        {nonBracketedParts.map((part, index) => {
          if (!part) return null;
          else
            return (
              <React.Fragment key={index}>
                <p className={cn("justify-start font-medium  shadow-none", className)}>{part}</p>
                {bracketedParts[index] && (
                  <p className={cn("justify-start whitespace-normal shadow-none", bracketedClassName)}>
                    {prependAfterOpeningBracket
                      ? bracketedParts[index][0] + prependString + bracketedParts[index].substring(1)
                      : prependString + bracketedParts[index]}
                  </p>
                )}
              </React.Fragment>
            );
        })}
      </div>
    );
  }
);

ParapgraphWithDifferenceBrackets.displayName = "ParapgraphWithDifferenceBrackets";
