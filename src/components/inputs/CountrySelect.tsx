"use client";

import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";

import useCountries from '../../hooks/useCountries';
import { cn } from '../../lib/utils';
import { objEqualObj } from "../../utils/objectManipulation";

export type CountrySelectValue = {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
};

export interface CountrySelectProps {
  id: string;
  label?: string;
  type?: string;
  name?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  maxLength?: number;
  value?: CountrySelectValue;
  defaultValue?: string;
  onChange: (value: CountrySelectValue) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  register?: UseFormRegister<FieldValues>;
  errors?: FieldErrors<any>;
  errorMessage?: string;
  validationSchema?: RegisterOptions;
  innerRef?: React.Ref<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  isClearable?: boolean;
  className?: string | string[];
  style?: React.CSSProperties;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  id,
  label = "Select a country",
  type = "text",
  name,
  disabled,
  formatPrice,
  required,
  maxLength,
  value,
  defaultValue,
  onChange,
  onBlur,
  onKeyDown,
  onPaste,
  register,
  errors,
  errorMessage,
  validationSchema,
  isClearable = true,
  innerRef,
  inputRef,
  className,
  style,
}) => {
  const { getAll } = useCountries();
  //state for if a country is selected, affects label position
  const [isSelected, setIsSelected] = useState(false);
  const [valueState, setValueState] = useState<CountrySelectValue | null>(null);
  const selectInputBoxRef = useRef<HTMLInputElement>(null);
  const hasErrors = !!(
    (errors && typeof errors === "object" && errors[id]) ||
    (errors && typeof errors === "object" && Object.keys(errors)?.length > 0) ||
    errorMessage
  );

  const allCountries = getAll();

  const handleOnChange = (value: CountrySelectValue | null) => {
    if (value) {
      setIsSelected(true);
      setValueState(value);
      onChange(value);
    } else {
      setIsSelected(false);
      setValueState(null);
    }
  };

  //value use effect
  useEffect(() => {
    if (value && !objEqualObj(value, valueState)) {
      handleOnChange(value);
    }
  }, [value]);
  //styles

  useEffect(() => {
    if (defaultValue) {
      if (typeof defaultValue === "object" && "value" in defaultValue) {
        defaultValue = (defaultValue as CountrySelectValue).value;
      }
      const defaultCountry = allCountries.find((country) => country.value === defaultValue);
      if (typeof valueState === "object" && objEqualObj(valueState, defaultCountry)) {
        //Don't change the value if it's the same as the default
        return;
      }
      if (defaultCountry) {
        handleOnChange(defaultCountry);
      }
    }
  }, [defaultValue]);

  return (
    <div className="relative min-w-full text-zinc-400">
      <Select
        id={id}
        onFocus={() => {
          setIsSelected(true);
        }}
        onBlur={() => {
          if (!value) setIsSelected(false);
        }}
        placeholder={label}
        isClearable
        closeMenuOnSelect={true}
        isSearchable={true}
        captureMenuScroll={false}
        options={allCountries}
        value={valueState}
        //classNamePrefix={"pb-6"}
        onChange={(value) => {
          handleOnChange(value as CountrySelectValue);
        }}
        formatOptionLabel={(option: any) => (
          <div
            className="
          flex flex-row items-center gap-3 hover:bg-skyBlue"
          >
            <div>{option.flag}</div>
            <div className="text-Black">
              {option.label},<span className="ml-1 text-neutral-500">{option.region}</span>
            </div>
          </div>
        )}
        classNames={{
          control: (isSelected) =>
            cn(
              {
                "p-2 pr-0 mb-0 h-[54px] peer min-w-full appearance-none rounded-lg border-2 bg-white font-normal outline-none transition disabled:cursor-not-allowed disabled:opacity-70":
                  true,
                "border-rose-500": hasErrors,
                "border-neutral-300": !hasErrors,
                "focus:border-rose-500": hasErrors,
                "focus:border-skyBlue": !hasErrors,
                "text-red": !isSelected,
                // additional class names for selected option
              },
              "focus:ring-none focus:border-none focus:outline-none outline-none border-none ring-none"
            ),
          input: ({}) => cn("text-md text-primary min-w-full outline-none border-none ring-none", {}),
          option: ({ isSelected, isFocused }) =>
            cn({
              "bg-white text-md p-5 -m-[1px] pt-4 min-w-full outline-none border-none ring-none": true,
              "text-red-500": isSelected,
              // additional class names for selected option
            }),
          menu: ({}) => cn("outline-none border-none ring-none", {}),
          menuList: ({}) => cn("outline-none border-none ring-none", {}),
          singleValue: ({}) => cn("outline-none border-none ring-none", {}),
          valueContainer: ({}) => cn("outline-none border-none ring-none", {}),
          placeholder: ({}) => cn("outline-none border-none ring-none", {}),
          indicatorSeparator: ({}) => cn("outline-none border-none ring-none", {}),
          indicatorsContainer: ({}) => cn("outline-none border-none ring-none", {}),
          dropdownIndicator: ({}) => cn("outline-none border-none ring-none", {}),
          clearIndicator: ({}) => cn("outline-none border-none ring-none", {}),
        }}
        //unstyled={true}
        styles={{
          input: (baseStyles, state) => ({
            ...baseStyles,
            borderRadius: "20px",
            marginLeft: "",
            paddingLeft: "",
            cursor: "text hsl(var(--primary))",
            color: "hsl(var(--primary))",
            outline: "none",
            border: "none",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#a0c3ff" : state.isFocused ? "#4F8DF6" : "hsl(var(--background))",
            color: state.isSelected ? "black" : "inherit", // Set the text color of the selected option
            "&:hover": {
              backgroundColor: "#4F8DF6", // Set the background color of the option on hover
            },
            border: "none",
            outline: "none",
          }),
          control: (provided, state) => ({
            ...provided,
            background: "hsl(var(--background))",
            outlineColor: hasErrors ? "#F87171" : "#4F8DF6",
            boxShadow: "none",
            outline: state.isFocused ? "1.5px solid hsl(var(--border))" : "none",
            outlineOffset: state.isFocused ? "0px" : "none",
            borderRadius: "6px",
            border: state.isFocused ? "0px solid hsl(var(--border))" : "",
            borderColor: hasErrors
              ? "#F87171" // Red color for error state
              : state.isFocused
              ? "#4F8DF6" // Blue color when the control is focused
              : "hsl(var(--border))", // Default border color
            "&:hover": {
              borderColor: state.isFocused ? (hasErrors ? "#F87171" : "#4F8DF6") : "gray", // Set the border color on hover, use red for error state
            },
            //borderWidth: state.isFocused ? "2px" : "1px",
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: "1em",
            fontWeight: "400",
            //marginLeft: "-6px",
            color: "text-red",
            display: "none",
            outline: "none",
            border: "none",
          }),
        }}
      />
      {label && (
        <label
          className={`
          pointer-events-none
          absolute 
          top-[17px]
          z-40 
          origin-[0] 
          -translate-y-3 
          transform 
          text-md 
          duration-150 
          ${formatPrice ? "left-9" : "left-4"}
          peer-placeholder-shown:translate-y-0 
          peer-placeholder-shown:scale-100 
          peer-focus:-translate-y-4
          peer-focus:scale-75
          ${isSelected || valueState ? "-translate-y-4 scale-75" : "translate-y-0 scale-100"}
          ${hasErrors ? "text-rose-500" : "text-zinc-400"}
        `}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default CountrySelect;
