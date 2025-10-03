import { cn } from '../../lib/utils';
import React, { ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Calendar } from '../../components/calendar/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';

import { Input, InputProps } from "./Input"; // Assuming your Input component is in a separate file
import { dateValidations, validateString } from '../../lib/validations/reactHookFormValidations';
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { generateEvent } from '../../utils/objectManipulation';
import { mergeRefs } from '../../utils/ref';
import {
  anyDateValidation,
  DateFormat,
  dateFormatToLocaleDateStringFormatObj,
  defaultDateFormat,
  getDateFromDateStringFormat,
  getStringDateFormatFromDate,
} from "../../utils/dateManipulation";
import { combineRegexPatterns } from "../../utils/regex";

export interface DateInputProps extends InputProps {
  id: string;
  className?: string;
  defaultDate?: Date;
  defaultValue?: string;
  value?: string; // Add value prop
  getOnChangeValueAsDate?: boolean;
  onChange?: (e: any) => void; // Add onChange prop
  register?: UseFormRegister<FieldValues>;
  historicValuesEnabled?: boolean;
  historicValues?: string[];
  historicValueLabels?: string[];
  passRegisterToInput?: boolean;
  validationSchema?: RegisterOptions;
  format?: DateFormat;
  errors?: FieldErrors<any>;
  error?: string;
  disabled?: boolean;
  presentAsStatic?: boolean;
  onOpenAutoFocus?: boolean;
  required?: boolean;
  fromYear?: number;
  toYear?: number;
  calRef?: React.RefObject<HTMLDivElement | null>;
}

const DateInput: React.FC<DateInputProps> = ({
  id,
  className,
  defaultDate,
  defaultValue,
  value, // Receive value prop
  getOnChangeValueAsDate,
  onChange, // Receive onChange prop
  register,
  historicValuesEnabled = false,
  historicValues = [],
  historicValueLabels = [],
  passRegisterToInput,
  validationSchema,
  format = defaultDateFormat,
  errors,
  error,
  disabled,
  presentAsStatic,
  onOpenAutoFocus = false,
  required = false,
  fromYear = new Date().getFullYear() - 120,
  toYear = new Date().getFullYear() + 50,
  ref,
  calRef,
  ...inputProps
}) => {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate);
  const [dateString, setDateString] = React.useState<string | undefined>(value ?? defaultValue);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarPopoverEnable, setCalendarPopoverEnable] = useState(false);
  const [countClick, setCountClick] = useState(0);
  const [localErrorMsg, setLocalErrorMsg] = useState<undefined | string>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentBoxRef = React.useRef<HTMLDivElement>(null);

  const closePopoverTimeout = useRef<number | undefined>(undefined);

  let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
  let registerName: string | undefined;
  let registerRef: React.Ref<HTMLInputElement> | undefined;

  // Check if the register function exists before invoking it
  if (passRegisterToInput !== false && register && !registerOnChange) {
    //Set validation schema if...
    if (format && !validationSchema && !disabled) {
      //Get the validation schema for the format
      if (dateValidations[format]) {
        validationSchema = {
          pattern: {
            ...anyDateValidation.pattern,
            ...(dateValidations[format]?.pattern?.message ? { message: dateValidations[format]?.pattern?.message } : undefined),
          },
        };
      }
    }

    if (required === true && !validationSchema?.required) {
      //Add required to the validation schema
      validationSchema = { ...validationSchema, required: "This field is required" };
    } else if (required === false && validationSchema?.required) {
      //Remove required from the validation schema
      validationSchema = { ...validationSchema, required: undefined };
    }

    console.log("validationSchema for date input", validationSchema);

    const registerResult = register(id, validationSchema);
    registerOnChange = registerResult.onChange;
    registerOnBlur = registerResult.onBlur;
    registerName = registerResult.name;
    registerRef = registerResult.ref;
  }

  function getDateFromDateString(dateString?: string) {
    if (!dateString) {
      if (date) return date;
      else {
        console.error("Passed invalid date");
        return new Date();
      }
    }
    return new Date(dateString);
  }

  // When the date is selected, close the popover and focus the input
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!popoverOpen) {
      return;
    }

    setDate(newDate);
    const formatLocale = format ?? defaultDateFormat;

    const newDateString = getStringDateFormatFromDate(newDate, formatLocale);

    setDateString(newDateString);

    // use a short delay to show selection to user for brief moment
    setTimeout(() => {
      setPopoverOpen(false);
      setCalendarPopoverEnable(false);
      inputRef.current?.focus();
    }, 80);
  };

  useEffect(() => {
    handleDateChange(dateString);
  }, [dateString]);

  useLayoutEffect(() => {
    handleDateSelect(defaultDate);
  }, [defaultDate]);

  useEffect(() => {
    const newDate = getDateFromDateStringFormat(value, format);
    if (newDate && newDate !== date) {
      setDate(newDate);
    }
  }, [value]);

  useEffect(() => {
    const newDate = getDateFromDateStringFormat(defaultValue, format);
    if (newDate && newDate !== date) {
      setDate(newDate);
    }
  }, [defaultValue]);

  const handleDateChange = (event: any | string) => {
    let newEvent: React.ChangeEvent<HTMLInputElement> | undefined = undefined;
    let newValue: string | undefined = undefined;
    console.log("type of event", typeof event, event);
    if (typeof event !== "object") {
      newValue = event;
    } else {
      newValue = event?.target?.value;
    }

    if (defaultValue) {
      //newValue = defaultValue;
    }

    if (newValue && newValue !== dateString) {
      //Gets a date object from the string value and parsing it via the anticipated format
      const newDate = getDateFromDateStringFormat(newValue, format);
      if (newDate && newDate !== date) {
        setDate(newDate);
      }
    }

    //our event is actually a raw mostly string passed to us
    newEvent = {
      target: {
        value: getOnChangeValueAsDate ? getDateFromDateString(newValue) : newValue,
        name: registerName ?? id, // Assuming registerName is the name of the input
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    //if there is a validationSchema and the errors are not handle by react hook form or other errors being passed, then lets validate the input
    if (newValue && validationSchema && !register && !disabled && !presentAsStatic && !(errors && errors[id]) && !error) {
      setLocalErrorMsg(validateString(newValue, validationSchema) as string | undefined);
    }

    setDateString(newValue);

    //console.log("handleInputChange", newEvent.target.value, newEvent);

    onChange && onChange(newEvent);
    registerOnChange && registerOnChange(newEvent ? (newEvent as React.ChangeEvent<HTMLInputElement>) : (event as React.ChangeEvent<HTMLInputElement>));
  };

  const handleUnengage = () => {
    setCalendarPopoverEnable(false);
    setPopoverOpen(false);
  };

  useUserUnengaged([inputRef, contentBoxRef], handleUnengage, null, calendarPopoverEnable);

  const handleTriggerClick = () => {
    //console.log("handleTriggerClick", countClick);
  };

  useLayoutEffect(() => {
    //console.log("countClick", countClick);
    if (countClick % 2 === 1) {
      //console.log("Opening popover", countClick);

      setPopoverOpen(true);
      setTimeout(() => {
        setCalendarPopoverEnable(true);
      }, 20);
    } else if (popoverOpen) {
      setPopoverOpen(false);
      setCalendarPopoverEnable(false);
    }
  }, [countClick]);

  const handleInputClick = () => {
    console.log("handleInputClick", countClick);
    setCountClick(countClick + 1);
  };

  useEffect(() => {
    //React-hook-form setValue function will trigger this useEffect by updating the value prop
    if (value !== undefined && value !== null) {
      value = String(value);
      // If registerOnChange is a function, create a synthetic event and pass it
      // Please note that this approach assumes that registerOnChange only uses the value and name from the event object. If registerOnChange uses other properties from the event object (like event.target.type or event.currentTarget), you'll need to include those in the synthetic event as well.
      const event = {
        target: {
          value: value,
          name: registerName, // Assuming registerName is the name of the input
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleDateChange(event);
    }
  }, [value]);

  const placeholder = inputProps.placeholder;

  // Render the DatePicker UI as needed
  return (
    <Popover open={popoverOpen} defaultOpen={false} modal={false}>
      {/* Add any DatePicker-specific elements or behavior */}
      <PopoverTrigger className={cn("w-full justify-start", className)} onClick={handleTriggerClick}>
        <Input
          id={id}
          name={registerName ?? id}
          inputRef={inputRef}
          ref={registerRef}
          register={passRegisterToInput ? register : undefined}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={dateString ?? defaultValue ?? ""}
          onChange={(e) => {
            handleDateChange(e);
          }}
          historicValuesEnabled={historicValuesEnabled}
          historicValues={historicValues}
          historicValueLabels={historicValueLabels}
          disabled={disabled}
          presentAsStatic={presentAsStatic}
          required={required}
          errors={errors}
          error={error ?? localErrorMsg}
          //validationSchema={validationSchema ?? undefined}
          onClick={handleInputClick}
          //onFocus={() => setIsPopoverOpen(true)}
          {...inputProps}
        />
      </PopoverTrigger>
      <PopoverContent
        ref={(node: HTMLDivElement) => {
          mergeRefs(node, contentBoxRef, calRef);
        }}
        side="bottom"
        sideOffset={0}
        align="center"
        className="pointer-events-auto z-[40] m-0 h-full w-full rounded-xl p-0"
      >
        <Calendar
          mode="single"
          defaultMonth={date ? date : defaultDate}
          selected={date}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          startMonth={fromYear ? new Date(fromYear, 0) : undefined}
          endMonth={toYear ? new Date(toYear, 11) : undefined}
          className="h-fit w-fit"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateInput;
