import { cn } from '../../lib/utils';
import { forwardRef } from "react";
import { hexColorValidation, isValidRulesString } from '../../lib/validations/reactHookFormValidations';

interface SwatchBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  child?: React.ReactNode;
  className?: string;
}

export const SwatchBlock = forwardRef<HTMLDivElement, SwatchBlockProps>(({ color, className, children, ...props }, ref) => {
  // Apply a diagonal red line if no color is provided
  const defaultStyle =
    color && color?.length > 3 && isValidRulesString(color, hexColorValidation)
      ? { backgroundColor: color }
      : {
          background: "linear-gradient(-45deg, transparent 49%, red 49%, red 51%, transparent 51%)",
          outline: "1px solid hsl(var(--border))",
        };

  return (
    <div
      className={cn("mt-[4px] h-[30px] w-[30px] cursor-pointer rounded-md outline outline-[1px] outline-border hover:outline-secondary-dark", className)}
      style={{ ...defaultStyle }}
      {...props}
    >
      {children}
    </div>
  );
});

SwatchBlock.displayName = "SwatchBlock";
