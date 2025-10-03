import { preSavePhoneRegex } from "./validations";
import { RegisterOptions } from "react-hook-form";
import { DateFormat, dateFormatValidations, DateValidation, getDateFromDateStringFormat } from "../../utils/dateManipulation";

//returns the error message if the input is invalid, otherwise returns null
export const validateString = (input: string, validationRules: Record<string, any>): string | null => {
  // Check if input is required and not provided
  if (validationRules.required && (!input || input.length === 0)) {
    return "";
  }

  // Check minimum length
  if (validationRules.minLength && input.length < validationRules.minLength.value) {
    return validationRules.minLength.message ?? "";
  }

  // Check maximum length
  if (validationRules.maxLength && input.length > validationRules.maxLength.value) {
    return validationRules.maxLength.message ?? "";
  }

  // Check the pattern, if present
  if (validationRules.pattern && input) {
    const pattern = validationRules.pattern.value;
    if (!pattern.test(input)) {
      return validationRules.pattern.message ?? "";
    }
  }

  // If all validations pass
  return null;
};

//returns true if the input is valid, otherwise false
export const isValidRulesString = (input: string, validationRules: Record<string, any>): boolean => {
  // Check if input is required and not provided
  if (validationRules.required && (!input || input.length === 0)) {
    return false;
  }

  // Check minimum length
  if (validationRules.minLength && input.length < validationRules.minLength.value) {
    return false;
  }

  // Check maximum length
  if (validationRules.maxLength && input.length > validationRules.maxLength.value) {
    return false;
  }

  // Check the pattern, if present
  if (validationRules.pattern && input) {
    const pattern = validationRules.pattern.value;
    if (!pattern.test(input)) {
      return false;
    }
  }

  // If all validations pass
  return true;
};

export const passwordValidation: RegisterOptions = {
  required: "A password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters long",
  },
  maxLength: {
    value: 60,
    message: "Password cannot be longer than 60 characters",
  },
  pattern: {
    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  },
};

export const pinValidation: RegisterOptions = {
  required: "A pin is required",
  minLength: {
    value: 4,
    message: "Pins should be at least 4 characters long",
  },
  maxLength: {
    value: 24,
    message: "Pins cannot be longer than 24 characters",
  },
};

export const emailValidation = {
  required: "Email is required",
  minLength: {
    value: 5,
    message: "Not sure how an email could be less than 5 characters long",
  },
  pattern: {
    value: /\S+@\S+\.\S+/,
    message: "Please enter a valid email address",
  },
};

const dateValidation_MM_DD_YYYY: DateValidation = {
  pattern: {
    // This regex will match a date in the format MM/DD/YYYY with the specified ranges for M and D
    value: dateFormatValidations["MM/DD/YYYY"],
    message: "Please enter a valid date in the format MM/DD/YYYY",
  },
};

const dateValidation_Month_D_YYYY: DateValidation = {
  pattern: {
    // Matches month name (case-insensitive), day (1-31), optional comma with surrounding whitespace, and 4-digit year
    // Requires at least one space after the month name.
    value: dateFormatValidations["Month D, YYYY"],
    message: "Please enter a valid date in the format 'Month D, YYYY' (comma is optional)",
  },
};

const dateValidation_DD_MM_YYYY: DateValidation = {
  pattern: {
    value: dateFormatValidations["DD/MM/YYYY"],
    message: "Please enter a valid date in the format DD/MM/YYYY",
  },
};

const dateValidation_DD_MMMM_YYYY: DateValidation = {
  pattern: {
    value: dateFormatValidations["DD/MM/YYYY"],
    message: "Please enter a valid date in the format DD/MM/YYYY",
  },
};

const dateValidation_YYYY_MM_DD: DateValidation = {
  pattern: {
    value: dateFormatValidations["YYYY/MM/DD"],
    message: "Please enter a valid date in the format YYYY/MM/DD",
  },
};

export const dateValidations: Record<DateFormat, DateValidation> = {
  "MM/DD/YYYY": dateValidation_MM_DD_YYYY,
  "Month D, YYYY": dateValidation_Month_D_YYYY,
  "DD/MM/YYYY": dateValidation_DD_MM_YYYY,
  "DD Month YYYY": dateValidation_DD_MMMM_YYYY,
  "YYYY/MM/DD": dateValidation_YYYY_MM_DD,
};

export const signatureValidation = {
  required: "Signature is required",
  pattern: {
    value: /^data:image\/(?:gif|png|jpeg|bmp|webp|svg\+xml)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/,
    message: "Signature must be png",
  },
};

export const nameValidation = {
  required: "Name is required",
  minLength: {
    value: 2,
    message: "Name must be at least two character long",
  },
  maxLength: {
    value: 50,
    message: "Name cannot be longer than 50 characters",
  },
};

export const phoneValidation = {
  required: "Phone number is required",
  pattern: {
    value: /^\d{10}$/,
    message: "Please enter a valid phone number",
  },
};

export const pngSignature = {
  required: "A signature is required",
  minLength: {
    value: 1400,
    message: "Signature not detailed enough",
  },
  maxLength: {
    value: 69000,
    message: "Signature too complex",
  },
};

export const hexColorValidation = {
  required: "Color is required",
  pattern: {
    value: /^#?([0-9A-F]{6})([0-9A-F]{2})?$/i,
    message: "Please enter a valid hex color (e.g., #FAFAFA)",
  },
};

//The number of actions someone can be given authorization to do
export const maxNumActionsValidation: RegisterOptions = {
  required: "Number of actions is required",
  min: {
    value: 1,
    message: "Number of actions must be at least 1",
  },
  max: {
    value: 5,
    message: "Number of actions cannot be greater than 5",
  },
};

//The maximum expiry date for a user's authorization, cannot be more than 36 hours from now
export const maxExpiryDateValidation: RegisterOptions<any, "expiryDate"> = {
  required: "Expiry date is required",
  validate: {
    futureDate: (value: Date | string) => {
      const dateValue = value instanceof Date ? value : new Date(value);
      const now = new Date();
      return dateValue > now || "Expiry date must be in the future";
    },
    maxDate: (value: Date | string) => {
      const dateValue = value instanceof Date ? value : new Date(value);
      const maxDate = new Date(Date.now() + 36 * 60 * 60 * 1000);
      return dateValue <= maxDate || "Expiry date cannot be more than 36 hours from now";
    },
  },
};

export const processValidateDatabaseFields = (fields: Record<string, any>, userOffice?: any, validationRules?: Record<string, any>) => {
  let processedFields = { ...fields };

  Object.entries(processedFields).forEach(([key, value]) => {
    // Check if the key includes 'email'
    if (key.toLowerCase().includes("email")) {
      // Convert value to lowercase if it's a string
      processedFields[key] = typeof value === "string" ? value.toLowerCase() : value;
    }
    // Check if the key includes 'email'
    if (key.toLowerCase().includes("phone")) {
      // remove all non-numeric characters and spaces
      processedFields[key] = value.replace(preSavePhoneRegex, "");
    }

    //is it a date object in the expected format?
    if (key.toLowerCase().includes("date") && key !== "dateFormat") {
      if (typeof value === "string") {
        // Convert the dob string to a Date object
        processedFields[key] = getDateFromDateStringFormat(value, userOffice?.dateFormat);
      }
    }

    // Add additional validation based on validationRules if required
    // ...
  });

  return processedFields;
};
