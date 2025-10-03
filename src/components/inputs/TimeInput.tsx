import { Button, ButtonProps } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { validateString } from '../../lib/validations/reactHookFormValidations';
import { generateEvent } from '../../utils/objectManipulation';
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { Input, InputProps } from "./Input";

// Optional: A custom time-validation function (if you use react-hook-form validations)
const timeValidation: RegisterOptions = {
  validate: {
    validTime: (value) => {
      // e.g., "12:00", "01:30", "09:05"
      // This is a simple check; you can make it more robust if needed
      const regex = /^([0-1]?\d|2[0-3]):[0-5]\d$/; // allows 0-23 hours
      return regex.test(value) || "Invalid time format (HH:MM).";
    },
  },
};

export interface TimeInputProps extends Omit<InputProps, "onChange" | "value" | "defaultValue"> {
  /**
   * Unique identifier for the input
   */
  id: string;
  className?: string;

  /**
   * If you want to control the time input externally
   */
  value?: string;

  /**
   * Default time value for uncontrolled usage
   */
  defaultValue?: string;

  defaultDate?: Date;

  delayOnChangeToBlurOrTimeout?: boolean;
  delayOnChangeToBlurOrTimeoutValue?: number;

  /**
   * Called whenever the time or AM/PM changes
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * react-hook-form register
   */
  register?: UseFormRegister<FieldValues>;

  /**
   * Validation rules for this input (time format, required, etc.)
   */
  validationSchema?: RegisterOptions;

  errors?: FieldErrors<any>;
  error?: string;
  disabled?: boolean;
  presentAsStatic?: boolean;
  required?: boolean;

  /**
   * If true, the Input's own register logic is used instead of
   * hooking directly into this component's register logic
   */
  passRegisterToInput?: boolean;

  inputProps?: Partial<InputProps>;
  buttonProps?: Partial<ButtonProps>;
}

/**
 * TimeInput: Displays an input with HH:MM format and an AM/PM toggle.
 */
const TimeInput: React.FC<TimeInputProps> = ({
  id,
  className,
  value,
  defaultValue,
  defaultDate,
  onChange,
  register,
  delayOnChangeToBlurOrTimeout,
  delayOnChangeToBlurOrTimeoutValue = 3000,
  validationSchema,
  errors,
  error,
  disabled,
  presentAsStatic,
  required = false,
  passRegisterToInput = false,
  inputProps,
  buttonProps,
  ...otherProps
}) => {
  // Extract the "HH:MM" portion and AM/PM from the initial value or defaultValue
  const parseInitialValue = (val?: string) => {
    if (!val) return { time: "", amPm: "AM" as "AM" | "PM" };

    // Check if the string ends with AM or PM
    const upperVal = val.toUpperCase().trim();
    const endsWithAM = upperVal.endsWith("AM");
    const endsWithPM = upperVal.endsWith("PM");

    let rawTime = val;
    let localAmPm: "AM" | "PM" = "AM";

    if (endsWithAM || endsWithPM) {
      localAmPm = endsWithAM ? "AM" : "PM";
      // Remove AM/PM from the end (also remove possible space)
      rawTime = rawTime.replace(/(am|pm)/i, "").trim();
    }

    return {
      time: rawTime,
      amPm: localAmPm,
    };
  };

  const { time: initialTime, amPm: initialAmPm } = parseInitialValue(value || defaultValue);

  const [timeValue, setTimeValue] = useState(initialTime);
  const [amPm, setAmPm] = useState<"AM" | "PM">(initialAmPm);
  const [localErrorMsg, setLocalErrorMsg] = useState<string | undefined>(undefined);

  const sendChangeEventTimeout = useRef<NodeJS.Timeout | null>(null);

  // References for react-hook-form
  let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
  let registerName: string | undefined;
  let registerRef: React.Ref<HTMLInputElement> | undefined;

  // If the parent doesn't want to pass the register directly to <Input>, we handle it here
  if (!passRegisterToInput && register) {
    // If there's no validationSchema but required is true, we can default to "required"
    if (!validationSchema && required) {
      validationSchema = { required: "This field is required" };
    }
    // You can merge your custom timeValidation if needed:
    // validationSchema = { ...validationSchema, ...timeValidation };

    const registerResult = register(id, validationSchema);
    registerOnChange = registerResult.onChange;
    registerOnBlur = registerResult.onBlur;
    registerName = registerResult.name;
    registerRef = registerResult.ref;
  }

  /**
   * onChange handler for the text input portion (HH:MM).
   * Restricts input to digits + colon.
   */
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value || "";
    // Allow only digits + colon, max length ~5 (e.g. "12:34")
    newValue = newValue.replace(/[^0-9:]/g, "0").slice(0, 6);

    const isDelete = newValue.length < timeValue.length;
    if (newValue === timeValue) return;

    if (!isDelete) {
      const padWithZeros = newValue.length >= 5;
      //insert new character
      if (newValue.length > 5) {
        const index = newValue.split("").findIndex((char, i) => char !== timeValue[i]);
        if (index !== -1) {
          if (newValue[index + 1] === ":") {
            newValue = newValue.slice(1);
          } else {
            newValue = newValue.slice(0, index + 1) + newValue.slice(index + 2);
          }
        }
      }

      //remove multiple ":"
      const colonCount = newValue.split(":").length - 1;
      if (colonCount > 1) {
        const firstColonIndex = newValue.indexOf(":");
        newValue = newValue.slice(0, firstColonIndex + 1) + newValue.slice(firstColonIndex + 1).replace(/:/g, "");
      }

      // Check and adjust hour and minute values
      let [hourStr, minuteStr] = newValue.split(":");

      if (hourStr.length === 1 && hourStr !== "1" && hourStr !== "0") {
        hourStr = "0" + hourStr;
      } else if (Number(hourStr) > 12) {
        hourStr = "12";
      }

      if (minuteStr && (Number(minuteStr) > 59 || minuteStr.length > 2)) {
        if (minuteStr.length > 2) {
          minuteStr = minuteStr[0] + minuteStr[2];
        }
        if (Number(minuteStr) > 59) minuteStr = "30";
        if (timeValue.endsWith(minuteStr)) {
          //same value wont trigger an update
          let minute = Number(minuteStr);
          if (minute < 59) minute++;
          else minute--;
          minuteStr = String(minute);
        }
      }

      if (padWithZeros) {
        newValue = `${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}`;
      } else {
        if (hourStr !== "1" && hourStr !== "0") {
          newValue = `${hourStr}:${minuteStr ?? ""}`;
        }
      }
    }

    setTimeValue(newValue);

    if (sendChangeEventTimeout.current) clearTimeout(sendChangeEventTimeout.current);
    sendChangeEventTimeout.current = setTimeout(
      () => {
        // Validate locally if not using react-hook-form's managed errors
        if (validationSchema && !register && !disabled && !presentAsStatic && !error) {
          const possibleError = validateString(newValue, validationSchema) as string | undefined;
          setLocalErrorMsg(possibleError || undefined);
        }

        const combinedVal = `${newValue} ${amPm}`.trim();

        // If parent has onChange, call it with a synthetic event containing final "HH:MM AM/PM"
        if (onChange) {
          const syntheticEvent = generateEvent({ value: combinedVal, name: registerName ?? id });
          onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
        // If hooking into react-hook-form here:
        if (registerOnChange) {
          const rhfEvent = generateEvent({ value: combinedVal, name: registerName ?? id });
          registerOnChange(rhfEvent as React.ChangeEvent<HTMLInputElement>);
        }
      },
      delayOnChangeToBlurOrTimeout ? delayOnChangeToBlurOrTimeoutValue : 0
    );
  };

  /**
   * Toggle the AM/PM state. Also calls onChange to update the parent.
   */
  const toggleAmPm = () => {
    setAmPm((prev) => {
      if (sendChangeEventTimeout.current) clearTimeout(sendChangeEventTimeout.current);

      const newVal = prev === "AM" ? "PM" : "AM";

      const combinedVal = `${timeValue} ${newVal}`.trim();
      // If parent has onChange, call it with the newly combined time
      if (onChange) {
        const syntheticEvent = generateEvent({ value: combinedVal, name: registerName ?? id });
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
      // If hooking into react-hook-form here:
      if (registerOnChange) {
        const rhfEvent = generateEvent({ value: combinedVal, name: registerName ?? id });
        registerOnChange(rhfEvent as React.ChangeEvent<HTMLInputElement>);
      }
      return newVal;
    });
  };

  const formatDateToTimeString = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    // Pad hours and minutes with leading zeros if necessary
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  };

  function handleNewTimeString(value: string) {
    const { time, amPm: newAmPm } = parseInitialValue(value);
    setTimeValue(time);
    setAmPm(newAmPm);
  }

  /**
   * If `value` changes externally (controlled usage), sync local states.
   */
  useEffect(() => {
    if (value !== undefined) {
      handleNewTimeString(value);
    }
  }, [value]);

  useEffect(() => {
    if (defaultDate) {
      const time = formatDateToTimeString(defaultDate);
      handleNewTimeString(time);
    }
  }, [defaultDate]);

  function handleSendChangeEvent() {
    if (sendChangeEventTimeout.current) {
      clearTimeout(sendChangeEventTimeout.current);
      sendChangeEventTimeout.current = null;
      //call onChange
      if (onChange) {
        const syntheticEvent = generateEvent({ value: `${timeValue} ${amPm}`.trim(), name: registerName ?? id });
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
      // If hooking into react-hook-form here:
      if (registerOnChange) {
        const rhfEvent = generateEvent({ value: `${timeValue} ${amPm}`.trim(), name: registerName ?? id });
        registerOnChange(rhfEvent as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }

  /**
   * Combine external error with localErrorMsg if either exists
   */
  const mergedError = error || localErrorMsg;

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      <Input
        size={"md"}
        width={"fit"}
        inputBoxClassName={cn("px-1.5", timeValue.length === 0 ? "text-start" : "text-center pl-1 pr-2")}
        {...otherProps}
        {...inputProps}
        id={id}
        name={registerName ?? id}
        ref={registerRef}
        allowShrinkSize={true}
        minLength={6}
        // If parent wants to pass register directly to Input
        register={passRegisterToInput ? register : undefined}
        value={timeValue}
        onChange={handleTimeChange}
        onMouseLeave={handleSendChangeEvent}
        onBlur={handleSendChangeEvent}
        disabled={disabled}
        presentAsStatic={presentAsStatic}
        required={required}
        errors={errors}
        error={mergedError}
        validationSchema={validationSchema}
        maxLength={6}
        // For clarity, you can indicate this is a time field
        placeholder="HH:MM"
      />
      <Button {...buttonProps} variant="outline" textSize={"blank"} className="whitespace-nowrap" disabled={disabled} onClick={toggleAmPm}>
        {amPm}
      </Button>
    </div>
  );
};

export default TimeInput;
