import { emailRegex } from '../lib/validations/email';
import camelOrSnakeToTitleCaseUnderscore from "./camelOrSnakeToTitleCaseUnderscore";
import { getVersionSuffixHumanReadable } from "./formVersionNaming";
import { ensureGlobalFlag, isValidRegexString, stringToRegex } from "./regex";

export const getNameInitials = (firstName?: string, lastName?: string): string => {
  const firstInitial = firstName ? firstName.charAt(0) : "";
  const lastInitial = lastName ? lastName.charAt(0) : "";
  return firstInitial + lastInitial;
};

export function getFullName(user: Record<string, any>): string | undefined {
  let fullName = "";
  if (user.firstName) fullName += user.firstName;
  if (user.lastName) fullName += fullName.length > 0 ? " " + user.lastName : user.lastName;
  if (fullName) return fullName;
  else return undefined;
}

export const toBoolean = (any: any): boolean => {
  if (!any) return false;
  if (typeof any === "object" && !Array.isArray(any)) {
    if (any.hasOwnProperty("value")) return toBoolean(any.value);
  }
  if (typeof any === "boolean") return any;
  if (typeof any === "string") {
    //check if the string is a boolean string
    if (any.toLowerCase() === "true") return true;
    if (any.toLowerCase() === "false") return false;
    if (any === "1") return true;
    if (any === "0") return false;
  }
  if (typeof any === "number") {
    if (any === 1) return true;
    if (any === 0) return false;
  }
  return false;
};

export const getFriendlyGreeting = (localTime?: Date): string => {
  const now = localTime ?? new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  const day = now.getDate();

  // Determine the time of day
  let timeOfDayGreeting = "";
  if (hour < 4) timeOfDayGreeting = "good evening,";
  else if (hour < 12) timeOfDayGreeting = "good morning,";
  else if (hour < 18) timeOfDayGreeting = "good afternoon,";
  else timeOfDayGreeting = "good evening,";

  // Check for special dates
  if (month === 0 && day === 1) return timeOfDayGreeting + " and happy new year!";
  if (month === 5 && day === 21) return timeOfDayGreeting + " and happy summer solstice!";
  if (month === 11 && day === 21) return timeOfDayGreeting + " and happy winter solstice!";

  // Placeholder for Martian New Year, which requires a more complex calculation
  // For simplicity, it's not included here

  return timeOfDayGreeting;
};

export function appendTwoStringsSolvePunctuation(firstString: string, secondString: string): string {
  // Check if the first string is empty
  if (!firstString) return capitalizeFirstChar(secondString);

  // Check if the second string is empty
  if (!secondString) return capitalizeFirstChar(firstString);

  firstString = capitalizeFirstChar(firstString);
  secondString = capitalizeFirstChar(secondString);

  // Check if the first string ends with a punctuation mark
  if (/[.!?]$/.test(firstString)) return firstString + " " + secondString;

  // Check if the second string starts with a punctuation mark
  if (/^[.!?]/.test(secondString)) return firstString + secondString;

  // If no punctuation marks are present, add a space between the strings
  return firstString + " " + secondString;
}

export function isPunctuationMark(char: string): boolean {
  return [".", ",", "!", "?", ":", ";"].includes(char);
}

export const removeLeadingWhitespace = (text: string): string => {
  if (!text) return "";
  return text.toString().replace(/^\s+/g, "").replace(/^\n+/g, "");
};

export const removeTrailingWhitespace = (text: string): string => {
  if (!text) return "";
  return text.toString().replace(/\s+$/g, "").replace(/\n+$/g, "");
};

export const removeLeadingAndTrailingWhiteSpace = (text: string): string => {
  return removeLeadingWhitespace(removeTrailingWhitespace(text));
};

export const removeLeadingAndTrailingBrackets = (text: string): string => {
  //remove leading and trailing bracket if any
  if (text.startsWith("(") || text.startsWith("{")) {
    text = text.slice(1);
  }
  if (text.endsWith(")") || text.endsWith("}")) {
    text = text.slice(0, -1);
  }
  return text;
};

//start from end of string and work backward, return first char that does not match the regex
export const lastNonRegexChar = (text: string, regex: RegExp): string => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (!regex.test(text[i])) {
      return text[i];
    }
  }
  return "";
};

//start from end of string and work backward, return text with the last char that does not match the regex removed
export const removeLastNonRegexChar = (text: string, regex: RegExp): string => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (!regex.test(text[i])) {
      //only remove char at this index
      return text.slice(0, i) + text.slice(i + 1);
    }
  }
  return text;
};

export const isWrappedInQuotes = (text: string, quotesToMatch: string | string[] = ['"']): boolean => {
  quotesToMatch = Array.isArray(quotesToMatch) ? quotesToMatch : [quotesToMatch];
  // Check if the text is wrapped in quotes
  return quotesToMatch.some((quote) => text.startsWith(quote) && text.endsWith(quote));
};

export const wrapInQuotes = (text: string, quote: string = '"'): string => {
  return quote + text + quote;
};

export const removeMatchingSurroundingQuotes = (text: string): string => {
  //remove single, double, backticks, or any other quotes from the start and end of the string
  //But only if the quotes are the same at the start and end, and at both start and end
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  if (text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1);
  }
  if (text.startsWith("`") && text.endsWith("`")) {
    return text.slice(1, -1);
  }
  return text;
};

export const startsWithGreetings = (text: string): boolean => {
  return /^hello|hi|hey|good morning|good afternoon|good evening|Dear|dear/i.test(text);
};

export const replaceStringSurroundedByWith = (
  text: string,
  surroundedBySymbols: string[],
  replacement: string,
  limit?: number, // optional limit parameter for the number of replacements
  retainSymbols: boolean = true
): string => {
  const [startSymbol, endSymbol] = surroundedBySymbols;

  // Adjust regex based on whether to retain symbols
  const regex = retainSymbols ? new RegExp(`(${startSymbol})(.*?)((${endSymbol}))`, "g") : new RegExp(`${startSymbol}(.*?)${endSymbol}`, "g");

  // If limit is not defined, replace all occurrences
  if (limit === undefined) {
    return text.replace(regex, (_, prefix, matchedContent, suffix) => (retainSymbols ? `${prefix}${replacement}${suffix}` : replacement));
  }

  // If limit is defined, replace only up to `limit` occurrences
  let matchCount = 0;
  return text.replace(regex, (match, prefix, matchedContent, suffix) => {
    matchCount++;
    if (matchCount > limit) return match;

    // Return replacement with or without symbols
    return retainSymbols ? `${prefix}${replacement}${suffix}` : replacement;
  });
};

//This is known as a Levenshtein distance algorithm
export const isWithinCharacterDistance = (text1: string, text2: string, maxDistance: number): boolean => {
  if (maxDistance === 0) return text1 === text2;

  // Create a 2D array to store the distances
  const distances: number[][] = [];

  // Initialize the first row and column with the index
  for (let i = 0; i <= text1.length; i++) {
    distances[i] = [i];
  }
  for (let j = 0; j <= text2.length; j++) {
    distances[0][j] = j;
  }

  // Calculate the distances
  for (let i = 1; i <= text1.length; i++) {
    for (let j = 1; j <= text2.length; j++) {
      // Calculate the cost of substitution
      const cost = text1[i - 1] === text2[j - 1] ? 0 : 1;

      // Calculate the minimum distance
      distances[i][j] = Math.min(
        distances[i - 1][j] + 1, // Deletion
        distances[i][j - 1] + 1, // Insertion
        distances[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  // Return whether the distance is within the maximum
  return distances[text1.length][text2.length] <= maxDistance;
};

export const stringSimilarToElementInArray = (text: string, array: string[], maxDistance: number, compareCase: boolean = true): boolean => {
  if (!compareCase) {
    text = text.toLowerCase();
    array = array.map((element) => element.toLowerCase());
  }

  return array.some((element) => isWithinCharacterDistance(text, element, maxDistance));
};

export const getLengthDifference = (text1: string, text2: string): number => {
  return Math.abs(text1.length - text2.length);
};

export const removeAllMatches = (text: string, regex: RegExp) => {
  return text.replace(regex, "");
};

export const replaceString = (mainString: string, searchString: string, replaceString: string) => {
  return mainString.replace(new RegExp(searchString, "g"), replaceString);
};

export const arrayElemInString = (strArray: string[], string: string, caseSensitive = false): boolean => {
  if (caseSensitive) {
    return strArray.some((word) => string.includes(word));
  }
  return strArray.some((word) => string.toLowerCase().includes(word.toLowerCase()));
};

export const keywordInArray = (strArray: string[], key: string): boolean => {
  return strArray.some((str) => str.toLowerCase().includes(key.toLowerCase()));
};

export const containsOnlyNewlinesAndSpaces = (str?: string): boolean => {
  if (!str) return true;
  // This regex matches strings that contain only spaces, newlines, or a combination of both
  return /^[\n\s]*$/.test(str);
};

export const isStartOfSentence = (text: string, index: number) => {
  // Check if the index is at the start or after a period, exclamation, or question mark (with an optional space)
  const textBeforeIndex = text.slice(Math.max(0, index - 2), index);
  const isStart = index === 0 || /[\.\?\!]\s?/.test(textBeforeIndex);
  return isStart;
};

export const isStartOfHeading = (text: string, index: number) => {
  //Check if the first non-whitespace character preceding the index is an opening punctuation mark
  const openingPunctuation = ["(", "[", "{", '"', "'", ":", ".", "?", "!", "—"];
  //from index to the start of the string, check if the first non-whitespace character found is an opening punctuation mark
  let numNewlines = 0;
  for (let i = index; i >= 0; i--) {
    //ignore curly braces
    if (openingPunctuation.includes(text[i])) {
      return true;
    }
    //if we find a non-whitespace character, return false
    if (!stringIsWhitespace(text[i])) {
      return false;
    }
    //if we find a newline, increment the counter, consider a heading if there is atleast 2 newlines
    if (text[i] === "\n") {
      numNewlines++;
      if (numNewlines > 1) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Get the word starting with the startString
 * @param text - The text to search in
 * @param startString - The string to start with
 * @returns The word starting with the startString
 */
export function getWordStartingWith(text?: string, startString?: string): string | undefined {
  if (!text || !startString) return undefined;

  const startIndex = text.indexOf(startString);
  if (startIndex === -1) return undefined;

  // Find the first space after the start index
  const spaceIndex = text.indexOf(" ", startIndex);

  // If no space found, return from startIndex to end
  if (spaceIndex === -1) {
    return text.substring(startIndex);
  }

  // Return from startIndex to space (not inclusive)
  return text.substring(startIndex, spaceIndex);
}

export const isAcronym = (string: string, maxLength?: number) => {
  //trim leading and trailing whitespace
  string = string.trim();
  if (string.length < 2 || string.includes(" ") || (maxLength && string.length > maxLength)) return false;
  //an acronym is a string that is all uppercase and has no spaces, or a string that is all uppercase with periods between the uppercase letters
  return string === string.toUpperCase() || string.split(".").every((word) => word === word.toUpperCase());
};

export const getStringVariantsWithoutArrayElements = (text: string, arr: string[]): string[] => {
  const result: string[] = [];

  arr.forEach((substring) => {
    if (text.includes(substring)) {
      // Remove the substring from the key (all occurrences)
      const newKey = text.replace(new RegExp(substring, "g"), "");
      // Clean up extra spaces and trim
      const cleanedKey = newKey.replace(/\s{2,}/g, " ").trim();
      result.push(cleanedKey);
    }
  });

  return result;
};

export function generateAllKeyVariationsByRemovingSubstrings(
  key: string,
  substrings: string[],
  allCombinations: boolean = true,
  maxVariations?: number
): string[] {
  if (!allCombinations) {
    maxVariations = undefined;
  }
  // Generate the options for each substring (0: do not remove, 1: remove first, 2: remove all)
  const options = ["0", "1", "2", "3"];
  const optionsPerSubstring = substrings.map(() => options);

  // Generate all possible combinations of options
  const combinations = allCombinations ? cartesianProduct(optionsPerSubstring) : options;

  const resultSet: Set<string> = new Set();

  let count = 0;

  combinations.forEach((combination) => {
    //Each combination represents one unique way to apply the substring removal options to the original key.
    let modifiedKey = key;
    count++;
    if (maxVariations && count > maxVariations) {
      return Array.from(resultSet);
    }

    // Apply each option to the corresponding substring
    substrings.forEach((substring, index) => {
      const option = allCombinations ? combination[index] : combination;
      modifiedKey = allCombinations ? modifiedKey : key;
      if (option === "0") {
        // Do not remove the substring
      }
      if (option === "1") {
        // Remove only the first instance
        modifiedKey = removeFirstInstance(modifiedKey, substring, true);
      } else if (option === "2") {
        // Remove all instances
        modifiedKey = removeAllInstances(modifiedKey, substring, true);
      } else if (option === "3") {
        // Remove last instance
        modifiedKey = removeLastInstance(modifiedKey, substring, true);
      }
      if (!allCombinations) {
        resultSet.add(modifiedKey);
      }
    });

    if (allCombinations) {
      // Clean up extra spaces and trim
      modifiedKey = modifiedKey.replace(/\s{2,}/g, " ").trim();
      // Add the modified key to the result set
      resultSet.add(modifiedKey);
    }
  });

  // Convert the result set to an array
  return Array.from(resultSet);
}

// Helper function to remove only the first instance of a substring
function removeFirstInstance(str: string, substring: string, caseInsensitive?: boolean) {
  if (caseInsensitive) return removeFirstInstanceCaseInsensitive(str, substring);
  return str.replace(substring, "");
}

function removeLastInstance(str: string, substring: string, caseInsensitive?: boolean) {
  if (caseInsensitive) return removeLastInstanceCaseInsensitive(str, substring);
  return str.slice(0, str.lastIndexOf(substring)) + str.slice(str.lastIndexOf(substring) + substring.length);
}

// Helper function to remove all instances of a substring
function removeAllInstances(str: string, substring: string, caseInsensitive?: boolean) {
  if (caseInsensitive) return removeAllInstancesCaseInsensitive(str, substring);
  return str.split(substring).join("");
}

// Helper function to remove only the first instance of a substring (case-insensitive)
function removeFirstInstanceCaseInsensitive(str: string, substring: string): string {
  if (!substring) {
    return str;
  }
  const escapedSubstring = substring.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedSubstring, "i");
  return str.replace(regex, "");
}

// Helper function to remove only the last instance of a substring (case-insensitive)
function removeLastInstanceCaseInsensitive(str: string, substring: string): string {
  if (!substring) {
    return str;
  }
  const lowerStr = str.toLowerCase();
  const lowerSubstring = substring.toLowerCase();
  const index = lowerStr.lastIndexOf(lowerSubstring);
  if (index === -1) {
    return str; // Substring not found
  }
  return str.slice(0, index) + str.slice(index + substring.length);
}

// Helper function to remove all instances of a substring (case-insensitive)
function removeAllInstancesCaseInsensitive(str: string, substring: string): string {
  if (!substring) {
    return str;
  }
  const escapedSubstring = substring.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedSubstring, "gi");
  return str.replace(regex, "");
}

export const escapeHTML = (htmlString: string) => {
  return htmlString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// Helper function to compute the cartesian product of arrays
function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce(
    (accumulator: any[][], currentValue: string[]) => {
      const temp: any[] = [];
      accumulator.forEach((a) => {
        currentValue.forEach((b) => {
          temp.push(a.concat([b]));
        });
      });
      return temp;
    },
    [[]]
  );
}

export const numOccurences = (text: string, substring: string): number => {
  return text.split(substring).length - 1;
};

//take a string array and return an array of coded shortforms for each string, each array is guaranteed to have the same length, longforms never have null values
export const spliceStringArrayShortForm = (textArray: string[]): { shortForms: (string | null)[]; longForms: string[] } => {
  const shortForms: (string | null)[] = [];
  const longForms: string[] = [];

  textArray.forEach((text) => {
    const match = text.match(/<([^>]+)>/); // Regular expression to find text within <> to identify shortforms

    if (match) {
      // Add the found shortform to the shortforms array
      shortForms.push(match[1]);
      // Remove the shortform from the text and add to the modifiedTexts array
      longForms.push(text.replace(/<[^>]+>/, ""));
      if (longForms[longForms.length - 1] === "") {
        longForms[longForms.length - 1] = shortForms[shortForms.length - 1] ?? "";
      }
    } else {
      // If no shortform found, push null and the original text
      shortForms.push(null);
      longForms.push(text);
    }
  });

  return { shortForms, longForms };
};

interface isStringArrayInStringResult {
  found: boolean;
  indices: { start: number; end: number }[];
}

export const isStringArrayInString = (
  textArray: string[],
  textFieldText: string | undefined = "",
  inOrder = true,
  searchAllInstancesForSegment = false,
  returnOnNotFound = false
): isStringArrayInStringResult => {
  if (!textFieldText || typeof textFieldText !== "string") {
    return { found: false, indices: [] };
  }

  let charIdx = 0;
  const indices: { start: number; end: number }[] = [];

  //loop over each string to search for in the textFieldText
  for (let i = 0; i < textArray.length; i++) {
    let foundIndex = false;
    //another loop to find all indices if findAllIndicies is true
    while (charIdx < textFieldText.length) {
      const segment = textArray[i];
      if (typeof segment !== "string" || (typeof segment !== "string" && !segment)) {
        break;
      }

      if (textFieldText.includes(segment, charIdx)) {
        foundIndex = true;
        const startIndex = textFieldText.indexOf(segment, charIdx);
        const endIndex = startIndex + segment.length;
        if (startIndex >= 0 && endIndex <= textFieldText.length) {
          indices.push({ start: startIndex, end: endIndex });
        }

        charIdx = endIndex;
        if (!inOrder) {
          charIdx = 0;
        }
        if (!searchAllInstancesForSegment) {
          break;
        }
      } else if (!searchAllInstancesForSegment || returnOnNotFound) {
        return { found: false, indices: [] };
      } else {
        break;
      }
    }
  }

  return { found: true, indices };
};

export const removeRegexFromString = (originalString: string, regex: RegExp): string => {
  if (!originalString) return "";
  return originalString.replace(regex, "");
};

export const removeRangeFromString = (originalString: string, startIndex: number, endIndex: number): string => {
  // Extract the part before the range
  const firstPart = originalString.substring(0, startIndex);

  // Extract the part after the range
  const secondPart = originalString.substring(endIndex);

  // Combine the two parts
  return firstPart + secondPart;
};

export const getDateFromMongoObjectId = (objectId: string) => {
  // Extract the timestamp from the first 4 bytes of the ObjectId
  const timestamp = parseInt(objectId.substring(0, 8), 16);

  // Convert the timestamp to milliseconds and create a new Date object
  return new Date(timestamp * 1000);
};

export const extractTimestampFromMongoObjectId = (objectId: string) => {
  return parseInt(objectId.substring(0, 8), 16);
};

//takes a string, and makes sure a substring is at a particular index, if it is not there it inserts at that index. If the index is not within the range of the main string, put the substring at the start or end depending on what is closer
/**
 * Ensures a substring is at a particular index in a string, inserting it if necessary.
 * @param mainString - The main string to modify.
 * @param substring - The substring to ensure is at the specified index.
 * @param index - The index where the substring should be.
 * @returns The modified string with the substring at the specified index.
 */
export const ensureStringHasSubstringAtIndex = (mainString: string, substring: string, index: number): string => {
  if (typeof mainString !== "string" || typeof substring !== "string" || typeof index !== "number") {
    return mainString ?? substring ?? "";
  }

  // Adjust index if it's out of range
  index = Math.max(0, Math.min(index, mainString.length));

  // Check if the substring is already at the specified index
  if (mainString.substring(index, index + substring.length) === substring) {
    return mainString;
  }

  // Insert the substring
  return mainString.slice(0, index) + substring + mainString.slice(index);
};

/**
 * Inserts text at specified indices in the main string, starting from the end of the string.
 * @param mainString - The main string to modify.
 * @param insertIndices - An array of start and end indices where text should be inserted.
 * @param insertTexts - An array of texts to insert at the specified indices.
 * @returns The modified string with the texts inserted at the specified indices.
 */
export const insertStringAtIndiciesWithText = (mainString: string, insertIndices: number[][], insertTexts: string[]): string => {
  if (typeof mainString !== "string" || !Array.isArray(insertIndices) || !Array.isArray(insertTexts) || insertIndices.length !== insertTexts.length) {
    return mainString;
  }

  for (let i = insertIndices.length - 1; i >= 0; i--) {
    const [insertIndex] = insertIndices[i];
    const insertText = insertTexts[i];
    if (typeof insertIndex === "number" && typeof insertText === "string") {
      mainString = ensureStringHasSubstringAtIndex(mainString, insertText, insertIndex);
    }
  }

  return mainString;
};

/**
 * Replaces substrings in the main string at specified start and end indices with replacement texts.
 * @param mainString - The string to modify.
 * @param indices - An array of start and end indices.
 * @param replacements - An array of replacement strings.
 * @returns The modified string with replacements.
 */
export const replaceStringAtIndicesWithText = (mainString: string, indices: [number, number][], replacements: string[]): string => {
  if (typeof mainString !== "string" || !Array.isArray(indices) || !Array.isArray(replacements) || indices.length !== replacements.length) {
    return mainString;
  }

  // Sort indices in reverse order and match the replacements array accordingly
  const sorted = indices.map((range, i) => ({ range, replacement: replacements[i] })).sort((a, b) => b.range[0] - a.range[0]);

  // Extract the sorted ranges and replacements
  const sortedIndices = sorted.map((item) => item.range);
  const sortedReplacements = sorted.map((item) => item.replacement);

  // Loop through each index range and perform the replacement
  for (let i = 0; i < sortedIndices.length; i++) {
    const [start, end] = sortedIndices[i];
    const replacement = sortedReplacements[i];
    mainString = mainString.slice(0, start) + replacement + mainString.slice(end);
  }

  return mainString;
};

export const replaceNeighbouringMatchingChars = (input: string, idx: number, regex: RegExp = /[\s\n]/, replaceWith = ""): string => {
  if (!input || !regex || !replaceWith) return input;
  //start at idx, if it matches match all the way to the left and right stop proceeding with each direction if the character does not match the regex
  let leftIdx = idx;
  let rightIdx = idx;
  while (leftIdx >= 0 && regex.test(input[leftIdx])) {
    leftIdx--;
  }
  while (rightIdx < input.length && regex.test(input[rightIdx])) {
    rightIdx++;
  }
  return input.slice(0, leftIdx + 1) + replaceWith + input.slice(rightIdx);
};

//returns the string that is prior to the regex match, default match is a "." or "_" that must have something after it
export const getStringPriorMatch = (
  text: string | string[] | undefined,
  regex: RegExp = /^[^.|_]+(?=[._].+)/,
  noMatchIsUndefined: boolean = true,
  index?: number
): string | undefined => {
  if (!text && text !== "") {
    return undefined;
  }
  //if array loop over all until match
  if (Array.isArray(text)) {
    text.forEach((t) => {
      const match = getStringPriorMatch(t, regex, noMatchIsUndefined, index);
      if (match) {
        return match;
      }
    });
    return undefined;
  }
  //if index is undefined, return the first match
  const match = text.slice(0, index).match(regex);
  if (!match && noMatchIsUndefined) {
    //console.log("No match for ", text);
    return undefined;
  }
  //console.log("match", match);
  return match ? match[0] : "";
};

export const getStringAfterMatch = (
  text: string | string[] | undefined,
  regex: RegExp = /(?:\.|_)([^._]+)$/,
  noMatchIsUndefined: boolean = true,
  index?: number
): string | undefined => {
  if (!text && text !== "") {
    return undefined;
  }

  // if array loop over all until match
  if (Array.isArray(text)) {
    for (const t of text) {
      const match = getStringAfterMatch(t, regex, noMatchIsUndefined, index);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  // if index is undefined, return the first match
  const match = text.slice(index).match(regex);
  if (!match && noMatchIsUndefined) {
    return undefined;
  }
  return match ? match[1] : undefined;
};

export function capitalizeFirstChar(str: string): string {
  if (!str) return str; // or return '' depending on your needs
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const capitalizeFirstLetterEachWord = (text: string): string => {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const addSpaceAfterNumbers = (input: string, regexFlags: string[] = ["g"]) => {
  // Perform the replacement using the dynamically created regex
  return input.replace(new RegExp("(d+)([A-Z])", regexFlags.join("")), "$1 $2"); // Numbers followed by uppercase letters
};

export const addSpaceBeforeNumbers = (input: string, regexFlags: string[] = ["g"]) => {
  // Perform the replacement using the dynamically created regex
  return input.replace(new RegExp("([a-zA-Z])(\\d+)", regexFlags.join("")), "$1 $2");
};

//slower algorithm that enables search for repetition in subString priority order
export const limitStringToNSubStringRepetitions = (text: string, subStrings?: string[], repetitions?: number[]): string => {
  if (!text || !subStrings || !repetitions || subStrings.length !== repetitions.length) {
    return text;
  }

  // make repititions array same length of subStrings, if it is shorter, fill with 1
  if (repetitions.length <= subStrings.length) {
    for (let i = repetitions.length; i < subStrings.length; i++) {
      repetitions.push(1);
    }
  } else {
    repetitions = repetitions.slice(0, subStrings.length);
  }

  //loop over each substring and check if it is in the text
  for (let i = 0; i < subStrings.length; i++) {
    const subString = subStrings[i];
    if (!subString) continue;
    const repetition = repetitions[i];
    if (!repetition) {
      //remove all instances of the substring
      text = text.replace(new RegExp(subString, "g"), "");
      continue;
    }

    //find the start and end idicies of text where the substring is found to repeat more than repetition number of times
    const indices: number[][] = [[]]; //array of start and end indices of the substring

    let subStringIdx = 0;
    let subStringCurrChar = subString[subStringIdx];
    let repetitionsFound = 0;
    //seach for the substring in the text
    for (let j = 0; j < text.length; j++) {
      subStringCurrChar = subString[subStringIdx];
      if (text[j] === subStringCurrChar) {
        subStringIdx++;
        if (subStringIdx === subString.length) {
          repetitionsFound++;
          subStringIdx = 0;
          if (repetitionsFound > repetition && indices[indices.length - 1].length === 0) {
            //add the start index of the substring
            indices[indices.length - 1][0] = j - subString.length + 1;
          } else if (repetitionsFound > repetition && indices[indices.length - 1].length === 1) {
            //add the end index of the substring
            indices[indices.length - 1][1] === j + 1;
          }

          subStringIdx = 0;
        }
      } else {
        //reset streak if the current character does not match the substring
        if (repetitionsFound > 0) {
          if (indices[indices.length - 1].length === 1) {
            //remove the end index if the streak is broken
            indices.pop();
          } else if (indices[indices.length - 1].length === 2) {
            //successfully found a start and end index for a repetition longer than the limit
            indices.push([]);
          }
        }
        subStringIdx = 0;
        repetitionsFound = 0;
      }
    }
    //now remove all indicies that have a start and end index, go in reverse order to avoid index shifting
    for (let j = indices.length - 1; j >= 0; j--) {
      if (indices[j].length === 2) {
        text = text.slice(0, indices[j][0]) + text.slice(indices[j][1]);
      }
    }
  }

  return text;
};

export const hexToRgb = (hex: string): string => {
  // Remove the "#" if it's included in the hex color string
  hex = hex.replace(/^#/, "");

  // Parse the hex color string into its components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGB color string
  return `rgb(${r}, ${g}, ${b})`;
};

//splits the string into an array of strings, returns the segment at the index, if the index is out of range, return the last segment
export const getNthSegment = (inputString: string, splitBy: string = " ", index = -1) => {
  // Check if the string contains spaces
  if (inputString.includes(splitBy)) {
    // Split the string by space and get the last segment
    const segments = inputString.split(splitBy);
    return segments[index < 0 ? segments.length - (Math.abs(index) % segments.length) : index > segments.length ? segments.length - 1 : index];
  }

  // If no space, return the original string
  return inputString;
};

export const splitOnString = (str: string, delimiter: string = "_"): string => {
  const parts = str.split(delimiter); // Split the string on every "_"
  if (parts.length > 1) {
    return parts.slice(1).join("_"); // Join the parts after the first "_"
  }
  return str; // If no "_" is found, return the original string
};

//takes a string and returns true if it seems the str could conform to being a persons name
export const strPossiblyAName = (str: string): boolean => {
  if (!str) return false;
  str = str.trim();
  if (!str) return false;

  if (emailRegex.test(str)) return false;

  // check for leading salutation, starts with something under 7 characters with a dot or comma
  const salutationMatch = str.match(/^[a-zA-Z]{1,7}[.,]/);
  if (salutationMatch) {
    //remove the salutation
    str = str.slice(salutationMatch[0].length);
  }

  // check for trailing salutation, ends with something under 7 characters with a dot or comma
  const trailingSalutationMatch = str.match(/[.,][a-zA-Z]{1,7}$/);
  if (trailingSalutationMatch) {
    //remove the trailing salutation
    str = str.slice(0, -trailingSalutationMatch[0].length);
  }

  // check for a maximum of 4 words
  const words = str.split(" ");
  if (words.length > 4 || str.length > 120) {
    return false;
  }

  if (str.length > 0) return true;

  return false;
};

export const strPossiblyFirstAndLastName = (str: string): boolean => {
  if (!str) {
    return false;
  }
  str = str.trim();

  const nameParts = str.split(" ");
  if (nameParts.length === 2) {
    return true;
  }

  return false;
};

//Works with depth 1 objects only
export const mostLikelyFirstName = (obj: Record<string, any>, priorityKeys: string[] = ["physicianName", "newDentistName"]): string => {
  const likelyNames = ["to name", "to first name", "first name", "given name", "name"];

  // Filter the keys of the object that are in the likely last names list
  const filteredKeys = Object.keys(obj).filter((key) => likelyNames.includes(key.toLowerCase()));

  // Prioritize keys based on the priorityKeys array
  const prioritizedKeys = [...priorityKeys, ...filteredKeys.filter((key) => !priorityKeys.includes(key.toLowerCase()))];

  // Find the first prioritized key that exists in the object and return its value
  for (const key of prioritizedKeys) {
    if (obj[key]) {
      return getNthSegment(obj[key], " ", 0); //return the first element
    }
  }
  return "";
};

//Works with depth 1 objects only
export const mostLikelyLastName = (obj: Record<string, any>, priorityKeys: string[] = ["physicianName", "newDentistName"]): string => {
  const likelyNames = ["to name", "to last name", "last name", "surname", "name"];

  // Filter the keys of the object that are in the likely last names list
  const filteredKeys = Object.keys(obj).filter((key) => likelyNames.includes(key));

  // Prioritize keys based on the priorityKeys array
  const prioritizedKeys = [...priorityKeys, ...filteredKeys.filter((key) => !priorityKeys.includes(key))];

  // Find the first prioritized key that exists in the object and return its value
  for (const key of prioritizedKeys) {
    if (obj[key]) {
      return getNthSegment(obj[key], " ", -1); //return the last element
    }
  }
  return "";
};

//Works with depth 1 objects only
export const mostLikelyContactName = (obj: Record<string, any>, priorityKeys: string[] = ["physicianName", "newDentistName"]): string => {
  const likelyNames = ["to name", "to last name", "last name", "surname", "name"];

  // Filter the keys of the object that are in the likely last names list
  const filteredKeys = Object.keys(obj).filter((key) => likelyNames.includes(key));

  // Prioritize keys based on the priorityKeys array
  const prioritizedKeys = [...priorityKeys, ...filteredKeys.filter((key) => !priorityKeys.includes(key))];

  // Find the first prioritized key that exists in the object and return its value
  for (const key of prioritizedKeys) {
    if (obj[key]) {
      return getNthSegment(obj[key], " ", -1); //return the last element
    }
  }
  return "";
};

//from a shallow map, get the value of the key this is most likely to be the customers name, return an object with the first and last name
export const getMostLikelyNameFromEntry = (
  entry: Record<string, string>,
  priorityKeys: string[] = ["patient_firstName", "patient_lastName"],
  alternateKeys: string[] = ["physicianName", "newDentistName"]
): Record<string, any> => {
  let result: Record<string, any> = {};
  //loop over all priority keys and try to populate the result

  for (const key of priorityKeys) {
    if (entry[key]) {
      result[key] = entry[key];
    }
  }
  if (false) {
    result["otherEntry"] = getFirstObjectThatContain(entry, ["firstName", "name", "givenName", "toName"]);
    result["otherEntry"] = getFirstObjectThatContain(entry, ["lastName", "surname", "toLastName"]);
  }

  return result;
};

export const getFirstKeyThatContains = (entry: Record<string, string>, keys: string[]): string => {
  for (const key of keys) {
    if (entry[key]) {
      return entry[key];
    } else {
      for (const entryKey in entry) {
        if (entryKey.toLowerCase().includes(key.toLowerCase())) {
          return entry[entryKey];
        }
      }
    }
  }
  return "";
};

export const getFirstObjectThatContain = (entry: Record<string, string>, keys: string[]): Record<string, any> => {
  for (const key of keys) {
    if (entry[key]) {
      return { [key]: entry[key] };
    } else {
      for (const entryKey in entry) {
        if (entryKey.toLowerCase().includes(key.toLowerCase())) {
          return { [entryKey]: entry[entryKey] };
        }
      }
    }
  }
  return {};
};

export function escapeRegexConflicts(input: string): string {
  // Escapes special characters: . * + ? ^ $ { } ( ) | [ ] \
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//Takes an object with key values and substitutes those values with the keys respective referenced field
export const anonymizeStringWithReferencedFields = (text: string, anonymizeValues?: Record<string, string>): string => {
  if (!text || typeof text !== "string") return "";
  if (anonymizeValues) {
    //loop over the anonymizeValues and replace the text with the value
    for (const key in anonymizeValues) {
      if (anonymizeValues[key]) {
        //replace the sensitive values with the key, identify the sensitive value as surrounded by whitespace or punctuation
        const regex = new RegExp(`(?<=^|[\\s\\p{P}\\^\`])${escapeRegexConflicts(anonymizeValues[key])}(?=[\\s\\p{P}\\^\`]|$)`, "gu");
        text = text.replace(regex, `{${key}}`);
      }
    }
  }
  return text;
};

export const generatePDFFileName = (title: string, entryFields: Record<string, any>, versionSuffixArray?: string[]): string => {
  let versionSuffix = versionSuffixArray && versionSuffixArray?.length > 0 ? getVersionSuffixHumanReadable(versionSuffixArray) : "";
  if (versionSuffix) {
    versionSuffix = "_" + versionSuffix;
  }
  const fileName =
    camelOrSnakeToTitleCaseUnderscore(title) +
    "_Patient_" +
    entryFields.patient.firstName +
    "-" +
    entryFields.patient.lastName +
    "_Date_" +
    entryFields.appointmentDetails.appointmentDate +
    versionSuffix +
    ".PDF";
  return fileName;
};

export const getSubstringFromNthDelimiter = (inputString: string, delimiter: string, nth: number) => {
  let index = 0;
  for (let i = 0; i < nth; i++) {
    index = inputString.indexOf(delimiter, index + 1); // Find next underscore after the current index
    if (index === -1) break; // If there are less than N underscores, break early
  }
  return index !== -1 ? inputString.substring(index) : ""; // Return substring from Nth underscore or empty if not found
};

export const getFirstElemOfType = (array: any[], type: string): any => {
  for (const elem of array) {
    if (typeof elem === type) {
      return elem;
    }
  }
  return undefined;
};

export const appendWithSingleSpaceBetween = (text: string, insertText?: string | null): string => {
  if (!text) {
    // remove all the spaces at the start of the insertText
    if (!insertText) return "";
    return insertText.replace(/^\s+/, "");
  }
  if (!insertText) {
    return text.replace(/\s+$/, "");
  }
  // remove all the spaces at the end of the text
  text = text.replace(/\s+$/, "");

  //remove all spaces at start of insertText
  insertText = insertText.replace(/^\s+/, "");

  return text + " " + insertText;
};

export const appendWithTripleNewlineBetween = (text: string, insertText: string): string => {
  if (!text) {
    return insertText.replace(/^\n+/, "");
  }
  // remove all the newlines at the end of the text
  text = text.replace(/\n+$/, "");

  //remove all newlines at start of insertText
  insertText = insertText.replace(/^\n+/, "");

  return text + "\n\n\n" + insertText;
};

export const appendWithNumberOfNewlineBetween = (text: string, insertText: string, numberOfNewlines = 2): string => {
  if (!text) {
    return insertText.replace(/^\n+/, "");
  }
  // remove all the newlines at the end of the text
  text = text.replace(/\n+$/, "");

  //remove all newlines at start of insertText
  insertText = insertText.replace(/^\n+/, "");

  let newlines = "";
  for (let i = 0; i < numberOfNewlines; i++) {
    newlines += "\n";
  }

  return text + newlines + insertText;
};

//If the startMatch is found, place the insertText after the startMatch, if not found, place the startMatch text + insertText at the end of the text
export const upsertStringMatch = (
  text: string,
  insertText: string,
  startMatch: string | (RegExp | string)[] = [], //a list of possible startMatches, the start matches are checked in order, and should be unqiue in the text
  endMatch: string | (RegExp | string)[] = [],
  matchRegex?: RegExp
): string => {
  if (!text) {
    return startMatch ? startMatch + insertText : insertText;
  }
  if (!startMatch || startMatch.length === 0) {
    return appendWithNumberOfNewlineBetween(text, insertText, 2);
  }

  // check if the startMatch is found and logic for replacing text after it up until a new line
  let match;
  if (!Array.isArray(startMatch)) {
    startMatch = [startMatch];
  }
  for (const matchString of startMatch) {
    match = text.match(matchString);
    if (match) {
      startMatch = matchString instanceof RegExp ? match : matchString;
      break;
    }
  }

  if (!match || match.index === undefined || Array.isArray(startMatch)) {
    //startMatch is still an array, so match was not found, so we append the text at the end of the string
    startMatch = getFirstElemOfType(startMatch as any[], "string") ?? "";
    return appendWithNumberOfNewlineBetween(text, startMatch + insertText, 2);
  }

  //found start match, look for an endMatch Index after the startmatch
  let untilMatchIndex = undefined;
  if (endMatch) {
    if (!Array.isArray(endMatch)) {
      endMatch = [endMatch];
    }
    for (let matchString of endMatch) {
      if (typeof matchString === "string" && isValidRegexString(matchString)) {
        matchString = stringToRegex(matchString) ?? "";
        if (!matchString) continue;
      }
      if (matchString instanceof RegExp) {
        matchString = ensureGlobalFlag(matchString);
        matchString.lastIndex = match.index ?? 0;
        const RegExpMatch = matchString.exec(text);
        if (RegExpMatch && RegExpMatch.index !== undefined) {
          untilMatchIndex = RegExpMatch.index;
          break;
        }
      } else if (typeof matchString === "string") {
        untilMatchIndex = text.indexOf(matchString, match.index + match[0].length);
        if (untilMatchIndex !== -1) {
          break;
        }
      }
    }
  }

  //if the untilMatchIndex is found, replace the text between the startMatch and untilMatchIndex with the insertText
  if (untilMatchIndex !== -1 && untilMatchIndex !== undefined) {
    let newText = text.substring(0, match.index) + startMatch + insertText;
    return appendWithNumberOfNewlineBetween(newText, text.substring(untilMatchIndex), 2);
  }

  //if the untilMatchIndex is not found, replace all the text after the startMatch with the insertText
  return text.substring(0, match.index) + startMatch + insertText;
};

/**
 * Ensures `bridge` appears exactly once, bridging `str1` and `str2`.
 * If `str1` already ends with `bridge`, or `str2` begins with `bridge`,
 * those occurrences are stripped so you don't see duplicates.
 *
 * Example:
 *   ensureConcatenatedWith("abc---", "---", "---def")  // => "abc---def"
 */
export function ensureUniqueDelimiterBetweenStrings(str1: string, delimeter?: string, str2?: string) {
  // Remove trailing occurrences of `bridge` from str1
  while (delimeter && str1.endsWith(delimeter)) {
    str1 = str1.slice(0, -delimeter.length);
  }

  if (!str2) return str1 + delimeter;

  // Remove leading occurrences of `bridge` from str2
  while (delimeter && str2.startsWith(delimeter)) {
    str2 = str2.slice(delimeter.length);
  }

  // Now concatenate with exactly one `bridge`
  return str1 + delimeter + str2;
}

export const removeQueryParam = (url: string, paramName: string): string[] => {
  // Create a URL object from the provided string
  const urlObj = new URL(url);

  // Access the search parameters
  const params = urlObj.searchParams;

  // Save the parameter value before removing it
  const paramValue = params.get(paramName);

  // Check if the parameter exists and remove it
  if (paramValue !== null) {
    params.delete(paramName);
  }

  // Update the search parameters of the URL object
  urlObj.search = params.toString();

  // Return the updated URL and the extracted parameter value
  return [urlObj.toString(), paramValue ?? ""];
};

export const addQueryParam = (url: string, paramName: string, paramValue: string) => {
  // Create a URL object from the provided string
  const urlObj = new URL(url);

  // Access the search parameters
  const params = urlObj.searchParams;

  // Add the new parameter
  params.append(paramName, paramValue);

  // Update the search parameters of the URL object
  urlObj.search = params.toString();

  // Return the updated URL
  return urlObj.toString();
};

export const numWords = (text: string): number => {
  return text.split(" ").length;
};

export const buildAuthor = (ownerFields: Record<string, any>) => {
  const prefix = ownerFields.prefix && typeof ownerFields.prefix === "string" ? ownerFields.prefix + " " : "";
  const author = prefix + ownerFields.firstName + " " + ownerFields.lastName;
  return author;
};

export const hasWhiteSpace = (str: string) => {
  if (!str || typeof str !== "string") return false;
  return /\s/.test(str);
};

//^\d+$
export const stringHasOnlyDigits = (str: string) => /^[0-9]+$/.test(str);

// Matches any digit
export const stringIsDigit = (char: string) => /\d/.test(char);

export const stringIsQuote = (char: string) => /['"`]/.test(char);

export const stringIsWhitespace = (char: string) => /\s/.test(char);

export const stringIsNumberOrBoolean = (char: string) => /\d/.test(char) || /true|false/.test(char);

export const stringIsNumberOrTF = (char: string) => /\d/.test(char) || /t|f/.test(char);

export const stringHasLetterOrNumber = (char: string) => /[A-Za-z0-9]/.test(char);

export const stringHasChar = (char: string) => /\w/.test(char);

export const stringHasNumberOrNullOrTF = (char: string) =>
  /\d/.test(char) ||
  /n/.test(char) ||
  /t|f/.test(char) ||
  /true|false/.test(char) ||
  /True|False/.test(char) ||
  /TRUE|FALSE/.test(char) ||
  /T|F/.test(char);

//Only tested to work in reverse, when startIndex undefined and endIndex is required
export function charInWord(text: string, char: string, startIndex?: number, endIndex?: number): string | false {
  let searchInReverse = false;

  if (startIndex === undefined) {
    searchInReverse = true;
    startIndex = 0;
  }
  if (endIndex === undefined) {
    endIndex = text.length;
  }

  let foundOpeningBraceInWord = false;
  let i = endIndex - 1; // Start from the character just before the cursor
  let result = "";
  while (i >= 0) {
    const char = text[i];
    if (char === "{") {
      //flip the result
      result = result.split("").reverse().join("");
      return result;
    }
    if (/\s/.test(char)) {
      // \s matches any whitespace character
      // Found whitespace before finding '{' in the current word segment
      return false;
    }
    result += char;
    i--;
  }

  return false;
}

export const formatPhoneNumberGlobal = (inputValue: string) => {
  //remove anything other than a leading + and numbers and spaces or dashes
  inputValue = inputValue.replace(/(?!^\+)[^\d\s-]/g, "");

  inputValue = limitStringToNSubStringRepetitions(inputValue, ["-", " ", "+", ")", "("]);

  return inputValue;
};

export const formatPhoneNumberAmerica = (inputValue: string, anyGlobalNumber = false) => {
  if (!inputValue) return "";
  if (anyGlobalNumber) {
    return formatPhoneNumberGlobal(inputValue);
  } else {
    //remove all spaces or letters
    inputValue = inputValue.replace(/[a-zA-Z\s]/g, "");

    if (!inputValue) return "";
    if (inputValue.length === 1 && inputValue === "1") return "+" + inputValue;
    if (inputValue.length === 1 && inputValue === "+") return "+";
    if (inputValue.length === 1 && inputValue === "(") return "(";
    if (inputValue.length === 1 && stringIsDigit(inputValue)) return "(" + inputValue;
    if (inputValue.length === 1) return inputValue;

    // Apply formatting
    let formattedNumber = "";
    let prefixStringLen = 0;
    let hasPlus = false;
    if (inputValue.startsWith("+")) {
      formattedNumber += "+";
      hasPlus = true;
      prefixStringLen++;
      if (stringIsDigit(inputValue[1])) {
        formattedNumber += inputValue[1] + " ";
        prefixStringLen++;
      }
    } else if (inputValue.length >= 4 && inputValue.startsWith("1")) {
      formattedNumber += "+1 ";
      hasPlus = true;
      prefixStringLen++;
    }

    // Remove all non-numeric characters, except for "+" at the start
    let numbers = inputValue.replace(/(?!^\+)\D/g, "");
    if (hasPlus) {
      //remove first two characters
      numbers = numbers.slice(prefixStringLen);
    }

    // Truncate to the first 10 digits (standard North American phone number length)
    numbers = numbers.substring(0, 10);

    for (let i = 0; i < numbers.length; i++) {
      if (i === 0) formattedNumber += "(";
      if (i === 3) formattedNumber += ") ";
      if (i === 6) formattedNumber += "-";
      formattedNumber += numbers.charAt(i);
    }

    // If exactly 3 digits are entered, append ") "
    if (numbers.length === 3) {
      formattedNumber += ") ";
    }

    return formattedNumber;
  }
};

//The num is always in milliseconds, the unit is the unit of the string
export function numToDurationString(num: number | string, unit: "s" | "ms" = "ms"): string {
  if (typeof num === "string") {
    num = parseInt(num);
  }
  if (num === 0) return "0ms";

  if (unit === "s") {
    return Math.round(num / 1000) + "s";
  } else {
    return num + "ms";
  }
}

export function paddedWithZeros(str?: string, size?: number, allowLarger: boolean = true): string {
  if (!str) return "";
  if (!size) return str;
  if (str.length > size) {
    //check is zeros can be removed from the start until the size is reached
    while (str.length > size && str[0] === "0") {
      str = str.slice(1);
    }
  }
  while (str.length < size) str = "0" + str;
  return str;
}

export function getStandardNameFromURLFormat(arn: string): string {
  if (!arn) return "";
  //convert hypens to spaces
  arn = arn.replace(/-/g, " ");
  // Split the string on both forward and backslashes.
  const parts = arn.split(/[\/\\]+/);
  //loop over the parts
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    //append a space if another part and the current part is not "v" and the next part is not a number
    if (i < parts.length - 1 && parts[i].toLowerCase() !== "v" && !stringIsDigit(parts[i + 1][0])) {
      result += " ";
    }
  }
  // Trim any extra spaces and return.
  return result.trim();
}
