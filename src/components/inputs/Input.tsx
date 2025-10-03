import { useHoverState } from '../../hooks/useHovered';
import { cn } from '../../lib/utils';
import { validateString } from '../../lib/validations/reactHookFormValidations';
import autofillTooltipText from '../../utils/autofillTooltipText';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { generateEvent } from '../../utils/objectManipulation';
import { formatPhoneNumberAmerica } from '../../utils/stringManipulation';
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { cva, type VariantProps } from "class-variance-authority";
import { EditIcon } from "lucide-react";
import React, { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { BiDollar } from "react-icons/bi";
import { Button } from "../ui/Button";
import { HoverCard, HoverCardContent, HoverCardProps, HoverCardTrigger } from "../ui/hover-card";
import { LabelAbove } from "../ui/LabelAbove";
import TextCarousel from "../ui/TextCarousel";
import { AlternateAIFieldValueIcon } from "./AlternateAIFieldValueIcon";
import { FeatureIcons } from "./FeatureIcons";
import { ErrorLabel } from "../ui/ErrorLabel";
import { mergeRefs } from '../../utils/ref';

//A variant for label within and above the input
const inputVariants = cva("pl-[10px] peer transition-all w-full rounded-md focus:ring-1 focus:ring-skyBlue", {
  variants: {
    variant: {
      default:
        "bg-background text-primary border-[1px] border-border focus:border-[1px] font-normal outline-none disabled:hover:border-border disabled:cursor-not-allowed disabled:text-secondary-dark disabled:opacity-75 disabled:bg-secondary-light",
      purple: "bg-purple hover:bg-darkPurple text-primary-light w-full justify-center min-w-full",
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
      full: "w-full justify-center min-w-full",
      fit: "w-fit max-w-min",
    },
    size: {
      default: "h-[54px]",
      xs: "pl-1.5 w-fit max-w-full h-[22px]",
      sm_xs: "pl-1.5 w-fit max-w-full h-[32px]",
      sm: "h-[38px] rounded-md px-3",
      md: "h-[42px] rounded-md px-4",
      lg: "h-[46px] rounded-md px-4",
      icon: "h-10 w-10",
      slim: "h-[38px] rounded-md pl-2.5",
      fit: "w-fit max-w-full h-fit",
      full: "w-full h-full justify-center min-w-full",
    },
    bg: {
      default: "",
      accent: "bg-accent hover:bg-faintPurple",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    width: "default",
  },
});

const checkboxAndRadioVariants = cva(
  "form-checkbox cursor-pointer disabled:bg-secondary-dark transition-all bg-background border-[1px] rounded-[2px] border-border hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-70",
  {
    variants: {
      variant: {
        default:
          "bg-background text-primary hover:border-neutral-500 border border-primary focus:border-[1px] font-normal outline-none disabled:cursor-not-allowed disabled:opacity-70",
        purple: "text-purple hover:text-darkPurple focus:ring-[0px] focus:outline-[1px]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        shortText: "w-full max-w-[400px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        labelAbove: "",
      },
      width: {
        default: "",
        full: "w-full justify-center min-w-full",
        fit: "w-fit max-w-min",
      },
      size: {
        default: "",
        xs: "pl-1.5 w-fit max-w-full h-[22px]",
        sm_xs: "pl-1.5 w-fit max-w-full h-[32px]",
        sm: "h-[40px] rounded-md px-3",
        md: "h-[44px] rounded-md px-5",
        lg: "h-[48px] rounded-md px-8",
        icon: "h-10 w-10",
        slim: "h-[40px] rounded-md px-3",
        fit: "rounded-[2px]",
        full: "w-full h-full items-stretch justify-center min-w-full",
      },
      bg: {
        default: "",
        accent: "bg-accent hover:bg-faintPurple",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
      bg: "default",
    },
  }
);

export interface InputProps
  extends React.ButtonHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants>,
    VariantProps<typeof checkboxAndRadioVariants> {
  id: string;
  labelAbove?: string | boolean;
  label?: string;
  labelClassName?: string;
  labelSelectable?: boolean;
  labelIcons?: ReactNode;
  parents?: string[];
  dependents?: string[];
  options?: string[] | undefined;
  historicValuesEnabled?: boolean;
  historicValues?: string[];
  historicValueLabels?: string[];
  separateBy?: string;
  showLabelIconsOnlyOnFocus?: boolean;
  showRefBoxButtonsInitial?: boolean;
  showExpandUpwardsButton?: boolean;
  showExpandSideButton?: boolean;
  processText?: (text: string) => string;
  placeholder?: string;
  specialPlaceholder?: string;
  otherType?: "text" | "password" | "email" | "checkbox" | "radio" | "number" | "date" | "time" | "datetime-local" | "file";
  allowVisibility?: boolean;
  autoComplete?: string;
  accept?: string | undefined;
  name?: string;
  disabled?: boolean;
  allowOverrideDisable?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  maxLength?: number;
  maxLengthAsSize?: number;
  minLength?: number;
  inputSize?: number;
  allowShrinkSize?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  defaultValue?: string;
  value?: string | number;
  processBeforeOnChangeCall?: (value: string) => string;
  onChange?: (e: any) => void;
  fieldChangeDebounce?: number;
  onFocus?: (e: any) => void;
  focusTrigger?: boolean;
  onBlur?: (e: any) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  register?: UseFormRegister<FieldValues>;
  errors?: FieldErrors<any>;
  error?: string;
  validationSchema?: RegisterOptions;
  validationMessageId?: string;
  innerRef?: React.Ref<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
  stopMouseEventPropagation?: boolean;
  stopKeyPropagation?: boolean;
  presentAsStatic?: boolean;
  className?: string | "";
  inputContainerClassName?: string | "";
  inputBoxClassName?: string | "";
  additionalInputClassName?: string | "";
  style?: React.CSSProperties;
  makeUpperCase?: boolean;
  disableHoverState?: boolean;
  submitButtonCallback?: (value: string) => void;
  submitButtonLabel?: string;
  allowClearButton?: boolean;
  tooltip?: string;
  tooltipDelay?: number;
  tooltipVariant?: HoverCardProps["variant"];
  tooltipSize?: HoverCardProps["size"];
  tooltipClassName?: string;
  TailJSX?: ReactElement;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      labelAbove,
      label,
      labelClassName,
      labelSelectable,
      labelIcons,
      parents = [],
      dependents = [],
      options = undefined,
      historicValuesEnabled = false,
      historicValues = [],
      historicValueLabels = [],
      separateBy = "\n",
      showLabelIconsOnlyOnFocus = true,
      placeholder,
      specialPlaceholder,
      otherType = "text",
      allowVisibility = true,
      autoComplete,
      accept = undefined,
      variant = undefined,
      size = undefined,
      width = undefined,
      bg = undefined,
      name,
      disabled,
      allowOverrideDisable,
      formatPrice,
      required,
      maxLength,
      maxLengthAsSize = false,
      minLength = 1,
      inputSize,
      allowShrinkSize,
      checked,
      defaultChecked,
      value,
      defaultValue,
      processBeforeOnChangeCall,
      onChange,
      fieldChangeDebounce,
      onFocus,
      focusTrigger,
      onBlur,
      onKeyDown,
      onPaste,
      register,
      errors,
      error,
      showRefBoxButtonsInitial = true,
      showExpandUpwardsButton = false,
      showExpandSideButton = true,
      processText,
      validationSchema,
      validationMessageId = `${id}-validation-message`,
      innerRef,
      inputRef,
      stopMouseEventPropagation = true,
      stopKeyPropagation = false,
      presentAsStatic = false,
      className,
      inputBoxClassName,
      inputContainerClassName,
      additionalInputClassName,
      style,
      disableHoverState = true,
      submitButtonCallback,
      submitButtonLabel = undefined,
      allowClearButton = false,
      tooltip,
      tooltipDelay = 700,
      tooltipVariant,
      tooltipSize,
      tooltipClassName,
      TailJSX,
      makeUpperCase = false,
      children,
      ...props
    },
    ref
  ) => {
    function getInitialInputValue() {
      return typeof value === "number" ? String(value) : value ?? "";
    }

    function getInitialCheckedValue() {
      if (otherType === "checkbox") {
        return getInitialInputValue().length > 0 ? Boolean(getInitialInputValue()) : Boolean(checked);
      }
      return undefined;
    }

    const [showLabelIcons, setShowLabelIcons] = useState<boolean>(showLabelIconsOnlyOnFocus !== null ? !showLabelIconsOnlyOnFocus : true);
    const [showRefBoxButtons, setShowRefBoxButtons] = useState<boolean>(showRefBoxButtonsInitial);
    const [inputValue, setInputValue] = useState(getInitialInputValue());
    const [checkedValue, setCheckedValue] = useState(checked ?? getInitialCheckedValue() ?? false);
    const [localErrorMsg, setLocalErrorMsg] = useState<null | string>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [overrideDisable, setOverrideDisable] = useState(false);
    //const [labelAboveInput, setLabelAboveInput] = useState(false)

    const localInputRef = useRef<HTMLInputElement | null>(null);
    let debouncedChange = useRef<NodeJS.Timeout>(null);
    const hasChanged = useRef(false);
    const inputHasText = useRef<boolean | undefined>(undefined);

    const isDisabled = disabled && !overrideDisable;

    const hasText = inputHasText.current ?? inputValue.length > 0;

    ////console.log("Erros1019", errors);
    const hasErrors = !!(
      (errors && typeof errors === "object" && errors[id]) ||
      (errors && typeof errors === "object" && Object.keys(errors)?.length > 0) ||
      (error && typeof error === "string" && error?.length > 0) ||
      localErrorMsg !== null
    );
    let errorMessage;
    if (errors && errors[id] && errors.hasOwnProperty(id)) {
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

    if (hasErrors) {
      presentAsStatic = false;
    }

    if (typeof labelAbove === "boolean" && labelAbove) {
      labelAbove = label ?? camelOrSnakeToTitleCase(label ?? name ?? id);
    }

    //React.useEffect(() => {
    //	if (initialValue) {
    //			setInputValue(initialValue);
    //		}
    //	}, [initialValue]);

    useEffect(() => {
      //Avoid calling the onChange event if the value is the same as the defaultValue and the input has not been changed before
      if (!hasChanged.current && value === defaultValue) return;
      if (value !== undefined && value !== null) {
        // If registerOnChange is a function, create a synthetic event and pass it
        // Please note that this approach assumes that registerOnChange only uses the value and name from the event object. If registerOnChange uses other properties from the event object (like event.target.type or event.currentTarget), you'll need to include those in the synthetic event as well.
        const event = {
          target: {
            value: value,
            name: registerName, // Assuming registerName is the name of the input
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(event);
      }
    }, [value]);

    useEffect(() => {
      if (defaultValue && defaultValue !== inputValue) {
        setInputValue(defaultValue);
      }
    }, [defaultValue]);

    useEffect(() => {
      setCheckedValue(defaultChecked ?? false);
    }, [defaultChecked]);

    useEffect(() => {
      setCheckedValue(checked ?? false);
    }, [checked]);

    useEffect(() => {
      //console.log("InputValue checkbox", inputValue);
    }, [inputValue]);

    ////console.log("Inputs value = ", value);
    //setInputValue(value || "");

    //errorMessage = errors && String(errors[id]?.message);

    const handleInputChange = (e: any) => {
      hasChanged.current = true;
      if (stopKeyPropagation && typeof e === "object" && e.stopPropagation) {
        e.stopPropagation();
      }

      if (typeof e === "string") e = { target: { value: e } };
      if (otherType === "checkbox") {
        setCheckedValue(e.target.checked);
        const newVal: boolean = Boolean(e.target.checked);

        e = {
          target: {
            value: newVal,
            name: registerName, // Assuming registerName is the name of the input
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
      } else {
        if (otherType === "password" && showPassword) {
          //dont show password while typing
          setShowPassword(false);
        }
        //normal texts input type
        let localInputValue = String(e.target.value);

        if (localInputValue && !inputHasText.current) {
          inputHasText.current = true;
        }
        if (!localInputValue && inputHasText.current) {
          inputHasText.current = false;
        }
        ////console.log("localInputValue", localInputValue);

        if (processText) {
          localInputValue = processText(localInputValue);
        }

        if (localInputValue.length >= inputValue.length) {
          //only format if adding characters
          if (id.toLowerCase().includes("name")) {
            //remove leading spaces
            localInputValue = localInputValue.replace(/^\s+/, "");
            //capitalize first letter
            localInputValue = localInputValue.charAt(0).toUpperCase() + localInputValue.slice(1);
          }

          if (id.toLowerCase().includes("phone")) {
            if (id.toLowerCase().includes("ext")) {
              //remove any non numeric characters
              localInputValue = localInputValue.replace(/\D/g, "");
            } else {
              localInputValue = formatPhoneNumberAmerica(localInputValue);
            }
          }
          if (makeUpperCase) {
            localInputValue = localInputValue.toUpperCase();
          }
        }
        e = generateEvent({ value: localInputValue, name: registerName ?? id ?? name });

        //if there is a validationSchema and the errors are not handle by react hook form or other errors being passed, then lets validate the input
        if (validationSchema && !register && !isDisabled && !presentAsStatic && !(errors && errors[id]) && !error) {
          setLocalErrorMsg(validateString(localInputValue, validationSchema));
        }
        //value = localInputValue;
        ////console.log("inputValue", localInputValue);
        setInputValue(localInputValue);

        if (localInputRef.current) {
          localInputRef.current.value = localInputValue;
        }
      }
      if (processBeforeOnChangeCall) {
        e.target.value = processBeforeOnChangeCall(e.target.value);
      }

      if (e?.target?.name && e.target.name.includes("sites")) {
      }

      onChange && onChange(e);
      registerOnChange && registerOnChange(e);
    };

    const handleOnInput = (e: any) => {
      ////console.log("OnInput", e);
    };

    let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLInputElement> | undefined;

    // Check if the register function exists before invoking it
    if (register && !registerOnChange) {
      if (!validationSchema && required) {
        validationSchema = { required: "This field is required" };
      }

      const registerResult = register(id, validationSchema);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }
    //const { ref, ...rest } = registerInput || {};
    //////console.log("registerInput",registerInput)

    //flex-col so error message is under neither

    const inputClassName = cn(
      inputVariants({ variant, size, width, bg }),
      {
        "pl-9": formatPrice,
        "": !formatPrice,
        "border-rose-500": hasErrors,
        "border-border hover:border-border-hovered": !hasErrors,
        "focus:border-rose-500": hasErrors,
        "focus:border-skyBlue": !hasErrors,
        "pl-[14.5px]": label,
      },
      "transition-all duration-200 ease-in-out"
    );

    const checkboxAndRadioClassName = cn(
      checkboxAndRadioVariants({ variant, size, width, bg }),
      {
        "pl-9": formatPrice, // Add padding if necessary
        "border-rose-500": hasErrors,
        "focus:border-rose-500": hasErrors,
        "bg-background/50 text-secondary-dark/90 hover:text-secondary-dark focus:ring-transparent focus:ring-0": isDisabled,
      },
      className,
      "focus:ring-[2px] focus:ring-skyBlue focus:ring-offset-1 mr-1.5"
    );

    const inputStyle: React.CSSProperties = {
      ...style,
      ...(otherType !== "checkbox"
        ? {
            //outline: "none",
            //border: "none",
            padding: maxLength === 1 ? 4 : label && "1rem", //inner input text spacing
            paddingLeft: maxLength === 1 ? 0 : presentAsStatic ? "0px" : undefined, // inner input text spacing
            paddingRight: maxLength === 1 ? 0 : presentAsStatic ? "0px" : undefined, // inner input text spacing
            paddingTop: presentAsStatic ? "1px" : label ? "10px" : undefined, // inner input text spacing
            paddingBottom: label ? "0px" : undefined, // inner input text spacing
            textAlign: maxLength === 1 ? "center" : undefined,
          }
        : {
            textAlign: "center", // Reset textAlign for checkbox type
          }),
      border: presentAsStatic ? "none" : undefined,
    };

    useEffect(() => {
      if (otherType === "checkbox" && inputValue.length > 0) {
        console.error("Checkbox input should not have a value");
      }
    }, [inputValue]);

    const debouncedHandleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clear any existing timeout
        if (debouncedChange.current) {
          clearTimeout(debouncedChange.current);
        }

        // Clone the event since it will be nullified by the time the timeout runs
        const event = { ...e, target: { ...e.target } };

        // Set new timeout
        debouncedChange.current = setTimeout(() => {
          console.log("debouncedHandleChange", event.target.value);
          handleInputChange(event);
        }, fieldChangeDebounce);
      },
      [handleInputChange, fieldChangeDebounce]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (debouncedChange.current) {
          clearTimeout(debouncedChange.current);
        }
      };
    }, []);

    const divRef = useRef<HTMLDivElement>(null);
    useHoverState([divRef], {
      setSettersEnterTrue: [setShowLabelIcons, setShowRefBoxButtons, setIsHovered],
      setSettersLeaveFalse: [setShowLabelIcons, setShowRefBoxButtons, setIsHovered],
      disableSettersEnter: false,
      disableSettersLeave: false,
      disableSetters: disableHoverState ? true : false,
    });

    const hasRightSideButtons = !!(TailJSX || submitButtonCallback || allowClearButton || otherType === "password" || allowOverrideDisable);

    const labelIconsClassNames = "text-tertiary-dark hover:text-skyBlue hover:cursor-pointer";

    const mainJSX = (
      <div
        ref={divRef}
        className={cn(
          "group flex h-full flex-col",
          {
            "justify-center": otherType === "checkbox",
          },
          className
        )}
        style={style}
        onClick={(e) => {
          if (stopMouseEventPropagation) {
            e.stopPropagation();
          }
        }}
      >
        {formatPrice && <BiDollar size={24} className="absolute left-2 top-5 text-neutral-700" />}
        <div
          className={cn("flex gap-x-1 pb-0 text-primary", {
            "p-0": otherType === "checkbox" || (!labelAbove && (!showLabelIcons || isDisabled)),
          })}
        >
          <LabelAbove label={labelAbove} className={cn({ "-mb-[3px]": options && options.length > 0 })} />
          {!isDisabled && showLabelIcons && (
            <div className="flex items-center gap-x-2">
              {historicValuesEnabled && (
                <AlternateAIFieldValueIcon
                  handleAlternativeSelect={(value) => handleInputChange(value)}
                  textState={inputValue}
                  alternateValues={historicValues}
                  alternateValuesLabels={historicValueLabels}
                  triggerClassName={labelIconsClassNames}
                />
              )}
              <FeatureIcons
                tooltipText={autofillTooltipText(parents, dependents)}
                numRelated={parents?.length > dependents?.length ? parents?.length : dependents?.length}
                iconClassName={labelIconsClassNames}
                className="w-[260px]"
                side="top"
                iconSize={16}
              />
            </div>
          )}
        </div>
        {options && options.length > 0 && (
          <TextCarousel
            maxItemWidthPX={130}
            showButtons={showRefBoxButtons}
            showExpandUpwardsButton={showExpandUpwardsButton}
            showExpandSideButton={showExpandSideButton}
            textFieldText={inputValue}
            handleTextChange={handleInputChange}
            options={options}
          />
        )}
        <div className={cn("relative", { "flex items-center": otherType === "checkbox" }, inputContainerClassName)}>
          <input
            id={id}
            key={id}
            name={name ?? registerName ?? id}
            autoComplete={autoComplete ?? (name || registerName || id)}
            autoFocus={focusTrigger}
            type={showPassword ? undefined : otherType}
            accept={accept}
            //defaultChecked={}
            checked={isDisabled ? (value ? Boolean(value) : checked) : checkedValue}
            disabled={isDisabled}
            placeholder={specialPlaceholder ? specialPlaceholder : placeholder ? placeholder : undefined}
            required={required}
            aria-invalid={!!hasErrors} // Indicates invalid state to screen readers
            aria-describedby={validationMessageId} // Links to the validation message
            maxLength={maxLength}
            size={
              inputSize ?? allowShrinkSize
                ? maxLength && inputValue.length > maxLength
                  ? maxLength
                  : inputValue.length < minLength
                  ? minLength
                  : inputValue.length || minLength
                : maxLengthAsSize
                ? maxLength
                : undefined
            }
            defaultValue={otherType === "checkbox" ? undefined : inputValue}
            //value={otherType === "checkbox" ? undefined : inputValue}
            onKeyDown={(e) => {
              if (stopKeyPropagation && e.key === " ") {
                e.stopPropagation();
              }
              onKeyDown && onKeyDown(e);
            }}
            onChange={(e) => {
              if (isDisabled) return;
              //always set the text value state to the new value immediately
              //setTextValueState(e.target.value);
              //only debounce if currently debouncing and if the change is greater than 5 characters and not currently debouncing, then handle the change immediately
              if (fieldChangeDebounce && (!(Math.abs(e.target.value.length - inputValue.length) > 5) || debouncedChange.current)) {
                // Clone the event since it will be nullified by the time debounce runs
                debouncedHandleChange(e);
              } else {
                handleInputChange(e);
              }
            }}
            onFocus={onFocus}
            onBlur={(e) => {
              if (overrideDisable) setOverrideDisable(false);
              onBlur?.(e);
              registerOnBlur?.(e);
            }}
            ref={(node) => {
              mergeRefs(node, inputRef, registerRef, innerRef, localInputRef);
            }}
            //{...(register ? registerInput : {})}
            onPaste={onPaste}
            className={cn("", otherType === "checkbox" || otherType === "radio" ? checkboxAndRadioClassName : inputClassName, inputBoxClassName)}
            style={inputStyle}
            {...props}
          />
          {hasRightSideButtons && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 text-tertiary-dark">
              {TailJSX}
              {submitButtonCallback && (
                <Button
                  variant="blank"
                  className=""
                  onClick={(e: any) => {
                    e.preventDefault();
                    submitButtonCallback(inputValue);
                  }}
                  title={submitButtonLabel}
                />
              )}
              {allowClearButton && (
                <Button
                  variant="blank"
                  className=""
                  onClick={(e: any) => {
                    e.preventDefault();
                    handleInputChange("");
                  }}
                >
                  {inputValue.length > 0 && !isDisabled && !presentAsStatic && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </Button>
              )}
              {isDisabled && allowOverrideDisable && (
                <Button
                  variant="blank"
                  className=""
                  onClick={(e: any) => {
                    e.preventDefault();
                    setOverrideDisable(!overrideDisable);
                  }}
                >
                  <EditIcon
                    size={20}
                    className={cn("bg-background transition-all hover:text-primary-dark disabled:bg-secondary-light", isDisabled && "bg-secondary-light")}
                  />
                </Button>
              )}
              {otherType === "password" && allowVisibility && (
                <Button
                  variant="blank"
                  className=""
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (allowVisibility) setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                  ) : (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 17, transform: "scaleX(-1)" }} />
                  )}
                </Button>
              )}
            </div>
          )}
          {label && otherType !== "checkbox" && (
            <label
              className={cn(
                "pointer-events-none absolute top-4 z-0 origin-[0] -translate-y-3 transform  text-md  duration-150",
                formatPrice ? "left-9" : "left-4",
                "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-[15px] peer-focus:scale-75",
                hasText ? "-translate-y-[15px] scale-75" : "translate-y-0 scale-100",
                hasErrors ? "text-rose-500" : "text-zinc-400",
                labelClassName
              )}
            >
              {label}
            </label>
          )}
          {children ||
            (label && (otherType === "checkbox" || otherType === "radio") && (
              //This is for text beside checkbox
              <div
                className={cn("flex w-full items-start justify-start", { "cursor-pointer underline": labelSelectable && isHovered })}
                onClick={() => labelSelectable && handleInputChange({ target: { checked: !checkedValue } })}
              >
                {label && <div>{label}</div>}
                {children}
              </div>
            ))}
        </div>
        <ErrorLabel
          show={hasErrors}
          role="alert"
          aria-live="assertive"
          className={cn("", { flex: otherType === "checkbox" })}
          id={validationMessageId}
          data-testid={validationMessageId} // For testability
        >
          {String(errorMessage ?? localErrorMsg ?? "Field invalid")}
        </ErrorLabel>
      </div>
    );

    // Check if toolTip has text and wrap buttonJSX accordingly
    if (tooltip) {
      return (
        <HoverCard openDelay={tooltipDelay}>
          <HoverCardTrigger asChild>{mainJSX}</HoverCardTrigger>
          <HoverCardContent className={cn("w-full", tooltipClassName)} variant={tooltipVariant} size={tooltipSize}>
            {tooltip}
          </HoverCardContent>
        </HoverCard>
      );
    }

    return mainJSX;
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
