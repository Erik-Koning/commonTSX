import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import TimeInput, { TimeInputProps } from "./TimeInput";
import DateInput, { DateInputProps } from "./DateInput";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { createChangeEvent } from '../../utils/react';
import { isValidDate } from '../../utils/dateManipulation';

const DateTimeInputVariants = cva("", {
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

interface DateTimeInputProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof DateTimeInputVariants> {
  id: string;
  className?: string;
  TimeInputProps: TimeInputProps;
  DateInputProps: DateInputProps;
  defaultDate?: Date;
  calRef?: React.RefObject<HTMLDivElement | null>;
  register?: UseFormRegister<FieldValues>;
  onChange?: (e: any) => void;
  validationSchema?: RegisterOptions;
  errors?: FieldErrors<any>;
  required?: boolean;
}

export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  (
    {
      id,
      className,
      variant,
      size,
      TimeInputProps,
      DateInputProps,
      defaultDate,
      calRef,
      register,
      errors,
      onChange,
      validationSchema,
      required,
      ...props
    },
    ref
  ) => {
    const [dateTime, setDateTime] = useState<Date>(() => {
      return isValidDate(defaultDate) ? defaultDate! : new Date();
    });
    const [internalDefaultDate, setInternalDefaultDate] = useState<Date | undefined>(undefined);

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

    function handleNewCombinedDate(date: Date) {
      const event = createChangeEvent(registerName ?? id, date);
      if (registerOnChange) {
        registerOnChange(event);
      }
      if (onChange) {
        onChange(event);
      }
    }

    useEffect(() => {
      // Only update if defaultDate has actually changed from our last stored value
      if (defaultDate !== internalDefaultDate) {
        setDateTime(isValidDate(defaultDate) ? defaultDate! : new Date());
        setInternalDefaultDate(isValidDate(defaultDate) ? defaultDate! : new Date());
      }
    }, [defaultDate, internalDefaultDate]);

    useEffect(() => {
      handleNewCombinedDate(dateTime);
    }, [dateTime]);

    function handleNewDate(event: React.ChangeEvent<HTMLInputElement>) {
      const date = event.target.value as Date | string | undefined;
      let dateObj: Date;
      if (typeof date === "string") {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date();
      }
      setDateTime((prevDateTime) => new Date(dateObj.setHours(prevDateTime.getHours(), prevDateTime.getMinutes())));
    }

    function handleNewTime(event: React.ChangeEvent<HTMLInputElement>) {
      const time = event.target.value as Date | string | undefined;
      let timeObj: Date;
      if (typeof time === "string") {
        if (time.includes(":")) {
          let [hours, minutes] = time.split(":");
          let ampm = "AM";
          //Check for AM or PM in the minutes
          if (minutes.includes("AM") || minutes.includes("PM")) {
            const [newMinutes, newAmPm] = minutes.split(" ");
            minutes = newMinutes;
            ampm = newAmPm;
          }
          timeObj = new Date(0, 0, 0, parseInt(hours) + (ampm === "PM" ? 12 : 0), parseInt(minutes));
        } else {
          return;
        }
      } else if (time instanceof Date) {
        timeObj = time;
      } else {
        timeObj = new Date();
      }
      //is timeObj a valid date?
      if (isNaN(timeObj.getTime())) {
        //check state for recovery
        if (isNaN(dateTime.getTime())) {
          setDateTime(new Date());
        }
        return;
      }

      setDateTime((prevDateTime) => new Date(prevDateTime.setHours(timeObj.getHours(), timeObj.getMinutes())));
    }

    return (
      <div {...props} className={cn("relative flex flex-col gap-y-1", DateTimeInputVariants({ variant, size }), className)} ref={ref}>
        <DateInput
          getOnChangeValueAsDate={true}
          defaultDate={internalDefaultDate}
          size={"sm_xs"}
          inputBoxClassName="text-center p-0 pr-1"
          className="w-full"
          {...DateInputProps}
          onChange={handleNewDate}
          calRef={calRef}
          format={DateInputProps.format}
        />
        <TimeInput
          delayOnChangeToBlurOrTimeout={true}
          delayOnChangeToBlurOrTimeoutValue={5000}
          defaultDate={internalDefaultDate}
          className="justify-between"
          size={"sm_xs"}
          buttonProps={{ size: "sm_xs" }}
          {...TimeInputProps}
          onChange={handleNewTime}
        />
      </div>
    );
  }
);

DateTimeInput.displayName = "DateTimeInput";
