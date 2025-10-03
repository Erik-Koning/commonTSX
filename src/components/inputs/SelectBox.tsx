"use client";

import React, { ReactElement, useEffect, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";

import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";

import { useHoverState } from '../../hooks/useHovered';
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { cn } from '../../lib/utils';
import autofillTooltipText from '../../utils/autofillTooltipText';
import camelOrSnakeToTitleCase, { removeSpaces } from '../../utils/camelOrSnakeToTitleCase';
import {
  elementInArray,
  getObjectWithKeyValue,
  isIdentical,
  objEqualObj,
  removeDuplicatesWithMatchingKeyValues,
  removeKeysNotInArray,
  renameObjectKeysFoundInArray,
  unDef,
} from '../../utils/objectManipulation';
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Edit } from "lucide-react";
import { Button } from "../ui/Button";
import { HandleHoverStateTogglerRef } from "../ui/HandleHoverStateToggler";
import { Label } from "../ui/Label";
import { LabelAbove } from "../ui/LabelAbove";
import { AlternateAIFieldValueIcon } from "./AlternateAIFieldValueIcon";
import { FeatureIcons } from "./FeatureIcons";
import { InputProps, components, GroupBase, SelectInstance, FormatOptionLabelMeta } from "react-select";
import { useMergedRef } from '../../hooks/useMergedRef';
import { findElementInEventHierarchy } from "../../utils/DOM";
import { isNullOrUndefined } from "../../utils/booleansAndNullable";

export type defaultValueObject = {
  //value keys
  id?: string;
  value?: string;
  //label keys
  label?: string;
  name?: string;
  title?: string;
};

//A variant for label within and above the input
const inputVariants = cva("", {
  variants: {
    variant: {
      default: "",
      purple: "bg-purple hover:bg-darkPurple text-primary-light w-full justify-center",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      labelAbove: "",
    },
    width: {
      full: "w-full justify-center",
      fit: "w-fit max-w-min",
    },
    size: {
      default: "h-[65px]",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
      slim: "h-[38px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "slim",
  },
});

export interface SelectBoxProps extends VariantProps<typeof inputVariants> {
  id: string;
  labelAbove?: string | boolean;
  labelIcons?: React.ReactNode | null;
  placeholder?: string;
  showLabelIconsOnlyOnFocus?: boolean | null;
  label?: string;
  parents?: string[];
  dependents?: string[];
  type?: string;
  name?: string;
  disabled?: boolean;
  menuShouldScrollIntoView?: boolean;
  menuPlacement?: "top" | "bottom" | "auto";
  formatPrice?: boolean;
  required?: boolean;
  maxLength?: number;
  defaultOptions?: string[] | Record<string, any>;
  defaultValue?: string | defaultValueObject | defaultValueObject[];
  value?: string | string[] | undefined | defaultValueObject | defaultValueObject[] | undefined;
  isCreatable?: boolean;
  createOptionText?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoadingExt?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: string;
  isMulti?: boolean;
  minimumSelections?: number;
  autoSelect?: boolean;
  allowVerticalScale?: boolean;
  historicValuesEnabled?: boolean;
  historicValues?: string[];
  historicValueLabels?: string[];
  onChange?: (value: any) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  otherOnBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  register?: UseFormRegister<FieldValues>;
  innerRef?: any;
  ref?: React.Ref<HTMLInputElement>;
  errors?: FieldErrors<any>;
  errorMsg?: string;
  error?: any;
  selectionMessages?: Record<string, ReactElement | null> | null;
  validationSchema?: RegisterOptions;
  labelEditOnClick?: boolean;
  presentAsStatic?: boolean;
  hideLabelWhenStatic?: boolean;
  besideLabelWhenStatic?: boolean;
  presentAsLabel?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  controlledMenuOpen?: boolean;
  closeMenuOnSelect?: boolean;
  hiddenBehindText?: string;
  className?: string | string[];
  inputBoxClassName?: string | string[];
  focusBorderColor?: string;
  outlineColor?: string;
  selectHoverColor?: string;
  selectSelectColor?: string;
  style?: React.CSSProperties;
  removeMultiInLabel?: boolean;
  showValueInLabel?: boolean;
  removeDuplicates?: boolean;
  onProcessDefaultOptions?: (options: string[] | Record<string, any>) => void;
  onMenuOpenChange?: (open: boolean) => void;
  valueOnChangeAsObject?: boolean;
  debug?: boolean;
}

export const SelectBox = React.forwardRef<HTMLInputElement, SelectBoxProps>(
  (
    {
      id,
      name,
      labelAbove,
      labelIcons = null,
      placeholder,
      showLabelIconsOnlyOnFocus = true, //only show label icons when focused
      label,
      parents = [],
      dependents = [],
      type = "text",
      disabled,
      menuShouldScrollIntoView,
      menuPlacement = "auto",
      variant,
      size,
      width,
      formatPrice,
      required,
      maxLength,
      defaultOptions = [],
      defaultValue,
      value,
      isCreatable = true,
      createOptionText,
      isClearable = true,
      isSearchable = true,
      isLoadingExt = false,
      isDisabled,
      noOptionsMessage,
      isMulti = false,
      minimumSelections,
      autoSelect = false,
      allowVerticalScale = undefined,
      historicValuesEnabled = false,
      historicValues = [],
      historicValueLabels = [],
      innerRef,
      onChange,
      onFocus,
      onBlur,
      otherOnBlur,
      onKeyDown,
      onPaste,
      register,
      errors,
      errorMsg,
      error,
      selectionMessages,
      validationSchema,
      labelEditOnClick = false,
      presentAsStatic = false,
      besideLabelWhenStatic = false,
      hideLabelWhenStatic = true,
      presentAsLabel = false,
      preventDefault = false,
      stopPropagation = false,
      controlledMenuOpen = true,
      closeMenuOnSelect = undefined,
      hiddenBehindText,
      className,
      inputBoxClassName,
      focusBorderColor,
      outlineColor = "var(--skyBlue)",
      selectHoverColor = "var(--faintPurple)",
      selectSelectColor = "var(--lightPurple)",
      style,
      removeMultiInLabel,
      showValueInLabel,
      removeDuplicates = true,
      onProcessDefaultOptions,
      onMenuOpenChange,
      valueOnChangeAsObject,
      debug = true,
    },
    ref
  ) => {
    type Option = {
      label: string;
      value: string;
    };

    interface OptionType {
      readonly value: string;
      readonly label: string;
      readonly color?: string;
      readonly isFixed?: boolean;
      readonly isDisabled?: boolean;
      readonly email?: string;
    }

    const OptionTypeKeys: Array<keyof OptionType> = ["value", "label", "color", "isFixed", "isDisabled", "email"];

    function slugify(text: string) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    const createOption = (createValue?: string | Record<string, any>): OptionType | undefined => {
      let result: Record<string, any> | undefined = undefined;
      if (typeof createValue === "object") {
        if (Object.keys(createValue).length === 0) return undefined;
        if (createValue.hasOwnProperty("value") && createValue.hasOwnProperty("label")) {
          result = createValue;
        } else {
          const valuesKeys = ["value", "id"];
          const labelsKeys = ["label", "name", "title"];
          const emailKeys = ["email"];
          result = renameObjectKeysFoundInArray(createValue, { value: valuesKeys, label: labelsKeys });
        }

        if (result && Object.keys(result).length > 0) {
          //remove keys not part of type OptionType
          result = removeKeysNotInArray(result, OptionTypeKeys);
          //if no value, set value to label, and vice versa
          if (result && isNullOrUndefined(result.value) && !isNullOrUndefined(result.label)) result.value = result.label;
          if (result && isNullOrUndefined(result.label) && !isNullOrUndefined(result.value)) result.label = result.value;
          if (result && !isNullOrUndefined(result.value)) return result as OptionType;
        }

        //there is no value or label, assume first key as label, value as value
        const keys = Object.keys(createValue);
        if (keys.length > 0) {
          result = {
            label: keys[0],
            value: createValue[keys[0]],
          };
        }
        if (!result || Object.keys(result).length === 0) return undefined;
        return result as OptionType | undefined;
      }

      if (!createValue) return undefined;
      //This was messing up the value of the select box to be different case than expected.
      //const value = camelOrSnakeToTitleCase(label);
      const newValue = createValue;
      return {
        value: newValue,
        label: newValue,
      };
    };

    //if (id.toLowerCase().includes("change")) debugger;

    console.log("select default Value99", defaultValue);

    /*

    let formattedDefaultValue = { value: "", label: "" } as Option | undefined;
    if (typeof defaultValue === "string" && defaultValue.length > 0) {
      formattedDefaultValue = createOption(defaultValue);
    } else if (typeof defaultValue === "number") {
      if (!Array.isArray(defaultOptions) && typeof defaultOptions === "object" && defaultOptions.length > 0) {
        //get the object at index of the number
        formattedDefaultValue = {
          value: String(defaultOptions[defaultValue]),
          label: String(defaultOptions[defaultValue]),
        };
      } else if (Array.isArray(defaultOptions) && defaultOptions.length > 0) {
        formattedDefaultValue = {
          value: String(defaultOptions[defaultValue]),
          label: String(defaultOptions[defaultValue]),
        };
      }
    } else {
      formattedDefaultValue = {
        value: "",
        label: "",
      };
    }

    if (!formattedDefaultValue || !formattedDefaultValue.value) {
      formattedDefaultValue = undefined;
    }

    console.log("formattedDefaultValue", formattedDefaultValue);
    */

    //const { getAll } = useCountries();
    //state for if a country is selected, affects label position
    const [editMode, setEditMode] = useState(false); //always editable unless isLabel
    const [isStatic, setIsStatic] = useState(presentAsStatic);
    const [menuControlled, setMenuControlled] = useState(controlledMenuOpen);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isTyping, setIsTyping] = useState(isLoadingExt);
    const [isLoading, setIsLoading] = useState(false);
    const [showLabelIcons, setShowLabelIcons] = useState<boolean>(showLabelIconsOnlyOnFocus !== null ? !showLabelIconsOnlyOnFocus : true);
    const [JSXBelow, setJSXBelow] = useState<ReactElement | null>(null);
    const [options, setOptions] = useState([] as OptionType[]);
    const [valueState, setValueState] = useState<Option | Record<string, any>[] | undefined>(undefined);
    //const [stateValue, setStateValue] = useState<string | null>(value !== undefined ? value : null);

    const createdOptionsRef = useRef<OptionType[]>([]);
    const selectInputBoxRef = useRef<HTMLInputElement>(null);
    const hasError = (errors && errors[id]) || (errorMsg && errorMsg?.length > 0);
    const [isHiddenBehindText, setIsHiddenBehindText] = useState(hiddenBehindText ? true : false);

    const isLabel = isStatic && (presentAsLabel || labelEditOnClick);
    const valueCanBeChanged = isCreatable || options.length > (minimumSelections ?? 0);
    const allowEditButton = isLabel && labelEditOnClick && valueCanBeChanged;

    if (typeof labelAbove === "boolean" && labelAbove === true) {
      labelAbove = camelOrSnakeToTitleCase(label ?? name ?? id);
      console.log("labelAbove11", labelAbove);
    }

    useEffect(() => {
      console.log("valueState99", valueState);
    }, [valueState]);

    useEffect(() => {
      setIsLoading(isLoadingExt);
    }, [isLoadingExt]);

    ////console.log("*******Error!!", error);
    useEffect(() => {
      ////console.log("*******Error!!", error);
    }, [error]);

    //so when defaultValue is set (changes) we call the onChange function so react-hook-form can register the value via the controller wrapper and useWatchWrapper. idk which one is actually doing the work.
    useEffect(() => {
      console.log("**CL1");

      console.log("defaultValue select box", defaultValue);
      //if (id.toLowerCase().includes("prefix")) debugger;
      if (defaultValue) {
        console.log("defaultValue 1", defaultValue);
        if (isIdentical(defaultValue, valueState)) return;
        console.log("Not Identical", defaultValue);
        if (typeof defaultValue === "string") {
          //Its possible the default value is being updated here after just setting an object with more than just a value key as the value state.
          //Is there a default Option this default value matches?
          if (Array.isArray(defaultOptions)) {
            const defaultValueObject = defaultOptions.find((v: any) => v && typeof v === "object" && v?.value === defaultValue);
            if (defaultValueObject) {
              if (debug) console.log("defaultValueObject 1", defaultValueObject);
              setValueState(createOption(defaultValueObject));
              return;
            }
          }

          // Check if currently the value state is an object
          if (typeof valueState === "object") {
            //is its value key equal to this new default value? Dont change the value state if it is already set to this default value.
            if (
              valueState &&
              typeof valueState === "object" &&
              !Array.isArray(valueState) &&
              valueState?.hasOwnProperty("value") &&
              valueState.value === defaultValue
            )
              return;
            if (valueState && typeof valueState === "object" && Array.isArray(options)) {
              //Find the object in the array that has a value key equal to the defaultValue
              const defaultValueObject = options.find((v) => v.value === defaultValue);
              if (defaultValueObject) {
                if (debug) console.log("defaultValueObject 2", defaultValueObject);
                setValueState(createOption(defaultValueObject));
                return;
              }
            }
          }
          if (debug) console.log("defaultValueObject 3", defaultValue);
          setValueState(createOption(defaultValue));
        } else if (isMulti) {
          if (Array.isArray(defaultValue)) {
            const defaultValueOptions: OptionType[] = [];
            for (const defaultValueOption of defaultValue) {
              const defaultValueOptionObject = createOption(defaultValueOption);
              if (defaultValueOptionObject) {
                defaultValueOptions.push(defaultValueOptionObject);
              }
            }
            if (debug) console.log("defaultValueObject 4", defaultValueOptions);
            setValueState(defaultValueOptions as any);
          } else {
            const defaultValueOption = createOption(defaultValue);
            if (debug) console.log("defaultValueObject 5", defaultValueOption);
            setValueState(defaultValueOption ? [defaultValueOption] : []);
          }
        } else if (typeof defaultValue === "object") {
          //todo
          if (debug) console.log("defaultValueObject 6", defaultValue);
          debugger;
          setValueState(createOption(defaultValue));
        } else {
          console.error("unknown defualt value in select box", defaultValue);
        }
        setIsTyping(false);
        //handleInputChange(defaultValue);    //causes new data to be sent to the server unnecessarily, server already has the data
      }
    }, [defaultValue]);

    useEffect(() => {
      onMenuOpenChange && onMenuOpenChange(menuOpen);
    }, [menuOpen]);

    useEffect(() => {
      console.log("**CL2");
      if (!isMulti && Array.isArray(value)) return;
      if (Array.isArray(value)) {
        console.log("value 2", value);
        if (debug) console.log("valueObject 2", value);
        setValueState(value as any);
        return;
      }
      if ((value && typeof value === "string") || !value) {
        console.log("value 3", value);
        if (debug) console.log("valueObject 3", value);
        setValueState(createOption(value));
      } else if (value && Array.isArray(value)) {
        console.log("value 4", value);
        if (debug) console.log("valueObject 4", value);
        setValueState(createOption(value[0] || ""));
        processValuesWithCallback(value as any, handleCreate);
      }
    }, [value]);

    useEffect(() => {
      console.log("**CL3");
      if (!selectionMessages) return;
      let found = false;
      for (const [key, KV] of Object.entries(selectionMessages)) {
        if (valueState && valueState.hasOwnProperty("value") && removeSpaces((valueState as any)?.value ?? "") === key) {
          found = true;
          setJSXBelow(KV);
          break;
        }
      }
      if (!found) setJSXBelow(null);
    }, [valueState, selectionMessages]);

    useEffect(() => {
      console.log("**CL4");
      console.log("defaultOptions98", defaultOptions);
      //if (defaultOptions.length === 1) debugger;
      if (!defaultOptions || defaultOptions.length === 0) return;
      if (typeof defaultOptions === "string") {
        defaultOptions = [defaultOptions];
      }

      let newOptions: OptionType[] | undefined;

      if (Array.isArray(defaultOptions)) {
        newOptions = defaultOptions
          .map((defaultOption: string | Record<string, any> | any) => createOption(defaultOption))
          .filter((v) => v !== undefined) as OptionType[];
      } else if (typeof defaultOptions === "object") {
        newOptions = Object.entries(defaultOptions)
          .map(([key, value]) => {
            return createOption({ [key]: value });
          })
          .filter((v) => v !== undefined) as OptionType[];
      } else if (typeof defaultOptions === "string") {
        newOptions = [createOption(defaultOptions)].filter((v) => v !== undefined) as OptionType[];
      }
      if (!newOptions) newOptions = [];

      if (removeDuplicates) {
        newOptions = removeDuplicatesWithMatchingKeyValues(newOptions, ["label", "value"], false);
      }
      console.log("\n\n\n\n 0", valueState);
      if (autoSelect) {
        //choose the firstOption by default
        if (!valueState || (Array.isArray(valueState) && valueState.length === 0)) {
          console.log("\n\n\n\n 4", newOptions[0]);
          handleInputChange(newOptions[0]);
        } else {
          //there is already a value choosen, but new values so replace if not in the new options
          let temp;
          if (Array.isArray(valueState)) {
            //valueState is an array
            //set handleInputChange as the subset of valueState that is in the new "newOptions"
            temp = valueState.filter((value) => {
              return elementInArray(value, newOptions);
            });
            handleInputChange(isMulti ? temp : newOptions[0]);
          } else {
            //valueState is a single obj
            if (!elementInArray(valueState, newOptions)) {
              handleInputChange(isMulti ? [newOptions[0]] : newOptions[0]);
            }
          }
        }
      }
      if (objEqualObj(newOptions, options)) return;
      onProcessDefaultOptions && onProcessDefaultOptions(newOptions);
      //Incase of re-render, combine with the created options
      const combinedOptions = [...createdOptionsRef.current, ...newOptions];
      setOptions(combinedOptions);
      //console.log("defaultOptions99", defaultOptions);
    }, [defaultOptions]);

    //Loop over values and call callback on each of them
    function processValuesWithCallback(obj: string[] | Record<string, string>, callback: (value: string) => void) {
      console.log("**CL_500");
      if (Array.isArray(obj)) {
        // If input is an array, loop over its elements
        for (let i = 0; i < obj.length; i++) {
          callback(obj[i]);
        }
      } else if (typeof obj === "object" && obj !== null) {
        // If input is an object, loop over its values
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            callback(obj[key]);
          }
        }
      } else {
        console.error("Input must be an array or an object.");
      }
    }

    //styles
    function handlePointerHover() {}

    function handleSetValueState(option: OptionType | string | undefined | Record<string, any>[], append: boolean = true) {
      if (debug) console.log("handleSetValueState", option);
      if (typeof option === "string") {
        option = createOption(option);
      }
      if (!option || typeof option !== "object") return;
      if (isMulti) {
        if (Array.isArray(option) && option.length === 0 && append) {
          return [];
        }
        // Ensure prev is treated as an array, even if initially empty or single object
        const currentStateArray = Array.isArray(valueState) ? valueState : valueState ? [valueState] : [];

        let newValueState = [...currentStateArray];

        const optionsToAdd = Array.isArray(option) ? option : [option];

        if (append) {
          //Add all options to the value state that are not already in the value state
          optionsToAdd.forEach((o) => {
            if (!newValueState.some((v) => v.value === o.value)) {
              newValueState.push(o);
            }
          });
        } else {
          newValueState = optionsToAdd;
        }
        if (debug) console.log("handleSetValueState newValueState", newValueState);
        setValueState(newValueState);
        return newValueState;
      } else {
        // For non-multi select, simply set the value (functional update not strictly needed here
        // as it doesn't depend on the previous state, but can be used for consistency)
        if (debug) console.log("handleSetValueState option", option);
        setValueState(option);
        return option;
      }
    }

    function handleCreate(inputValue: string, setValue: boolean = true) {
      if (!isCreatable) return;
      setIsLoading(true);
      setIsTyping(false);

      //is this input value already an option?

      //return if this input is already an option
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === inputValue || options[i].label === inputValue) {
          setIsLoading(false);
          return;
        }
      }
      const newOption = createOption(inputValue);
      if (newOption !== undefined) {
        //Add the new option to the options array
        setOptions((prev) => [...prev, newOption]);
        createdOptionsRef.current.push(newOption);
        //trigger the handling of a new option
        handleInputChange(newOption.value as string, true);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }

    const handleInputChange = (value: any, append: boolean = false) => {
      //if (disabled) return;
      console.log("handleInputChange", value);
      let newValue: string | Record<string, any>[] | OptionType | undefined;
      if (typeof value === "string") newValue = value;
      else if (value && !Array.isArray(value) && typeof value === "object") newValue = value;
      else if (value && Array.isArray(value)) newValue = value as Record<string, any>[];
      else newValue = "";
      //console.log("handleInputChange", newValue);

      newValue = handleSetValueState(newValue, append);

      if (valueOnChangeAsObject) {
        newValue = createOption(newValue);
      } else if (newValue && typeof newValue === "object" && newValue.hasOwnProperty("value")) {
        newValue = (newValue as Record<string, any>).value;
      }

      // If registerOnChange is a function, create a synthetic event/artificial event and pass it
      // Please note that this approach assumes that registerOnChange only uses the value and name from the event object. If registerOnChange uses other properties from the event object (like event.target.type or event.currentTarget), you'll need to include those in the synthetic event as well.
      const event = {
        target: {
          value: newValue,
          name: registerName, // Assuming registerName is the name of the input
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange && onChange(event);
      registerOnChange && registerOnChange(event);
    };

    let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLInputElement> | undefined;

    if (!validationSchema && required) {
      validationSchema = { required: "This field is required" };
    }
    if (validationSchema && !validationSchema.required && required) {
      validationSchema = { ...validationSchema, required: "This field is required" };
    }

    // Check if the register function exists before invoking it
    if (register && !registerOnChange) {
      const registerResult = register(id, validationSchema);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }

    const hoverRef = useRef<HandleHoverStateTogglerRef>(null);

    const mergedRef = useMergedRef<SelectInstance<any, boolean, GroupBase<unknown>>>(ref, selectInputBoxRef, registerRef, innerRef);

    console.log("SelectBox value: ", value, " and default: ", defaultValue);

    const removeValueFromState = (value: string) => () => {
      if (!isMulti) {
        console.log("is not multi 8", value);
        if (debug) console.log("removeValueFromState undefined");
        setValueState(undefined);
        return;
      }
      if (!Array.isArray(valueState)) return;
      const newValueState = valueState.filter((v) => v.value !== value);
      console.log("\n\n\n\n 1", newValueState);
      handleInputChange(newValueState, false);
    };

    const divRef = useRef<HTMLDivElement>(null);
    useHoverState([divRef], {
      setSettersEnterTrue: [setShowLabelIcons],
      setSettersLeaveFalse: [setShowLabelIcons],
      disableSettersEnter: false,
      disableSettersLeave: false,
      disableSetters: false,
    });

    useUserUnengaged(
      divRef,
      () => {
        console.log("**CL closeMenuOnSelectProp 1", closeMenuOnSelectProp);
        setMenuOpen(false);
      },
      undefined,
      menuOpen
    );

    useUserUnengaged(
      divRef,
      () => {
        console.log("**CL closeMenuOnSelectProp 2", closeMenuOnSelectProp);
        setIsStatic(true);
        setMenuOpen(false);
        //blur the input
        if (innerRef.current) {
          innerRef.current.blur();
        }
      },
      1300,
      presentAsStatic && !isStatic
    );

    const labelIconsClassNames = "text-tertiary-dark hover:text-skyBlue hover:cursor-pointer";

    //React-Select allows you to augment layout and functionality by replacing the default components with your own, using the components property. These components are given all the current props and state letting you achieve anything you dream up.
    //https://react-select.com/components
    const Input = (props: InputProps, ...rest: any) => {
      //console.log("Input 999", props, ...rest);
      return <components.Input {...props} {...rest} />;
    };

    const IndicatorsContainer = (props: any) => {
      return <components.IndicatorsContainer {...props} getStyles={() => ({})} className="flex items-center h-full pl-0 bg-transparent z-0" />;
    };

    const ClearIndicator = (props: any, ...rest: any) => {
      //const styles = props.getStyles();
      console.log("ClearIndicator styles", rest);
      return (
        <components.ClearIndicator
          {...props}
          getStyles={() => ({})}
          className="-z-10 transition-all flex items-center bg-transparent px-1 text-border hover:text-tertiary-dark bg-[linear-gradient(to_left,hsl(var(--background))_70%,transparent_100%)]"
        />
      );
    };

    const DropdownIndicator = (props: any) => {
      return (
        <components.DropdownIndicator
          {...props}
          getStyles={() => ({})}
          className="transition-all flex px-1 items-center text-border hover:text-tertiary-dark"
        />
      );
    };

    const IndicatorSeparator = (props: any) => {
      return (
        <components.IndicatorSeparator
          {...props}
          getStyles={() => ({})}
          className={cn("flex self-stretch min-w-[1px] items-center text-border bg-border h-3/5 my-auto")}
        />
      );
    };

    const MenuPortal = (props: any) => {
      return (
        <components.MenuPortal
          {...props}
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          getStyles={props.getStyles}
        />
      );
    };

    const Menu = (props: any) => {
      return (
        <components.Menu
          {...props}
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          getStyles={props.getStyles}
        />
      );
    };

    const isClearableProp = isMulti && !removeMultiInLabel && ((isClearable && !minimumSelections) || isCreatable);
    console.log("valueState", valueState);
    const closeMenuOnSelectProp = closeMenuOnSelect ?? (isMulti ? false : true);
    console.log("\n\n\n\ncloseMenuOnSelectProp 0", closeMenuOnSelectProp, menuControlled, menuOpen);
    return (
      <div
        ref={divRef}
        className={cn("", className)}
        onClick={(e: any) => {
          console.log("\n\n\n\n\n\n e", e);
          const isOptionElement = findElementInEventHierarchy(e?.target, ["attributes", "role", "value"], 3, "option");
          const isRemoveOptionElement = findElementInEventHierarchy(e?.target, ["role"], 3, "remove-option");

          //The click was an option or a remove option, and we dont want to close the menu if there are more which could be selected
          if (
            isRemoveOptionElement ||
            (isOptionElement && !closeMenuOnSelectProp && (!valueState || (Array.isArray(valueState) && valueState.length < options.length - 1)))
          ) {
            return;
          }

          console.log("closeMenuOnSelectProp 3", closeMenuOnSelectProp, menuControlled, menuOpen);
          if (menuControlled && closeMenuOnSelectProp) setMenuOpen(false);
          if (stopPropagation) e.stopPropagation();
          if (preventDefault) e.preventDefault();
          //show the normal selectbox edit mode
          if (allowEditButton && isStatic) {
            setMenuControlled(true);
            setIsStatic(false);
            setMenuOpen(true);
          } else if (menuControlled) {
            setMenuOpen(!menuOpen);
          }
        }}
      >
        {isHiddenBehindText && hiddenBehindText ? (
          <div
            className="flex w-full"
            onClick={() => {
              setIsHiddenBehindText(!isHiddenBehindText);
            }}
          >
            {hiddenBehindText}
          </div>
        ) : (
          <motion.div
            className={cn("transition-all duration-2000", hideLabelWhenStatic && isStatic ? "justify-center" : isLabel ? "justify-between" : "")}
            initial={{ flexDirection: "column" }} // Starting position
            animate={{
              flexDirection: besideLabelWhenStatic && isStatic ? "row" : "column",
            }}
            transition={{ duration: 2 }} // Transition duration
            style={{ display: "flex" }}
          >
            {!(hideLabelWhenStatic && isStatic) && (
              <motion.div className="flex gap-x-1 pb-[0px] text-primary">
                <LabelAbove label={labelAbove} />
                {showLabelIcons && false && (
                  <div className="flex items-center gap-x-2">
                    {historicValuesEnabled && (
                      <AlternateAIFieldValueIcon
                        handleAlternativeSelect={(value) => {
                          console.log("\n\n\n\n 2", value);
                          handleInputChange(value);
                        }}
                        textState={valueState}
                        alternateValues={historicValues}
                        alternateValuesLabels={historicValueLabels}
                        triggerClassName={labelIconsClassNames}
                      />
                    )}
                    <FeatureIcons
                      tooltipText={autofillTooltipText(parents, dependents)}
                      numRelated={parents?.length > dependents?.length ? parents?.length : dependents?.length}
                      iconClassName="text-tertiary-dark hover:text-skyBlue"
                      className="w-[260px]"
                      side="top"
                      iconSize={16}
                    />
                  </div>
                )}
              </motion.div>
            )}
            <div>
              <Label
                variant={isLabel ? "default" : "blank"}
                size={"blank"}
                className={cn(
                  "flex h-full w-full flex-row items-center transition-all",
                  isLabel ? "" : "",
                  allowEditButton && isStatic && "hover:cursor-pointer"
                )}
                blank={isLabel ? false : true}
              >
                <CreatableSelect
                  id={id}
                  inputId={id}
                  name={name}
                  placeholder={placeholder ?? label}
                  isClearable={isClearableProp}
                  noOptionsMessage={({ inputValue }) => noOptionsMessage ?? "No options"}
                  closeMenuOnSelect={closeMenuOnSelectProp}
                  closeMenuOnScroll={undefined}
                  openMenuOnClick={isStatic ? false : undefined}
                  menuIsOpen={disabled ? false : menuControlled ? menuOpen : undefined}
                  menuPlacement={menuPlacement}
                  menuPosition={undefined}
                  menuShouldScrollIntoView={menuShouldScrollIntoView}
                  isSearchable={isSearchable}
                  isOptionDisabled={undefined}
                  captureMenuScroll={false}
                  defaultValue={createOption(defaultValue)}
                  options={options}
                  ref={mergedRef as any}
                  value={!isMulti ? valueState : isMulti && Array.isArray(valueState) ? valueState : undefined}
                  onCreateOption={handleCreate}
                  onChange={(e) => {
                    if (menuControlled && closeMenuOnSelectProp) {
                      console.log("closeMenuOnSelectProp 4", closeMenuOnSelectProp);
                      setMenuOpen(false);
                    }
                    if (presentAsStatic) setIsStatic(true);
                    console.log("\n\n\n\n 3", e);
                    handleInputChange(e);
                  }}
                  onFocus={(e) => {
                    if (preventDefault) e.preventDefault();
                    //setIsSelected(true);
                    onFocus?.(e);
                    //registerOnChange?.(e);
                  }}
                  blurInputOnSelect={true}
                  onBlur={(e) => {
                    console.log("onBlur", e);
                    onBlur?.(e);
                    registerOnBlur?.(e);
                    otherOnBlur?.(e);
                    hoverRef.current?.handleLeave();
                  }}
                  onMenuClose={() => {
                    setIsTyping(false);
                  }}
                  onInputChange={(e) => {
                    console.log("onInputChange", e);
                    setIsTyping(true);
                  }}
                  isDisabled={isLoading || disabled}
                  isLoading={isLoading}
                  classNames={{
                    //styles the input
                    input: ({}) =>
                      cn(
                        "flex-inline text-md rounded-xl ",
                        inputBoxClassName,
                        allowEditButton && isStatic && "hover:cursor-pointer",
                        inputVariants({ size })
                      ), //the height of the box can be set here
                    container: ({}) => cn(""),
                    control: ({}) => cn("", inputVariants({ size })),
                    valueContainer: ({}) => cn(""),
                  }}
                  components={{ IndicatorsContainer, ClearIndicator, DropdownIndicator, IndicatorSeparator }}
                  formatOptionLabel={(option: Record<string, any>, formatOptionLabelMeta: FormatOptionLabelMeta<any>) => (
                    <div className={cn("flex flex-row items-center pl-[2px] text-center", allowEditButton && isStatic && "hover:cursor-pointer")}>
                      {(() => {
                        return null;
                      })()}

                      <div>{option.flag}</div>
                      <div className={cn("-mr-1 break-words text-left", { "text-primary": !disabled, "text-secondary-dark": disabled })}>
                        {option.label}
                      </div>
                      {showValueInLabel && option.label !== option.value && <div className="ml-2 pr-1 text-secondary-dark">{option.value}</div>}
                      {option.email && option.label !== option.email && <div className="ml-2 pr-1 text-secondary-dark">{option.email}</div>}
                      {isMulti && removeMultiInLabel && Array.isArray(valueState) && getObjectWithKeyValue(valueState, "value", option.value) && (
                        //only show the close icon if the value is in the valueState, ie it is selected and shown inside the input box
                        <Button
                          id={`${id}-remove-${option.value}`}
                          role="remove-option"
                          variant="blank"
                          size="blank"
                          className="flex items-center justify-center"
                          disabled={undefined}
                          onClick={removeValueFromState(option.value)}
                        >
                          <CloseOutlinedIcon className="rounded-full p-0.5 text-secondary-dark hover:bg-border" sx={{ fontSize: 22 }} />
                        </Button>
                      )}
                    </div>
                  )}
                  formatCreateLabel={(inputValue) =>
                    isCreatable ? (
                      <div className="">{`${createOptionText !== undefined ? createOptionText : `Create `}${inputValue}`}</div>
                    ) : (
                      <div className="">{`"${inputValue}" Not Found`}</div>
                    )
                  }
                  isMulti={isMulti}
                  //unstyled={true}
                  styles={{
                    container: (base) => ({
                      ...base,
                      //paddingTop: isStatic ? undefined : "1px",
                      color: "hsl(var(--danger))",
                      //height: "20px",
                      //maxHeight: allowVerticalScale ? "fit-content" : "36px",
                      //maxHeight: "10px !important",
                      //maxHeight: "fit-content",
                      height: besideLabelWhenStatic && isStatic ? "100%" : undefined,
                    }),
                    control: (provided, state) => {
                      //console.log("Control Style - provided:", provided);
                      //console.log("Control Style - state:", state);
                      return {
                        ...provided,
                        background: !disabled ? (isLabel ? "transparent" : "hsl(var(--background))") : "hsl(var(--secondary-light))",
                        opacity: !disabled ? 1 : 0.75,
                        outline: state.isFocused && !isStatic ? "1px solid" : "none",
                        outlineStyle: state.isFocused && !isStatic ? "solid" : "none",
                        outlineColor: hasError ? "#F87171" : !focusBorderColor ? outlineColor : focusBorderColor,
                        boxShadow: "none",
                        borderRadius: "6px",
                        borderColor: hasError
                          ? "#F87171" // Red color for error state
                          : state.isFocused
                          ? !focusBorderColor
                            ? outlineColor
                            : focusBorderColor // Blue color when the control is focused
                          : "hsl(var(--border))", // Default border color
                        "&:hover": {
                          borderColor: state.isFocused ? (hasError ? "#F87171" : !focusBorderColor ? outlineColor : focusBorderColor) : "gray", // Set the border color on hover, use red for error state
                        },
                        border: isStatic ? "none" : undefined,
                        color: "hsl(var(--danger))",
                        //maxHeight: allowVerticalScale ? "fit-content" : "36px",
                        height:
                          besideLabelWhenStatic && isStatic
                            ? "100%"
                            : isMulti && unDef(allowVerticalScale)
                            ? "fit-content"
                            : allowVerticalScale
                            ? "fit-content"
                            : undefined,
                        minHeight: besideLabelWhenStatic && isStatic ? "fit-content" : undefined,
                        //borderWidth: state.isFocused ? "2px" : "1px",
                        padding: "0px",
                        margin: "0px",
                      };
                    },

                    valueContainer: (base) => ({
                      ...base,
                      transition: "all 0.2s ease",
                      paddingRight: "0px",
                      marginTop: isStatic ? -5 : undefined,
                      paddingTop: isStatic ? 0 : undefined,
                      paddingLeft: isStatic ? "0px" : "9px",
                      marginLeft: isStatic ? "0px" : undefined,
                      //alignItems: isStatic ? "start" : "center",
                      color: "hsl(var(--danger))",
                      //maxHeight: isMulti ? "fit-content" : "38px",
                      height:
                        (isMulti && unDef(allowVerticalScale)) || (besideLabelWhenStatic && isStatic)
                          ? "fit-content"
                          : allowVerticalScale
                          ? "fit-content"
                          : "100%",
                      padding: "0px 0px 0px 0px",
                      margin: isStatic || (isClearableProp && isTyping) ? "-0.25px 0px 0px 0px" : "-0.25px -10px -1px -1px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      marginLeft: isStatic ? "0px" : undefined,
                    }),
                    input: (baseStyles, state) => ({
                      ...baseStyles,
                      //maxHeight: isMulti ? "fit-content" : "38px",
                      borderRadius: "20px",
                      //marginTop: "-10px",
                      marginLeft: -1,
                      //paddingTop: "-10px",
                      paddingLeft: "0px",
                      cursor: "text hsl(var(--primary))",
                      //maxHeight: "10px !important",
                      padding: "0px",
                      margin: "0px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? selectSelectColor : state.isFocused ? selectHoverColor : "hsl(var(--background))",
                      color: state.isSelected ? "black" : "inherit", // Set the text color of the selected option
                      "&:hover": {
                        backgroundColor: state.isSelected ? selectSelectColor : selectHoverColor, // Set the background color of the option on hover
                      },
                      textAlign: "left",
                      alignItems: "flex-start", // Align items to the start (top left corner)
                      justifyItems: "flex-start", // Align items to the start (top left corner)
                      justifySelf: "flex-start", // Align the item to the start (left side)
                      alignSelf: "flex-start", // Align the item to the start (top side)
                      alignContent: "flex-start", // Align content to the start (top side)
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start", // Align content to the start (left side)
                      whiteSpace: "pre-line", // Allow text to wrap
                      wordWrap: "break-word", // Ensure words break correctly when wrapping
                      wordBreak: "normal", // Ensure words break correctly when wrapping
                      //backgroundColor: "hsl(var(--danger))",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: "1em",
                      fontWeight: 400,
                      marginLeft: "-6px",
                      paddingLeft: "5px",
                      color: "hsl(var(--tertiary-dark))",
                      display: "flex",
                      alignItems: "center",
                    }),
                    //singleValue: (base) => ({
                    //	...base,
                    //	background: "hsl(var(--text-darkBlue))",
                    //}),
                    indicatorsContainer: (base) =>
                      //console.log("indicatorsContainer base", base),
                      ({
                        ...base,
                        visibility: isStatic ? "hidden" : undefined,
                        display: isStatic ? "none" : "flex", // Changed from visibility to display
                        alignItems: "center",
                        justifyContent: "center",
                        alignContent: "center",
                        paddingLeft: "0px",
                      }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "hsl(var(--background))",
                      textAlign: "left",
                    }),
                    menuList: (base) => ({
                      ...base,
                      textAlign: "left",
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      borderRadius: "20px",
                      backgroundColor: "hsl(var(--secondary-light))",
                      color: "hsl(var(--secondary-light))",
                    }),
                    multiValue: (base) => ({
                      ...base,
                      borderRadius: "20px",
                      backgroundColor: "hsl(var(--background))",
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      display: removeMultiInLabel ? "none" : undefined,
                      borderRadius: "20px",
                      color: "hsl(var(--secondary))",
                      "&:hover": {
                        outline: "solid",
                        outlineColor: "hsl(var(--border))",
                        color: "var(--darkPurple)",
                        backgroundColor: "hsl(var(--background))",
                      },
                    }),
                    clearIndicator: (base, props) => ({
                      ...base,
                      display: isMulti ? "none" : undefined,
                      paddingTop: "0px !important",
                      paddingBottom: "0px !important",
                      //padding: "0px",
                    }),
                    dropdownIndicator: (base, props) => ({
                      ...base,
                      paddingTop: "0px !important",
                      paddingBottom: "0px !important",
                      //padding: "0px",
                    }),
                  }}
                />
                {label && (
                  <label
                    style={{ visibility: "hidden" }} //hide the label
                    className={` 
          pointer-events-none
          absolute 
          top-5
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
          ${isSelected ? "-translate-y-4 scale-75" : "translate-y-0 scale-100"}
          ${hasError ? "text-rose-500" : "text-zinc-400"}
        `}
                  >
                    {label}
                  </label>
                )}
                {isLabel && allowEditButton && <Edit size={16} className="mx-0.5 text-secondary-dark transition-all hover:text-primary-dark" />}
              </Label>
              {hasError && (
                <div className="">
                  {errors && errors[id] && <span className="left-0 z-40 my-2 text-sm text-rose-500">{String(errors[id]?.message)}</span>}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {JSXBelow}
      </div>
    );
  }
);

SelectBox.displayName = "SelectBox";
