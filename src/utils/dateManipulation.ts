import { ValidationValueMessage } from "react-hook-form";
import { combineRegexPatterns } from "./regex";
import { hasWhiteSpace, stringHasOnlyDigits, stringIsDigit } from "./stringManipulation";

export const isDate = (obj: any) => {
  return obj instanceof Date && Object.prototype.toString.call(obj) === "[object Date]";
};

export const getDateStringMMDDYYYY = (date: Date | string | undefined): string => {
  if (!date) {
    return "";
  }
  if (typeof date === "string") {
    try {
      date = new Date(date);
    } catch (e) {
      return getDateStringMMDDYYYY(new Date());
    }
  }
  if (!isDate(date)) {
    return getDateStringMMDDYYYY(new Date());
  }
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export const getDateFromMongoDBObjectId = (objectId: string | any): Date => {
  const timestamp = objectId.toString().substring(0, 8);
  return new Date(parseInt(timestamp, 16) * 1000);
};

export const getTimestampSeconds = (): number => {
  return Math.floor(new Date().getTime() / 1000);
};

export const isRecent = (timestamp: number, interval = 1000 * 60 * 30) => {
  const timeDiff = Date.now() - timestamp;
  return timeDiff < interval;
};

//timestamp is in past 30 minutes
export const isRecentSeconds = (timestamp: number, interval = 60 * 30) => {
  return isRecent(timestamp * 1000, interval * 1000);
};

export function getApproxTimeFromPrimeMeridian(long: number | string, roundToNearestHour: boolean = false): Date {
  let longNum: number | null = null;

  //convert a lat,long string like "44,-77" to a -77 as a num.
  if (typeof long === "string") {
    if (long.includes(",")) {
      //split the string into two numbers
      const [lat, longTemp] = long.split(",");
      //Strip all characters from the longTemp string except for digits and decimal point
      const longTempStripped = longTemp.replace(/[^0-9.]/g, "");
      longNum = parseFloat(longTempStripped);
    } else {
      //Strip all characters from the long string except for digits and decimal point-
      const longStripped = long.replace(/[^0-9.]/g, "");
      longNum = parseFloat(longStripped);
    }
  } else if (typeof long === "number") {
    longNum = long;
  }

  if (typeof longNum !== "number") return new Date();

  // Get current London time
  const londonTime = new Date();

  // Calculate hours offset from longitude
  // Earth rotates 360° in 24 hours, so 15° = 1 hour
  let hoursOffset = longNum / 15;

  // Round to nearest hour if requested
  if (roundToNearestHour) {
    hoursOffset = Math.round(hoursOffset);
  }

  // Add the offset in milliseconds to London time
  const offsetMilliseconds = hoursOffset * 60 * 60 * 1000;
  const approximateTime = new Date(londonTime.getTime() + offsetMilliseconds);

  return approximateTime;
}

// Add validation helper function
export const isValidDate = (date: Date | undefined): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

//for using at the end of a statment like "your authorization to complete the next {N} actions ____"
export function dateToFriendlyTimeFromNow(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Under 1 hour
  if (diffMinutes < 60) {
    return `within ${diffMinutes} minutes`;
  }

  // Under 1 day
  if (diffHours < 24) {
    return `within ${diffHours} hours`;
  }

  // Under 1 week
  if (diffDays < 7) {
    return `within ${diffDays} days`;
  }

  // Format the date
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  // Add appropriate suffix to day number
  const dayWithSuffix = day + (day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th");

  // Under a year - return "by Month Day"
  if (year === currentYear) {
    return `by ${month} ${dayWithSuffix}`;
  }

  // Over a year - include the year
  return `by ${month} ${dayWithSuffix}, ${year}`;
}

export function dateToFriendlyString(date?: Date): string {
  // Use the provided date or default to "now"
  const d = date ?? new Date();

  // Extract short timezone name by using toLocaleTimeString
  // and splitting off the last "word"
  const shortTimeZone =
    d
      .toLocaleTimeString("en-US", {
        timeZoneName: "short",
        hour12: true,
      })
      .split(" ")
      .pop() ?? "";

  // Convert hours/minutes to a 12-hour clock
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const isPM = hours >= 12;
  const hour12 = hours % 12 || 12; // 0 => 12
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  const ampm = isPM ? "PM" : "AM";

  // If no date was passed in, we say "Today"
  // Otherwise we use the day of the week, e.g. "Thursday"
  if (!date) {
    // Format: "Today, 3:45 PM PDT"
    return `Today, ${hour12}:${mm} ${ampm} ${shortTimeZone}`;
  } else {
    // Get day name (long form)
    const weekday = d.toLocaleString("en-US", { weekday: "long" });
    // Format: "Thursday, 3:45 PM PDT"
    return `${weekday}, ${hour12}:${mm} ${ampm} ${shortTimeZone}`;
  }
}

function getMonthNames(locale: string | string[] | undefined, format: "long" | "short" | "narrow"): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format });
  const months: string[] = [];
  // Loop through months (0-11)
  for (let i = 0; i < 12; i++) {
    // Create a date for the first day of each month
    // Year and day don't matter, only the month index (i)
    const date = new Date(2000, i, 1);
    months.push(formatter.format(date));
  }
  return months;
}

export type DateFormat = "MM/DD/YYYY" | "Month D, YYYY" | "DD/MM/YYYY" | "DD Month YYYY" | "YYYY/MM/DD";
export const dateFormats: DateFormat[] = ["MM/DD/YYYY", "Month D, YYYY", "DD/MM/YYYY", "DD Month YYYY", "YYYY/MM/DD"];
export const fallbackDefaultDateFormat: DateFormat = "MM/DD/YYYY";
export const defaultDateFormat: DateFormat = (() => {
  const envFormat = process.env.StringDateFormat as DateFormat;
  if (envFormat && dateFormats.includes(envFormat)) {
    return envFormat;
  } else {
    if (!envFormat) {
      console.log("process.env.StringDateFormat is not set. Defaulting to MM/DD/YYYY.");
    } else {
      console.log(`process.env.StringDateFormat ('${envFormat}') is not a valid format. Defaulting to MM/DD/YYYY.`);
    }
    return fallbackDefaultDateFormat;
  }
})();

export type DateValidation = {
  pattern: ValidationValueMessage<RegExp>;
};

export const dateFormatValidations: Record<DateFormat, RegExp> = {
  //1-2 digits for month, 1-2 digits for day, 2 or 4 digits for year
  "MM/DD/YYYY": /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  //Month is a full month name or 3 letter abbreviation in any case, 1-2 digits for day, 2 or 4 digits for year. The comma is optional.
  "Month D, YYYY":
    /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}(,)? \d{2,4}$/,
  //1-2 digits for day, 1-2 digits for month, 2 or 4 digits for year
  "DD/MM/YYYY": /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  //1-2 digits for day, month is a full month name, 2 or 4 digits for year. The comma is optional.
  "DD Month YYYY": /^\d{1,2} [A-Za-z]+ \d{2,4}$/,
  //2 or 4 digits for year, 1-2 digits for month, 1-2 digits for day
  "YYYY/MM/DD": /^\d{2,4}\/\d{1,2}\/\d{1,2}$/,
};

export const anyDateValidation = {
  pattern: {
    value: combineRegexPatterns(
      Object.values(dateFormatValidations)
        .map((v: RegExp) => v)
        .filter((v) => v !== undefined)
    ),
    message: "Please enter a valid date, such as " + defaultDateFormat,
  },
};

//export type DateFormat = (typeof dateFormats)[number];

export const englishLongMonths = getMonthNames("en-US", "long");
export const englishShortMonths = getMonthNames("en-US", "short");
export const englishNarrowMonths = getMonthNames("en-US", "narrow");

const yearFormatTypes: Intl.DateTimeFormatOptions["year"][] = ["numeric", "2-digit"];
const monthFormatTypes: Intl.DateTimeFormatOptions["month"][] = ["numeric", "2-digit", "long", "short", "narrow"];
const dayFormatTypes: Intl.DateTimeFormatOptions["day"][] = ["numeric", "2-digit"];

// Regex to specifically match YYYY-MM-DDTHH:mm:ss.sssZ format
export const isoStringRegex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}Z$/;

export type LocaleDateStringFormatObj = {
  year: Intl.DateTimeFormatOptions["year"];
  month: Intl.DateTimeFormatOptions["month"];
  day: Intl.DateTimeFormatOptions["day"];
};

/**
 * A type guard to check if a string is a valid DateFormat.
 * @param format The value to check.
 * @returns `true` if the value is a valid DateFormat, otherwise `false`.
 */
export const isDateFormat = (format: string | DateFormat | null | undefined): format is DateFormat => {
  return typeof format === "string" && (dateFormats as readonly string[]).includes(format);
};

/*
 * Converts a date format string to a locale date string format object, with keys that are typed using the Intl.DateTimeFormatOptions type
 *
 * @param format - The date format string to convert
 * @returns A LocaleDateStringFormatObj object with the year, month, and day format types
 */
export const dateFormatToLocaleDateStringFormatObj = (format: DateFormat = defaultDateFormat): LocaleDateStringFormatObj => {
  let year: Intl.DateTimeFormatOptions["year"] = undefined;
  let month: Intl.DateTimeFormatOptions["month"] = undefined;
  let day: Intl.DateTimeFormatOptions["day"] = undefined;
  let order: ("Y" | "M" | "D")[] = [];
  // Determine year format based on YYYY or YY
  if (format.includes("Y")) {
    //if number of Y's is 2 and only 2 Y's, then it's a 2-digit year
    if (format.match(/Y/g)?.length === 2) {
      year = "2-digit";
    } else {
      year = "numeric";
    }
  }

  // Determine month format (longest match first)
  const numM = format.toLowerCase().match(/m/g)?.length ?? 0;
  if (numM > 0) {
    if (numM === 4 || format.toLowerCase().includes("month")) {
      month = "long"; // "long" for spelled-out month
    } else if (numM === 3) {
      month = "short"; // "short" for 3-letter month
    } else if (numM === 2) {
      month = "2-digit"; // "2-digit" for MM
    } else {
      // 1 m, or many m's
      if (format.includes("m")) {
        month = "narrow"; // "narrow" for m (lowercase)
      } else {
        month = "numeric"; // "numeric" for M or many M's
      }
    }
  }

  // Determine day format (DD first)
  if (format.includes("DD")) {
    day = "2-digit"; // "2-digit" for DD
  } else if (format.includes("D")) {
    day = "numeric"; // "numeric" for D
  }

  return {
    year,
    month,
    day,
  };
};

export const dateComponentCompliantWithFormat = (
  component: string,
  formatType: Intl.DateTimeFormatOptions["year"] | Intl.DateTimeFormatOptions["month"] | Intl.DateTimeFormatOptions["day"]
): boolean => {
  if (formatType === "numeric" || formatType === "2-digit") {
    return stringIsDigit(component) && component.length >= 1 && component.length <= 4;
  } else if (formatType === "long" || formatType === "short" || formatType === "narrow") {
    return englishLongMonths.includes(component) || englishShortMonths.includes(component) || englishNarrowMonths.includes(component);
  }
  return false;
};

export const getDateFormatOrder = (format: DateFormat): ("Y" | "M" | "D")[] => {
  const components: { component: "Y" | "M" | "D"; index: number }[] = [];
  const upperFormat = format.toUpperCase(); // Use uppercase for case-insensitive matching

  const yIndex = upperFormat.indexOf("Y");
  const mIndex = upperFormat.indexOf("M");
  const dIndex = upperFormat.indexOf("D");

  if (yIndex !== -1) {
    components.push({ component: "Y", index: yIndex });
  }
  if (mIndex !== -1) {
    components.push({ component: "M", index: mIndex });
  }
  if (dIndex !== -1) {
    components.push({ component: "D", index: dIndex });
  }

  // Sort components by their first appearance index
  components.sort((a, b) => a.index - b.index);

  // Return only the component letters in order
  return components.map((comp) => comp.component);
};

export const getCurrentYearFrom2DigitYearAndCentury = (digits: string): number => {
  //If the year is 2 digits, then it's the current year + the year
  const currentYear = new Date().getFullYear(); // e.g., 2024
  const century = Math.floor(currentYear / 100); // e.g., 20
  const twoDigitYear = parseInt(digits, 10); // e.g., 24

  // Combine century and two-digit year
  // e.g., 20 * 100 + 24 = 2024
  const fullYear = century * 100 + twoDigitYear;

  return fullYear;
};

export const convertStringToDate = (date: string): Date | undefined => {
  try {
    const result = new Date(date);
    // Check if the date is valid
    if (isNaN(result.getTime())) {
      // The date string could not be parsed correctly
      return undefined;
    }
    // Date is valid
    return result;
  } catch (e) {
    // This catch block might not be strictly necessary for parsing errors,
    // as new Date() usually returns Invalid Date instead of throwing.
    // However, it could catch other unexpected errors.
    //console.error("Error creating date:", e);
    return undefined;
  }
};

// Convert a date to a string in the format specified by the format parameter
export const getStringDateFormatFromDate = (date: Date | string | undefined, format: DateFormat | null | string = defaultDateFormat): string => {
  if (!date) {
    return "";
  }

  if (!format || !isDateFormat(format)) {
    format = defaultDateFormat;
  }

  //already a stringified date?
  if (typeof date === "string") {
    const convertsToDate = convertStringToDate(date);
    if (convertsToDate) {
      //Date is in ISO format, so we need to convert it to a date object
      date = convertsToDate;
    } else if (stringHasOnlyDigits(date)) {
      //Date is a number, so we need to convert it to a date object
      date = new Date(parseInt(date));
    } else {
      //test against date regex pattern
      const dateRegexPattern = dateFormatValidations[format as DateFormat];
      if (dateRegexPattern.test(date)) {
        //already in the correct format
      } else {
        //not in the correct format, so we need (TODO) to convert it
        console.error("Invalid date format");
      }
      return date;
    }
    //Let the date continue to be a formatted into the correct string format
  }
  const formatLocaleObj = dateFormatToLocaleDateStringFormatObj(format as DateFormat);

  const newDateString =
    date?.toLocaleDateString(undefined, {
      ...formatLocaleObj,
    }) ?? "";

  return newDateString;
};

export function ISODateToHumanReadable(isoDate?: string | Date, onlyTime = false, format: DateFormat = defaultDateFormat): string {
  let date;

  if (typeof isoDate === "string") {
    date = new Date(isoDate);
  } else if (isoDate instanceof Date) {
    date = isoDate;
  } else {
    date = new Date();
  }

  let options: Intl.DateTimeFormatOptions = dateFormatToLocaleDateStringFormatObj(format);

  if (onlyTime) {
    options = {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    };
    return date.toLocaleTimeString("en-US", options);
  }

  const dateString = date.toLocaleDateString("en-US", options);
  const timeString = date.toLocaleTimeString("en-US");

  return `${dateString}, ${timeString}`;
}

// Convert a date string to a regular date object
export const getDateFromDateStringFormat = (
  dateString?: string | Date,
  format: DateFormat = defaultDateFormat,
  strictMatch: boolean = format === defaultDateFormat
): Date | undefined => {
  // getting dateString.split is not a function error

  if (!dateString) {
    return undefined;
  }

  if (typeof dateString === "string") {
    dateString = dateString.trim();
    //Is the string a utc date string? Ex: 2025-07-22T11:00:00.000Z
    if (!hasWhiteSpace(dateString) && dateString.includes("T") && dateString.endsWith("Z")) {
      //Check if it is a stringify-able date
      const dateStringStringified = convertStringToDate(dateString);
      if (dateStringStringified) return dateStringStringified;
    }
  }

  //already a date object?
  if (typeof dateString === "object" && dateString instanceof Date) {
    return dateString;
  }

  const resultDate: Date = new Date();
  if (dateFormats.includes(format)) {
    //Get the format object
    const formatLocaleObj = dateFormatToLocaleDateStringFormatObj(format);
    //Get the order of the format
    const order = getDateFormatOrder(format);
    //parse the date string, and get the components
    let dateStringComponents: string[] = [];

    dateStringComponents = dateString.split(/[\\/,\s]+/);

    if (!dateStringComponents || dateStringComponents.length !== order.length) {
      return undefined;
    }

    //Loop over the order, get the date string for each component
    for (let i = 0; i < order.length; i++) {
      const component = order[i];
      if (component === "Y") {
        //Check if component matches expected format
        if (strictMatch && !dateComponentCompliantWithFormat(dateStringComponents[i], formatLocaleObj.year)) return undefined;

        //If the year is 2 digits, then it's the current year + the year
        if (dateStringComponents[i].length <= 2) {
          // Year is a number
          resultDate.setFullYear(getCurrentYearFrom2DigitYearAndCentury(dateStringComponents[i]));
        } else if (dateStringComponents[i].length === 4) {
          // Year is a full year
          resultDate.setFullYear(parseInt(dateStringComponents[i]));
        } else {
          //Invalid year format
          return undefined;
        }
      } else if (component === "M") {
        //Check if component matches expected format
        if (strictMatch && !dateComponentCompliantWithFormat(dateStringComponents[i], formatLocaleObj.month)) return undefined;

        //If month is a digit or two digits, then it's the month
        if (stringIsDigit(dateStringComponents[i]) && (dateStringComponents[i].length === 1 || dateStringComponents[i].length === 2)) {
          // Month is a number
          resultDate.setMonth(parseInt(dateStringComponents[i]));
        } else if (englishLongMonths.includes(dateStringComponents[i])) {
          // Month is a full month name
          resultDate.setMonth(englishLongMonths.indexOf(dateStringComponents[i]));
        } else {
          //Check if it's a partial match of a month
          const partialMatch = englishLongMonths.find((month) => month.toLowerCase().startsWith(dateStringComponents[i].toLowerCase()));
          if (partialMatch) {
            // Month is a partial match of a month
            resultDate.setMonth(englishLongMonths.indexOf(partialMatch));
          } else {
            //Invalid month format
            return undefined;
          }
        }
      } else if (component === "D") {
        //Check if component matches expected format
        if (strictMatch && !dateComponentCompliantWithFormat(dateStringComponents[i], formatLocaleObj.day)) return undefined;

        if (stringIsDigit(dateStringComponents[i]) && (dateStringComponents[i].length === 1 || dateStringComponents[i].length === 2)) {
          resultDate.setDate(parseInt(dateStringComponents[i]));
        } else {
          //Invalid day format
          return undefined;
        }
      }
    }
    //Set hours to start of day so conversion to UTC is consistent
    resultDate.setHours(0, 0, 0, 0);
    // Set time to 6:00 AM UTC-5 (11:00 UTC). This time allows every major timezone to have the same date.
    resultDate.setUTCHours(11, 0, 0, 0);

    return resultDate;
  }
  console.error("Invalid date format");

  return undefined;
};
