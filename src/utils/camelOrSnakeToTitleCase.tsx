import { addSpaceAfterNumbers, addSpaceBeforeNumbers } from "./stringManipulation";

// Function overloads
export default function camelOrSnakeToTitleCase(str: string, underscoreReplacement?: string, hyphenReplacement?: string): string;
export default function camelOrSnakeToTitleCase(str: string[], underscoreReplacement?: string, hyphenReplacement?: string): string[];
// Take a string or array of strings in camelCase or snake_case and convert to title case
export default function camelOrSnakeToTitleCase(
  str: string | string[],
  underscoreReplacement: string = " ",
  hyphenReplacement: string = " "
): string | string[] {
  if (!str) return str;
  if (Array.isArray(str)) {
    return str.map((s) => camelOrSnakeToTitleCase(s) as string);
  }

  // Replace underscores with a space or custom replacement
  str = str.replace(/_/g, underscoreReplacement); // Replace each underscore with a space

  // Replace hyphens with a space or custom replacement
  str = str.replace(/-/g, hyphenReplacement); // Replace each hyphen with a space

  //addSpaceBeforeCapitalLetters and open brackets, unless first letter or preceded by an open bracket
  str = str.replace(/(?<![ ])(?<!^)(?<![(])(?=[A-Z({\[])/g, " ");

  //remove spaces between singular letters
  str = str.replace(/(?<=\b[A-Z])\s(?=[A-Z]\b)/g, "");

  str = addSpaceBeforeNumbers(str);

  str = addSpaceAfterNumbers(str);

  // Capitalize the first letter of each word
  str = str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return str;
}

export function removeSpaces(str: string): string;
export function removeSpaces(str: string[]): string[];
export function removeSpaces(str: string | string[] | undefined): string | string[] {
  if (!str) return "";
  if (typeof str === "string") {
    // Remove spaces from a single string
    return str.replace(/\s+/g, "");
  } else {
    // Remove spaces from each string in the array
    return str.map((s) => s.replace(/\s+/g, ""));
  }
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
