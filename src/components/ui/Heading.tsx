import React, { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from "class-variance-authority";
import { ParapgraphWithDifferenceBrackets } from "./ParagraphWithDifferentBrackets";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { HoverCardClickable } from "../inputs/HoverCardClickable";
import { Label } from "./Label";
import { Link } from "./Link";

const headingVariants = cva("text-darkBlue", {
  variants: {
    h: {
      1: "text-3xl text-darkBlue font-medium",
      2: "text-2xl",
      3: "text-xl",
      4: "text-lg font-medium",
      5: "text-base font-normal text-primary-dark",
    },
    padding: {
      0: "",
      1: "p-0 pt-1.5 sm:py-3 lg:pb-6",
      2: "p-0 pt-1.5 sm:py-3 lg:py-6 xl:pt-12",
    },
  },
  defaultVariants: {
    padding: 0,
    h: 4,
  },
});

const subtextVariants = cva("text-primary-dark", {
  variants: {
    subtextSize: {
      1: "text-lg",
      2: "text-base",
      3: "text-base",
      4: "text-sm",
      5: "text-sm text-primary-dark font-light",
    },
    subtextVariant: {
      default: "text-primary-dark",
      primary: "text-primary-dark",
      secondary: "text-secondary-dark text-md font-medium leading-normal pt-1",
    },
  },
  defaultVariants: {
    subtextVariant: "default",
    subtextSize: 5,
  },
});

export interface HeadingProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof headingVariants>, VariantProps<typeof subtextVariants> {
  title?: string;
  subHeading?: string | React.ReactNode;
  subText?: string;
  className?: string;
  headingContainerClassName?: string;
  headingClassName?: string;
  subHeadingClassName?: string;
  subTextClassName?: string;
  specialBracketedClassName?: boolean;
  bracketsRegex?: RegExp;
  prependString?: string;
  prependAfterOpeningBracket?: boolean;
  info?: string;
}

export const Heading = forwardRef<HTMLDivElement, HeadingProps>(
  (
    {
      title,
      subHeading,
      subHeadingClassName,
      subText,
      h,
      headingContainerClassName,
      headingClassName,
      subtextSize,
      className,
      subTextClassName,
      specialBracketedClassName,
      prependString,
      prependAfterOpeningBracket = false,
      bracketsRegex = /\([^)]+\)/g,
      padding,
      subtextVariant,
      info,
      ...props
    },
    ref
  ) => {
    //text-base text-primary-dark pt-[2px] col-span-7
    const subTextClassNameLocal = cn("leading-normal", subtextVariants({ subtextSize: subtextSize ?? h, subtextVariant }), subTextClassName);

    const localHeadingClassName = cn("text-left leading-tight whitespace-nowrap shrink-0", headingClassName);
    return (
      <div className={cn(headingVariants({ padding }), className)} {...props}>
        <div className="flex justify-between items-center gap-2">
          <div className={cn("flex flex-wrap items-baseline gap-x-2", headingVariants({ h }), headingContainerClassName)}>
            {h === 1 ? (
              <h1 className={localHeadingClassName}>{title ?? props.children}</h1>
            ) : (
              <h2 className={localHeadingClassName}>{title ?? props.children}</h2>
            )}
            {subHeading && typeof subHeading === "string" ? (
              <p className={cn("text-secondary-dark font-normal text-left leading-normal min-w-fit", subHeadingClassName)}>{subHeading}</p>
            ) : (
              subHeading
            )}
          </div>
          {info && (
            <HoverCardClickable
              className="text-primary-dark shadow-md"
              //variant={"blank"}
              size={"blank"}
              sideOffset={2}
              //forceOpen={true}
              triggerClassName="flex"
              triggerJSX={<InfoOutlinedIcon style={{ fontSize: 18 }} className="text-tertiary-dark" />}
            >
              <Label variant={"default"} className="p-1.5 bg-primary-light rounded-sm">
                {info}
              </Label>
            </HoverCardClickable>
          )}
        </div>
        {subText && specialBracketedClassName ? (
          <ParapgraphWithDifferenceBrackets
            text={subText}
            prependString={prependString}
            bracketsRegex={bracketsRegex}
            prependAfterOpeningBracket={prependAfterOpeningBracket}
            className={subTextClassNameLocal}
            bracketedClassName="font-normal"
          />
        ) : (
          subText && <p className={cn("leading-normal", subTextClassNameLocal)}>{subText}</p>
        )}
      </div>
    );
  }
);

Heading.displayName = "Heading";
