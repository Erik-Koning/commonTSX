import { cn } from '../../lib/utils';
import { createChangeEvent } from '../../utils/react';
import { paddedWithZeros, stringHasOnlyDigits } from '../../utils/stringManipulation';
import { cva, VariantProps } from "class-variance-authority";
import { Minus, Plus } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { Button, ButtonProps } from "../ui/Button";
import { Label } from "../ui/Label";
import { Input, InputProps } from "./Input";
import { generateEvent } from '../../utils/objectManipulation';
import { FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";

const NumericSelectVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface NumericSelectProps extends React.HTMLAttributes<HTMLInputElement>, VariantProps<typeof NumericSelectVariants> {
  id?: string;
  name?: string;
  className?: string;
  defaultValue?: string;
  label?: string;
  padWithZero?: boolean;
  maxLength?: number;
  minNumber?: number;
  showDecrease?: boolean;
  register?: UseFormRegister<FieldValues>;
  validationSchema?: RegisterOptions;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelMode?: boolean;
  labelIcon?: React.ReactNode;
  buttonProps?: Partial<ButtonProps>;
  inputProps?: Partial<InputProps>;
}

export const NumericSelect = forwardRef<HTMLInputElement, NumericSelectProps>(
  (
    {
      id,
      name,
      className,
      defaultValue,
      variant,
      size,
      label,
      padWithZero = false,
      maxLength = 3,
      minNumber,
      showDecrease = true,
      register,
      validationSchema,
      onChange,
      labelMode = false,
      labelIcon,
      buttonProps,
      inputProps,
      ...props
    },
    ref
  ) => {
    const [valueLocal, setValueLocal] = useState(
      padWithZero && maxLength
        ? paddedWithZeros(defaultValue ?? (minNumber !== undefined ? String(minNumber) : undefined) ?? "1", maxLength)
        : defaultValue ?? (minNumber !== undefined ? String(minNumber) : undefined) ?? "1"
    );
    const [isHovered, setIsHovered] = useState<boolean>(false);

    let closeLabelModeTimeout: NodeJS.Timeout | undefined;

    const handleValueChange = (e: any, adjustBy?: number) => {
      let value = e.target.value as string;

      //debugger;

      if (typeof value === "number") value = String(value);
      if (typeof value !== "string") value = "" as string;
      if (!stringHasOnlyDigits(value)) value = "1";
      else if (adjustBy !== undefined) value = String(Number(value) + adjustBy);
      if (minNumber !== undefined && Number(value) < minNumber) value = String(minNumber);

      if (valueLocal === undefined || value.length < valueLocal?.length) {
        setValueLocal(value);
        return;
      }
      if (padWithZero && maxLength) {
        value = paddedWithZeros(value, maxLength);
      }

      if (value === valueLocal) return; // No change

      setValueLocal(value);
      onChange && onChange(createChangeEvent(e.target.name, value));
    };

    const increaseValue = (e: any) => {
      handleValueChange(createChangeEvent(id ?? name ?? label ?? "", valueLocal), 1);
    };
    const decreaseValue = (e: any) => {
      handleValueChange(createChangeEvent(id ?? name ?? label ?? "", valueLocal), -1);
    };

    const showLabelMode = labelMode && !isHovered;

    const ButtonsProps: ButtonProps = {
      ...buttonProps,
      variant: showLabelMode ? "ghost" : buttonProps?.variant ?? "outline",
      size: showLabelMode ? "blank" : buttonProps?.size ?? "sm_xs",
      bg: showLabelMode ? "default" : buttonProps?.bg ?? "accent",
      stopMouseEventPropagation: isHovered,
    };

    return (
      <Label
        size={"sm"}
        variant={showLabelMode ? "default" : "blank"}
        ref={ref}
        className={cn(
          !showLabelMode && "rounded-lg p-1 outline outline-1",
          "inline-flex w-min items-center gap-1.5", // inline-flex for same-line layout, w-min to shrink
          NumericSelectVariants({ variant, size }),
          showLabelMode && "gap-x-1",
          className
        )}
        onMouseEnter={() => {
          console.log("mouseEnter");
          clearTimeout(closeLabelModeTimeout);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          closeLabelModeTimeout = setTimeout(() => {
            setIsHovered(false);
          }, 1400);
        }}
        onClick={() => {
          setIsHovered(!isHovered);
        }}
      >
        {showLabelMode && labelIcon}
        {label && <label className="whitespace-nowrap">{label}</label>}
        {!showLabelMode && showDecrease && (
          <Button {...ButtonsProps} onClick={decreaseValue}>
            <Minus size={14} />
          </Button>
        )}
        <Input
          id={id ?? "numericSelectInput"}
          {...props}
          {...inputProps}
          register={register}
          validationSchema={validationSchema}
          allowShrinkSize={true}
          presentAsStatic={showLabelMode}
          variant={showLabelMode ? "shortText" : "outline"}
          width={"fit"}
          bg={showLabelMode ? "default" : inputProps?.bg ?? "accent"}
          size={showLabelMode ? "fit" : "sm_xs"}
          className={cn(showLabelMode && "justify-center bg-transparent")}
          inputBoxClassName={cn(showLabelMode && "bg-transparent", inputProps?.inputBoxClassName)}
          value={valueLocal}
          onChange={handleValueChange}
          defaultValue={
            padWithZero && maxLength
              ? paddedWithZeros(defaultValue ?? (minNumber !== undefined ? String(minNumber) : undefined) ?? "1", maxLength)
              : defaultValue ?? (minNumber !== undefined ? String(minNumber) : undefined) ?? "1"
          }
          maxLength={3}
        />
        {!showLabelMode && (
          <Button {...ButtonsProps} onClick={increaseValue}>
            <Plus size={14} />
          </Button>
        )}
      </Label>
    );
  }
);

NumericSelect.displayName = "NumericSelect";
