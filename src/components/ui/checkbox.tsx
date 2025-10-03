"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from '../../lib/utils';
import { cva, type VariantProps } from "class-variance-authority";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

const CheckboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-[2px] border border-primary data-[state=checked]:border-none  ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "",
        light: "bg-secondary text-secondary-foreground hover:bg-secondary data-[state=unchecked]:bg-primary-light data-[state=unchecked]:border-border",
        purple: "data-[state=checked]:bg-purple data-[state=checked]:text-primary-foreground",
        disabled: "data-[state=checked]:bg-primary-dark data-[state=checked]:text-primary-foreground",
        //disabled: "data-[state=checked]:bg-tertiary-dark data-[state=checked]:text-primary-foreground",
        //destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        //outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        //secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        //ghost: "hover:bg-accent hover:text-accent-foreground",
        //link: "text-primary underline-offset-4 hover:underline",
      },
      width: {
        default: "",
        full: "inline-flex  w-full justify-center min-w-full",
        fit: "inline-flex w-fit max-w-full",
        blank: "inline-flex",
        fullLine: "flex flex-col w-full justify-center min-w-full",
      },
      size: {
        default: "h-4 w-4",
        tight: "h-4 w-4",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        blank: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
    },
  }
);

interface CheckboxProps extends VariantProps<typeof CheckboxVariants> {
  //extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof CheckboxVariants> {
  id?: string;
  label?: string;
  className?: string | undefined;
  additionalClassnames?: string | undefined;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLElement>) => void;
  onChangeChecked?: (checked: boolean) => void;
  onClick?: (e: any) => void; // Add onClick here
  register?: UseFormRegister<FieldValues>;
  stopMouseEventPropagation?: boolean;
  errors?: FieldErrors<any>;
  error?: string;
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      id,
      label,
      disabled,
      checked,
      defaultChecked,
      onChange,
      onChangeChecked,
      register,
      stopMouseEventPropagation = false,
      className,
      additionalClassnames,
      errors,
      error,
      ...props
    },
    ref
  ) => {
    const [checkedState, setCheckedState] = React.useState(checked ?? defaultChecked ?? false);
    const [mouseHovered, setMouseHovered] = React.useState(false);
    const variant = disabled ? "disabled" : props.variant;

    const hasErrors = id ? (errors && errors[id]) || (error && error?.length > 0) : false;
    let errorMessage;
    if (id && errors && errors[id] && errors.hasOwnProperty(id)) {
      const errorMessageTmp = errors[id]?.message;

      // Check if errorMessage is a string before setting the state
      if (typeof errorMessageTmp === "string" && errorMessageTmp.length > 0) {
        ////console.log("Setting error message", id, errorMessageTmp, errors, errors[id]);
        errorMessage = errorMessageTmp;
      } else {
        // Handle other types or reset the state as needed
        errorMessage = "Field Required";
      }
    } else if (error && error?.length > 0) {
      errorMessage = error;
    } else {
      errorMessage = undefined;
    }

    let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLInputElement> | undefined;

    // Check if the register function exists before invoking it
    if (id && register && !registerOnChange) {
      //if (!validationSchema && required) {
      //  validationSchema = { required: "This field is required" };
      //}

      const registerResult = register(id);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }

    const handleCheckedChange = (newChecked: boolean) => {
      console.log("checkbox checkedChange", newChecked);
      if (disabled) {
        return;
      }
      setCheckedState(newChecked);
      const e = {
        target: {
          value: newChecked ? "true" : "false",
          name: registerName, // Assuming registerName is the name of the input
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChangeChecked && onChangeChecked(newChecked);
      onChange && onChange(e);
      registerOnChange && registerOnChange(e);
    };

    const handleChange = (e: any) => {
      console.warn("checkbox change, how would you like to handle it?", e);
      return;
      const event = {
        target: {
          value: e.target.value,
          name: registerName, // Assuming registerName is the name of the input
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
    };

    React.useEffect(() => {
      if (checked !== undefined) {
        setCheckedState(checked);
      }
    }, [checked]);

    React.useEffect(() => {
      if (defaultChecked !== undefined) {
        //setCheckedState(defaultChecked);
      }
    }, [defaultChecked]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setMouseHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setMouseHovered(false);
    };

    const handleCheckClick = (e: React.MouseEvent<HTMLDivElement>) => {
      handleCheckedChange(!checkedState);
    };

    return (
      <div className="flex h-full self-center">
        <div className="flex cursor-pointer items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleCheckClick}>
          <CheckboxPrimitive.Root
            id={id}
            ref={ref}
            className={cn(
              "",
              CheckboxVariants({
                variant,
                size: props.size,
                width: props.width,
              }),
              className,
              additionalClassnames,
              {
                "data-[state=unchecked]:border-secondary-dark": mouseHovered && !disabled,
              }
            )}
            defaultChecked={defaultChecked}
            checked={checkedState ?? undefined}
            disabled={disabled}
            onChange={handleChange}
            onCheckedChange={handleCheckedChange}
            onClick={(e) => {
              if (stopMouseEventPropagation) {
                e.stopPropagation();
              }
              if (props.onClick) {
                props.onClick(e);
              }
            }}
            {...props}
          >
            <CheckboxPrimitive.Indicator color="" className={cn("flex items-center justify-center text-current")}>
              <Check color={"white"} className="h-4 w-4 " />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <p className="ml-2 block items-center justify-center text-base text-primary">{label}</p>
        </div>
        {hasErrors && (
          <div className={cn("")}>
            <span className="left-0 z-40 my-1 text-sm text-rose-500">{String(errorMessage ?? "Field invalid")}</span>
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
