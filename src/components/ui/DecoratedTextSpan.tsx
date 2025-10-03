import React, { useEffect, useState } from "react";
import { forwardRef } from "react";

interface DecoratedTextSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  className?: string;
  decoratedTextClassName?: string;
  regex?: RegExp;
}

export const DecoratedTextSpan = forwardRef<HTMLSpanElement, DecoratedTextSpanProps>(
  ({ text, decoratedTextClassName, regex, className, ...props }, ref) => {
    return (
      <span ref={ref} className={className} {...props}>
        {(() => {
          if (!regex) {
            return text;
          }

          const result: React.ReactNode[] = [];
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(text)) !== null) {
            // Push the text before the match
            if (match.index > lastIndex) {
              result.push(text.slice(lastIndex, match.index));
            }

            // Push the decorated match
            result.push(
              <span key={match.index} className={decoratedTextClassName}>
                {match[0]}
              </span>
            );

            // Update lastIndex to after the current match
            lastIndex = regex.lastIndex;
          }

          // Push the remaining text after the last match
          if (lastIndex < text.length) {
            result.push(text.slice(lastIndex));
          }

          return result;
        })()}
      </span>
    );
  }
);

DecoratedTextSpan.displayName = "DecoratedTextSpan";
