"use client";

import { cn } from '../../lib/utils';
import { generateEvent } from '../../utils/objectManipulation';
import { Loader2 } from "lucide-react";
import React, { forwardRef, useRef, useState } from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { Input } from "../inputs/Input";

interface InputArrayProps {
  id?: string;
  className?: string;
  inputsContainerClassName?: string;
  title?: string;
  length?: number;
  secret?: boolean;
  token?: string;
  onChange?: (value: string) => void;
  onLastInputChange?: (value: string) => void;
  register?: UseFormRegister<FieldValues>;
  validationSchema?: RegisterOptions;
  errors?: FieldErrors<any>;
  isLoading?: boolean;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
}

export const InputArray = forwardRef<HTMLDivElement, InputArrayProps>(
  (
    {
      id,
      className,
      inputsContainerClassName,
      title,
      length = 6,
      secret,
      token,
      onChange,
      onLastInputChange,
      register,
      validationSchema,
      errors,
      isLoading,
      defaultValue,
      required = true,
      autoComplete,
      ...props
    },
    ref
  ) => {
    const [OTP, setOTP] = useState(defaultValue ? defaultValue.slice(0, length) : "");
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const [isInputVisible, setIsInputVisible] = useState(true);

    let registerOnChange: ((e: React.ChangeEvent<HTMLElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLInputElement> | undefined;

    // Check if the register function exists before invoking it
    if (id && register && !registerOnChange) {
      if (!validationSchema && required) {
        validationSchema = { required: "This field is required" };
      }

      const registerResult = register(id, validationSchema);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }

    const handleOTPChange = (index: any, value: any) => {
      console.log("handleOTPChange", index, value);
      // Ensure the value is a single character
      if (value.length > 1) {
        value = value.slice(0, 1);
      }

      // Update the token state
      const newOTP = OTP.split("");
      newOTP[index] = value.toUpperCase();
      const newOTPString = newOTP.join("");
      setOTP(newOTPString);
      console.log("handleOTPChange", newOTPString);
      onChange && onChange(newOTPString);

      const e = generateEvent({ value: newOTPString, name: registerName ?? id ?? "" });
      registerOnChange && registerOnChange(e);

      // Move focus to the next input field
      if (value && inputsRef.current[index + 1]) {
        const nextInput = inputsRef.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }

      if (index === length - 1) {
        onLastInputChange && onLastInputChange(newOTPString);
      }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      const { value } = event.target as HTMLInputElement;
      // Move focus to the previous input field if the user pressed backspace
      if (value === "" && event.key === "Backspace" && inputsRef.current[index - 1]) {
        const prevInput = inputsRef.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      } else if (event.key === "Enter") {
        const nextInput = inputsRef.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        } else {
          handleOTPChange(index, value);
        }
      }
      ////console.log("HKD", token);
    };

    const getMaxInputIndex = () => {
      if (!inputsRef.current || inputsRef.current.length === 0) return 0;

      const highestIndex = inputsRef.current.reduce((highestIndex, currentInput) => {
        const currentIndex = parseInt(currentInput.id.split("-")[1]);

        if (isNaN(currentIndex)) {
          return highestIndex;
        }

        return currentIndex > highestIndex ? currentIndex : highestIndex;
      }, 0);

      return highestIndex + 1;
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      const pastedData = event.clipboardData.getData("text");
      const input = event.target as HTMLInputElement;
      const currentValue = input.value;
      const { selectionStart, selectionEnd } = input;
      const expectedTokenLength = getMaxInputIndex();
      //const pastedDataLength = pastedData.length;

      if (selectionStart !== null && selectionEnd !== null) {
        const start = currentValue.substring(0, selectionStart);
        const end = currentValue.substring(selectionEnd);
        const newValue = start + pastedData + end;

        const trimmedValue = newValue.slice(0, expectedTokenLength);

        // Update the token state
        setOTP(trimmedValue);

        if (trimmedValue.length === expectedTokenLength) {
          onChange && onChange(trimmedValue);
        }

        // Move focus to the appropriate input field
        const pasteIndex = index + selectionStart;
        if (inputsRef.current[pasteIndex]) {
          const nextInput = inputsRef.current[pasteIndex];
          nextInput.focus();

          // Set the value of subsequent input boxes based on the pasted value
          const remainingValues = [...newValue].slice(pasteIndex + pastedData.length);
          remainingValues.forEach((val, idx) => {
            if (inputsRef.current[pasteIndex + 1 + idx]) {
              inputsRef.current[pasteIndex + 1 + idx].value = val || "";
            }
          });
        }

        // Prevent the default paste behavior
        event.preventDefault();
      }
    };

    return (
      <div className={cn("mx-auto flex w-full flex-col justify-between rounded-md sm:px-0 ", className)}>
        <h1 className="py-2 font-bold" hidden={!title}>
          {title}
        </h1>
        <div className={cn("w-full", { "flex items-center justify-center": isLoading })}>
          <span
            className={cn(
              " whitespace-nowrap",
              { "flex items-center justify-center": !isLoading },
              {
                invisible: isLoading,
              }
            )}
          >
            <div
              className={cn("flex justify-between gap-2 py-2 md:w-full", inputsContainerClassName)}
              style={{
                transition: `opacity 1000ms`,
                transitionDelay: `250ms`,
                opacity: isInputVisible ? 1 : 0,
              }}
            >
              {Array.from({ length: length }, (_, index) => (
                // Render the inputs only when isLoading is false
                <Input
                  id={`OTP-${index}`}
                  label=""
                  key={index}
                  otherType={secret ? "password" : "text"}
                  allowVisibility={!secret}
                  maxLength={1}
                  style={{
                    transition: `opacity 1000ms`,
                    transitionDelay: `${index * 250}ms`,
                    transitionDuration: `2500ms`,
                    opacity: isInputVisible ? 1 : 0,
                  }}
                  size={"md"}
                  className="mx-0.5 max-w-[40px] text-2xl font-extrabold"
                  inputBoxClassName={cn(
                    "focus:border-purple focus:ring-purple focus:ring-[1px]",
                    OTP[index] ? "border-purple hover:border-purple hover:ring-purple hover:ring-[1px]" : "border-gray-200"
                  )}
                  //additionalInputClassName="border-[3px]"
                  defaultValue={OTP[index] || ""}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onPaste={(e) => handlePaste(e, index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputRef={(input) => {
                    inputsRef.current[index] = input as HTMLInputElement;
                  }}
                  autoComplete={autoComplete}
                />
              ))}
            </div>
          </span>
          {isLoading && <Loader2 className="absolute animate-spin" size={26} />}
        </div>
      </div>
    );
  }
);

InputArray.displayName = "InputArray";
