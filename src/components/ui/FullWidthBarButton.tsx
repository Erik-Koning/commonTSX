import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import { Button, ButtonProps } from "./Button";
import { cssVarHexToRgba } from "../../utils/colour";

// 1. Define new variants for the FullWidthBarButton
const fullWidthBarButtonVariants = cva(
  "h-5 hover:h-9 transition-colors duration-200 ease-in-out flex items-center justify-center relative z-10", // Base classes for the bar
  {
    variants: {
      barTheme: {
        default:
          "bg-gradient-to-r from-lightPurple via-lightPurple to-lightPurple group-hover:from-darkPurple group-hover:via-purple group-hover:to-darkPurple",
        success:
          "bg-gradient-to-r from-green-400 via-green-500 to-green-600 group-hover:from-green-500 group-hover:via-green-600 group-hover:to-green-700",
        warning:
          "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 group-hover:from-yellow-500 group-hover:via-yellow-600 group-hover:to-yellow-700",
        outlined: "border bg-faintPurple border-lightPurple/50 group-hover:bg-lightPurple group-hover:text-white",
      },
      // You can add more variant types here, e.g., barSize, etc.
    },
    defaultVariants: {
      barTheme: "default",
    },
  }
);

// 2. Update FullWidthBarButtonProps
interface FullWidthBarButtonProps
  extends Omit<ButtonProps, "variant" | "size" | "bg" | "textSize" | "widthVariant">, // Omit Button's styling variants
    VariantProps<typeof fullWidthBarButtonVariants> {
  // className, children, onClick, tooltip etc. are inherited from ButtonProps (or Omit<ButtonProps, ...>)
}

export const FullWidthBarButton = forwardRef<
  HTMLButtonElement, // 4. Correct ref type to HTMLButtonElement
  FullWidthBarButtonProps
>(({ className, barTheme, children, tooltip, ...props }, ref) => {
  // 3. Destructure new variants
  const [isHovered, setIsHovered] = useState(false); // This state seems unused now that hover is handled by group-hover in CVA

  const darkPurpleRGBAString = cssVarHexToRgba("--darkPurple") ?? "";

  return (
    <Button
      id={props.id ?? "fullWidthBarButton"}
      ref={ref}
      {...props} // Pass down remaining ButtonProps (like onClick, id, etc.)
      className={cn("min-w-0 w-full", className)} // className for the root Button can be passed via buttonSpecificProps
      variant={"blank"} // Underlying button is always blank
      size={"blank"} // Underlying button is always blank
      // onMouseEnter/Leave could be removed if CVA group-hover is sufficient
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tooltip={tooltip}
    >
      <div className="relative w-full mx-2 group cursor-pointer hover:opacity-90 transition-all duration-200 ease-in-out">
        <div
          style={{
            borderRadius: isHovered ? "0% 0% 7% 7% / 0% 0% 100% 100%" : "0% 0% 7% 7% / 0% 0% 100% 100%", // This could also become part of a variant if needed
          }}
          // 3. Apply the new variants here using cn. `className` from props is merged by cva.
          className={cn(fullWidthBarButtonVariants({ barTheme, className }))}
        >
          <div
            className="absolute -z-10 inset-0"
            style={
              isHovered && darkPurpleRGBAString
                ? {
                    backgroundImage: `radial-gradient(circle at center, ${darkPurpleRGBAString}, transparent)`,
                  }
                : undefined // Or some default style if needed
            }
          />
          <div className="group flex items-center gap-2 text-white">
            {" "}
            {/* Ensure this inner 'group' doesn't conflict if outer hover is main driver */}
            {children}
            {props.title && (
              <span
                className={cn(
                  props.title
                    ? "w-0 text-sm opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out"
                    : "hidden w-0",
                  isHovered && "text-md w-fit",
                  ""
                )}
              >
                {props.title}
              </span>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
});

FullWidthBarButton.displayName = "FullWidthBarButton";
