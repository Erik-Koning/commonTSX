"use client";

import React, { forwardRef, useEffect, useState } from "react";

import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from '../../lib/utils';
import { VariantProps, cva } from "class-variance-authority";
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { colourToHex } from '../../utils/colour';

const rootVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-tertiary-light data-[state=unchecked]:bg-input data-[state=unchecked]:hover:bg-secondary-dark dark:data-[state=unchecked]:bg-border dark:data-[state=checked]:hover:bg-secondary-light dark:data-[state=unchecked]:hover:bg-border/80",
        purple:
          "data-[state=checked]:bg-purple data-[state=unchecked]:bg-input data-[state=unchecked]:hover:bg-tertiary-dark dark:data-[state=unchecked]:bg-border dark:data-[state=checked]:hover:opacity-80 dark:data-[state=unchecked]:hover:bg-border/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "outline outline-1 outline-border hover:outline-secondary-dark bg-background hover:bg-accent hover:text-accent-foreground focus:outline-skyBlue",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        shortText:
          "bg-background text-primary hover:border-neutral-500 border border-primary focus:border-[1px] font-normal outline-none disabled:cursor-not-allowed disabled:opacity-70 w-full max-w-[400px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        labelAbove: "",
      },
      width: {
        default: "",
        full: "",
        fit: "",
      },
      size: {
        default: "",
        sm: "",
        md: "",
        lg: "",
        icon: "",
        slim: "",
        fit: "",
        full: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
    },
  }
);

const thumbVariants = cva("peer transition-transform w-5 h-5 rounded-full bg-primary shadow-lg ring-0", {
  variants: {
    variant: {
      default: "bg-primary",
      purple: "bg-purple",
      destructive: "",
      outline: "",
      secondary: "",
      shortText: "",
      ghost: "",
      link: "",
      labelAbove: "",
    },
    width: {
      default: "",
      full: "",
      fit: "",
    },
    size: {
      default: "",
      sm: "",
      md: "",
      lg: "",
      icon: "",
      slim: "",
      fit: "",
      full: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    width: "default",
  },
});

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof rootVariants>,
    VariantProps<typeof thumbVariants> {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  onCheckedChange?(checked: boolean): void;
  label?: string | boolean;
  labelOff?: string;
  labelOn?: string;
  activeHexColour?: string;
  disabledHexColour?: string;
  register?: UseFormRegister<FieldValues>;
  validationSchema?: RegisterOptions;
  className?: string;
}

const Switch = forwardRef<React.ComponentRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  (
    {
      id,
      className,
      activeHexColour,
      disabledHexColour,
      defaultChecked,
      checked,
      variant = undefined,
      size = undefined,
      width = undefined,
      label = "",
      labelOff,
      labelOn,
      onCheckedChange,
      register,
      validationSchema,
      ...props
    },
    ref
  ) => {
    console.log("defaultChecked", defaultChecked);
    const [checkedLocal, setCheckedLocal] = useState(defaultChecked ?? false);
    const [activeLabel, setActiveLabel] = useState(label);

    let registerOnChange: ((e: React.ChangeEvent<HTMLButtonElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLButtonElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLTextAreaElement> | undefined;

    // Check if the register function exists before invoking it
    if (register && id) {
      const registerResult = register(id, validationSchema);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }

    useEffect(() => {
      if (defaultChecked) {
        setActiveLabel(labelOn ?? label);
      } else {
        setActiveLabel(labelOff ?? label);
      }
    }, [defaultChecked]);

    const handleCheckedChange = (localChecked: boolean) => {
      console.log("localChecked", localChecked);
      setCheckedLocal(localChecked);
      onCheckedChange && onCheckedChange(localChecked);
      if (registerOnChange) {
        const event = {
          target: {
            value: localChecked,
            name: registerName ?? id ?? name, // Assuming registerName is the name of the input
          },
        } as unknown as React.ChangeEvent<HTMLButtonElement>;
        registerOnChange(event);
      }

      if (localChecked && labelOn) setActiveLabel(labelOn);
      else if (!localChecked && labelOff) setActiveLabel(labelOff);
      else if (activeLabel !== label) setActiveLabel(label);
    };

    const colourClassName = activeHexColour ? `data-[state=checked]:bg-[${colourToHex(activeHexColour)}]` : undefined;
    const disabledColourClassName = disabledHexColour ? `data-[state=disabled]:bg-[${colourToHex(disabledHexColour)}]` : undefined;

    return (
      <div className="flex">
        <SwitchPrimitives.Root
          className={cn(
            "",
            rootVariants({ variant, size, width }),
            className,
            //${colourToHex(activeHexColour)}
            colourClassName,
            disabledColourClassName
          )}
          {...props}
          ref={ref}
          defaultChecked={defaultChecked}
          checked={checked !== undefined ? checked : checkedLocal}
          onCheckedChange={handleCheckedChange}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              thumbVariants({ variant, size, width }),
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitives.Root>
        {activeLabel && (
          <label className="ml-2 text-base text-primary-dark">{typeof activeLabel === "boolean" ? camelOrSnakeToTitleCase(id ?? "") : activeLabel}</label>
        )}
      </div>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
