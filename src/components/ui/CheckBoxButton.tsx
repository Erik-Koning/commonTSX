"use client";

import * as React from "react";
import { Button } from "./Button";
import { cn } from '../../lib/utils';
import { VariantProps, cva } from "class-variance-authority";
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { colourToHex } from '../../utils/colour';

import { Check, DoneOutlineRounded, CheckRounded, ShortText, ShortcutOutlined } from "@mui/icons-material";
import { Input } from "../inputs/Input";
import { HoverCard, HoverCardContent, HoverCardProps, HoverCardTrigger } from "../ui/hover-card";
import { HoverCardClickable } from "../inputs/HoverCardClickable";

const buttonVariants = cva(
  "inline-flex h-[38px] items-center px-2.5 border rounded-md transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white hover:bg-primary-dark focus:ring-primary",
        outline: "border border-border bg-background text-primary hover:bg-accent hover:text-accent-foreground focus:border-skyBlue focus:ring-skyBlue",
        outlineAlignLeft:
          "border border-border bg-background text-primary hover:bg-accent hover:text-accent-foreground focus:border-skyBlue focus:ring-skyBlue",
        destructive: "border-transparent bg-destructive text-white hover:bg-destructive-dark focus:ring-destructive",
        secondary: "border-transparent bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
        ghost: "border-transparent bg-transparent text-primary hover:bg-accent focus:ring-secondary",
        link: "border-none bg-transparent text-primary underline-offset-4 hover:underline focus:ring-primary",
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CheckBoxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  id: string;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  onChangeChecked?(checked: boolean): void;
  label?: string | boolean;
  activeHexColour?: string;
  register?: UseFormRegister<FieldValues>;
  validationSchema?: RegisterOptions;
  tooltip?: string;
  tooltipDelay?: number;
  tooltipVariant?: HoverCardProps["variant"];
  tooltipSize?: HoverCardProps["size"];
  tooltipClassName?: string;
  innerClassName?: string;
  className?: string;
}

const CheckBoxButton = React.forwardRef<HTMLButtonElement, CheckBoxButtonProps>(
  (
    {
      id,
      innerClassName,
      className,
      activeHexColour,
      defaultChecked = false,
      variant,
      size,
      label = "",
      onChangeChecked,
      register,
      validationSchema,
      tooltip,
      tooltipDelay = 700,
      tooltipVariant,
      tooltipSize,
      tooltipClassName,
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = React.useState(defaultChecked ?? props.checked ?? false);

    React.useEffect(() => {
      if (props.checked !== undefined) setChecked(props.checked);
    }, [props.checked]);

    // Handle react-hook-form registration
    const registerProps = register
      ? register(id, validationSchema)
      : {
          onChange: undefined,
          onBlur: undefined,
          name: undefined,
          ref: undefined,
        };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newChecked = !checked;
      setChecked(newChecked);
      onChangeChecked && onChangeChecked(newChecked);

      if (registerProps.onChange) {
        const event = {
          target: {
            value: newChecked,
            name: registerProps.name ?? id,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        registerProps.onChange(event);
      }
    };

    const mainJSX = (
      <Button
        id={id}
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          buttonVariants({ variant, size }),
          className,
          checked && activeHexColour ? `border-[${colourToHex(activeHexColour)}]` : "",
          checked && "bg-opacity-90 hover:border-darkPurple"
        )}
        onClick={handleClick}
        {...props}
        innerClassName={cn("flex gap-x-1", innerClassName, { "justify-start": variant === "outlineAlignLeft" })}
      >
        <Input disableHoverState={true} id="checkboxButtonCheckbox" otherType="checkbox" checked={checked} onChange={handleClick} variant={"purple"} />
        <div className="text-base font-normal text-primary-dark text-wrap">
          {typeof label === "string" ? label : label !== false && camelOrSnakeToTitleCase(id)}
        </div>
      </Button>
    );

    if (tooltip) {
      return (
        <HoverCardClickable
          triggerJSX={mainJSX}
          hoverDelay={tooltipDelay}
          className={cn("w-full px-1.5 text-md", tooltipClassName)}
          variant={tooltipVariant}
          size={tooltipSize}
          openOnClick={false}
        >
          {tooltip}
        </HoverCardClickable>
      );
    }

    return mainJSX;
  }
);

CheckBoxButton.displayName = "CheckBoxButton";

export { CheckBoxButton };
