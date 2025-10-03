import {
  isWrappedInQuotes,
  lastNonRegexChar,
  removeLastNonRegexChar,
  stringHasNumberOrNullOrTF,
  stringIsDigit,
  stringIsNumberOrBoolean,
  stringIsNumberOrTF,
  stringIsQuote,
  stringIsWhitespace,
  wrapInQuotes,
} from "./stringManipulation";

export const removeNewLines = (str: string, keepInsideQuotes = true): string => {
  let result = [];
  let inQuotes: boolean | string = false; //the type of quote that is currently open
  for (let i = 0; i < str.length; i++) {
    let char = str[i];

    // Toggle the inQuotes flag when encountering a quote that isn't escaped
    if (inQuotes && stringIsQuote(char) && inQuotes === char && (i === 0 || str[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      result.push(char);
      continue;
    }

    if (!inQuotes) {
      if (stringIsQuote(char)) {
        inQuotes = char;
        result.push(char);
        continue;
      }
      /*if (char === "\n" && inQuotes) {
        result.push("\\n");
        continue;
      }
      */
      if (char === "\n" || (char === "\\" && i + 1 < str.length && str[i + 1] === "n")) {
        continue;
      } else {
        result.push(char);
      }
    } else {
      result.push(char);
    }
  }
  return result.join("");
};

/**
 * Formats a JSON string by adding quotes around keys if not present and removing trailing commas from closing brackets.
 * @param {string} jsonString - The JSON string to format.
 * @returns {Record<string, any>} - The formatted JSON object.
 */
export const formatObjectLiteralStringToJSON = (jsonString: string): Record<string, any> => {
  let formattedString = jsonString;
  // Applying the transformations
  //formattedString = decodeURIComponent(formattedString); // Decode URI encoding
  formattedString = removeComments(formattedString);
  //formattedString = JSON.stringify(formattedString);          //doesnt work, can only stringify object literal notation or JSON objects not string
  formattedString = removeNewLines(formattedString);
  formattedString = addQuotesToKeysParseMethod(formattedString);
  formattedString = removeTrailingCommas(formattedString);
  //formattedString = removeCommasAfterSquareBrackets(formattedString);
  //formattedString = replaceLiteralNewlines(formattedString);
  //formattedString = replaceEscapedQuotes(formattedString);
  console.log("formattedString1", formattedString);
  formattedString = removeHiddenNewLines(formattedString);
  console.log("formattedString2", formattedString);

  //let rawString = String.raw({ raw: [formattedString] });
  //rawString = unescapeQuotesInJSON(rawString);

  //const x = `'${formattedString}'`;
  //formattedString = `'${formattedString}'`;
  //formattedString = unescapeQuotesInJSON(formattedString);

  //const parsed = jsonlint.parse(formattedString.replace(/(?<=[:,\s{])\\"|\\(?="[:,}\s])/g, '"'));
  //formattedString = customStringify(parsed, true);

  //NOTE: with escaped quotes its ok this works: JSON.parse("{\"ok\":\"great\"}")

  try {
    return JSON.parse(formattedString) as Record<string, any>;
  } catch (error: any) {
    //if error has a at position, try to find the position and log the error with the text at that position
    let errorNear: string | undefined;
    if (error.message.includes("at position")) {
      const match = error.message.match(/at position (\d+)/);
      if (match) {
        const position = parseInt(match[1], 10);
        errorNear = "Position:" + position + "Text:" + formattedString.slice(position - 20, Math.min(position + 20, formattedString.length));
      }
    }
    console.error("Error in formatJsonString:" + errorNear, "\nError:", error);

    throw new Error("Invalid JSON format after processing");
  }
};

/**
 * Removes single-line and multi-line comments from a JSON-like string.
 * @param {string} input - The input string containing JSON-like code.
 * @returns {string} - The string with comments removed.
 */
export const removeComments = (input: string) => {
  // Remove multi-line comments
  const withoutMultilineComments = input.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove single-line comments
  const withoutSingleLineComments = withoutMultilineComments.replace(/\/\/.*$/gm, "");

  return withoutSingleLineComments;
};

export const replaceEscapedQuotes = (input: string, quoteType = '"') => {
  return input.replace(/\\\"/g, quoteType);
};

function unescapeQuotesInJSON(jsonString: string, quoteType = '"') {
  // This regex finds escaped quotes that are either at the start (following a brace or comma, or colon)
  // or at the end (before a colon, comma or brace), while considering potential whitespace.
  return jsonString.replace(/(?<=[:,\s{])\\"|\\(?="[:,}\s])/g, quoteType);
}

// Function to add quotes around keys if not present
export const addQuotesToKeys = (str: string) => {
  return str.replace(/(\{|,)\s*([^\"\s\:\,]+)\s*:/g, '$1 "$2":');
};

export const addQuotesToKeysParseMethod = (str: string, attemptToFixCorruptJSON: boolean = true, removeWhiteSpace: boolean = true): string => {
  const quoteType = '"';
  let inQuotes: boolean | string = false; //the type of quote that is currently open
  let bracketDepth = 0;
  let squareBracketDepth = 0;
  let expectingKey = true;
  let expectingValue = false;
  let expectingOpenBrace = true;
  let expectingCloseBrace = false;
  let wasValue = false;
  let wasKey = false;
  let expectingColon = false;
  let expectingCommaOrCloseBrace = false;
  let attempToFixRecoveryKey = "";
  let lastNonWhitespaceChar = "";
  let lastNonWhiteSpaceIdxOffset = 0;
  let prevLastNonWhitespaceChar = "";
  let prevLastNonWhitespaceCharIdxOffset = 0;

  let result = "";
  let match;

  let count = 0;

  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    let nextChar = str[i + 1];
    let nextNextChar = str[i + 2];

    match = null;

    // Toggle the inQuotes flag off when encountering a quote that isn't escaped
    if (inQuotes && stringIsQuote(char) && inQuotes === char && (i === 0 || str[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      if (wasKey) {
        expectingColon = true;
        wasKey = false;
      }
      if (wasValue || squareBracketDepth > 0) {
        expectingCommaOrCloseBrace = true;
        attempToFixRecoveryKey = "";
        expectingValue = false;
        wasValue = false;
      }
      result += char;
      continue;
    }

    // Detect potential keys (not in quotes, followed by an unquoted colon)
    if (!inQuotes) {
      // remove any whitespace character before next token
      if (stringIsWhitespace(char)) {
        lastNonWhiteSpaceIdxOffset++;
        if (!removeWhiteSpace) result += char;
        continue;
      } else {
        //its a new valid char, when was the last non whitespace char?
        prevLastNonWhitespaceCharIdxOffset = lastNonWhiteSpaceIdxOffset;
        prevLastNonWhitespaceChar = lastNonWhitespaceChar;
        lastNonWhitespaceChar = char;
        lastNonWhiteSpaceIdxOffset = 0;
      }

      if (expectingCommaOrCloseBrace || (expectingCloseBrace && (char === "}" || char === "]"))) {
        if (char === "}") {
          //remove a trailing comma from result if present
          if (attemptToFixCorruptJSON) {
            if (result.endsWith(",")) {
              result = result.slice(0, -1);
            } else if (lastNonRegexChar(result, /\s/) === ",") {
              result = removeLastNonRegexChar(result, /\s/);
            }
          }
          expectingCommaOrCloseBrace = true;
          bracketDepth--;
          result += char;
          if (bracketDepth === 0) return result;
          continue;
        }
        if (char === "]" && squareBracketDepth > 0) {
          if (attemptToFixCorruptJSON) {
            if (result.endsWith(",")) {
              result = result.slice(0, -1);
            } else if (lastNonRegexChar(result, /\s/) === ",") {
              result = removeLastNonRegexChar(result, /\s/);
            }
          }
          expectingCommaOrCloseBrace = true;
          squareBracketDepth--;
          result += char;
          continue;
        }
        if (char === ",") {
          if (squareBracketDepth > 0) {
            //we are inside an array
            expectingValue = true;
            expectingCommaOrCloseBrace = false;
            expectingCloseBrace = true;
            expectingKey = false;
            expectingCloseBrace = true;
          } else {
            //we are inside an object
            expectingValue = false;
            expectingCommaOrCloseBrace = false;
            expectingKey = true;
            expectingCloseBrace = true;
          }
          result += char;
          continue;
        }
        if (attemptToFixCorruptJSON) {
          //dont add this unknown character, skip it
          //keep track of the last character that was skipped
          attempToFixRecoveryKey += char;
          if (nextChar === ":") {
            //The attempToFixRecoveryKey must be a key for a new entry. Therefore a comma was skipped, add it
            result += ",";
            result += isWrappedInQuotes(attempToFixRecoveryKey, quoteType) ? attempToFixRecoveryKey : wrapInQuotes(attempToFixRecoveryKey, quoteType);
            expectingCommaOrCloseBrace = false;
            expectingKey = false;
            expectingColon = true;
          }
          continue;
        }
      }
      if (expectingOpenBrace && char === "{") {
        expectingOpenBrace = false;
        bracketDepth++;
        result += char;
        continue;
      } else if (expectingOpenBrace) {
        throw new Error("Unable to convert object literal to JSON, expecting open brace at index " + i);
      }

      if (expectingKey || expectingCloseBrace) {
        if (char === "}") {
          //remove a trailing comma from result if present
          if (result.endsWith(",")) {
            result = result.slice(0, -1);
          }
          bracketDepth--;
          if (bracketDepth === 0) {
            result += char;
            break;
          }
          expectingCommaOrCloseBrace = true;
          result += char;
          continue;
        }
        if (char === "]" && squareBracketDepth > 0) {
          if (result.endsWith(",")) {
            result = result.slice(0, -1);
          }
          squareBracketDepth--;
          if (squareBracketDepth === 0) {
            //the object is closed
            expectingCommaOrCloseBrace = true;
          }
          result += char;
          continue;
        }

        //if the key has a digit
        if (stringIsDigit(char)) {
          throw new Error("Unable to convert object literal to JSON, key cannot start with a digit, at index " + i);
        }
        //if the key is quoted
        if (stringIsQuote(char)) {
          inQuotes = char;
          expectingKey = false;
          expectingCloseBrace = false;
          expectingColon = true;
          wasKey = true;
          result += char;
          continue;
        }
        //the key is not quoted
        match = str.substring(i).match(/[\w$][\w\d$]*/);
        if (match) {
          i += match[0].length - 1;
          expectingKey = false;
          expectingCloseBrace = false;
          expectingColon = true;
          wasKey = true;
          result += quoteType + match[0] + quoteType;
          continue;
        }
        throw new Error("Unable to convert object literal to JSON, expecting key at index " + i);
      }
      if (expectingColon && char === ":") {
        expectingColon = false;
        expectingValue = true;
        result += char + (removeWhiteSpace ? " " : "");
        continue;
      }
      if (expectingValue && stringIsQuote(char)) {
        wasValue = true;
        wasKey = false;
        inQuotes = char;
        result += char;
        continue;
      }
      if (expectingValue && char === "{") {
        expectingValue = false;
        expectingKey = true;
        bracketDepth++;
        result += char;
        continue;
      }
      if (expectingValue && char === "}") {
        expectingValue = false;
        expectingCommaOrCloseBrace = true;
        bracketDepth--;
        result += char;
        continue;
      }
      if (expectingValue && char === ",") {
        expectingValue = false;
        expectingKey = true;
        expectingCloseBrace = true;
        result += char;
        continue;
      }
      if (expectingValue && char === "[") {
        squareBracketDepth++;
        expectingValue = true;
        result += char;
        continue;
      }
      if (expectingValue && char === "]") {
        squareBracketDepth--;
        expectingCommaOrCloseBrace = true;
        expectingValue = false;
        result += char;
        continue;
      }
      if (expectingValue && char === " ") {
        continue;
      }
      if (expectingValue && stringHasNumberOrNullOrTF(char)) {
        if (stringIsDigit(char)) {
          match = str.substring(i).match(/\d+(\.\d+)?/);
          if (match) {
            i += match[0].length - 1;
            expectingValue = false;
            expectingCommaOrCloseBrace = true;
            result += match[0];
            continue;
          }
          throw new Error("Unable to convert object literal to JSON, expecting value, got identifier, at index " + i);
        }
        if (char === "n") {
          match = str.substring(i).match(/null/);
          if (match) {
            i += match[0].length - 1;
            expectingValue = false;
            expectingCommaOrCloseBrace = true;
            result += match[0];
            continue;
          }
          throw new Error("Unable to convert object literal to JSON, expecting bull value, got identifier, at index " + i);
        }
        if (char === "t" || char === "f") {
          match = str.substring(i).match(/true|false/);
          if (match) {
            i += match[0].length - 1;
            expectingValue = false;
            expectingCommaOrCloseBrace = true;
            result += match[0];
            continue;
          }
          throw new Error("Unable to convert object literal to JSON, expecting value, got identifier, at index " + i);
        }
      }

      if (expectingValue && char.match(/[\w\d$]/)) {
        throw new Error("Unable to convert object literal to JSON, expecting value, got identifier, at index " + i);
      }
      if (expectingValue && char === ",") {
        throw new Error("Unable to convert object literal to JSON, expecting value, got comma, at index " + i);
      }
      result += char;
    } else {
      //dont modify inside quotes
      result += char;
    }
  }
  if (attemptToFixCorruptJSON && bracketDepth > 0) {
    while (bracketDepth > 1) {
      //add closing brackets to the last match untill all brackets are closed
      result += "},";
    }
    result += "};";
  }

  return result;
};

export const removeHiddenNewLines = (str: string) => {
  return str.replace(/\\\n/g, "");
};

export const removeTrailingCommas = (str: string) => {
  return str.replace(/,\s*([\}\]])/g, "$1");
};

export const replaceLiteralNewlines = (input: string) => {
  return input.replace(/\\n/g, "\n");
};

// Function to remove commas after square brackets in JSON string
export const removeCommasAfterSquareBrackets = (str: string) => {
  return str.replace(/\],\s*(?=[\]}])/g, "]");
};

//remove instances of single "\" in a string, if two are present, replace with one
export const removeDoubleBackslashes = (str: string) => {
  return str.replace(/\\\\/g, "\\");
};

export const customStringify = (jsonObject: Record<string, any>, pretty: boolean) => {
  let jsonString = pretty ? JSON.stringify(jsonObject, null, 4) : JSON.stringify(jsonObject);
  jsonString = jsonString.replace(/\\\\u([\da-fA-F]{4})/g, "\\u$1").replace(/\\\//g, "/");

  return jsonString;
};

export const convertSpacesToTabs = (str: string, spacesPerIndent: number) => {
  const spaceGroup = " ".repeat(spacesPerIndent);
  return str
    .split("\n")
    .map((line) => line.replace(new RegExp(`^(${spaceGroup})+`, "g"), (match) => "\t".repeat(match.length / spacesPerIndent)))
    .join("\n");
};

export const customCompress = (jsonString: string) => {
  let modifiedString = jsonString.replace(/\\u([\da-fA-F]{4})/g, "UNICODE_$1").replace(/\\\//g, "SLASH");
  try {
    let compressedJson = JSON.stringify(JSON.parse(modifiedString));
    compressedJson = compressedJson.replace(/UNICODE_([\da-fA-F]{4})/g, "\\u$1").replace(/SLASH/g, "\\/");

    return compressedJson;
  } catch (error) {
    console.error("Error in customCompress:", error);
    return jsonString;
  }
};

export async function fetchSvgAsString(svgUrl: string): Promise<string> {
  const response = await fetch(svgUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
  }
  const svgText = await response.text();
  return svgText;
}

/**
 * Determines if the given image URL is an SVG or PNG by file extension.
 * Returns "svg", "png", or undefined if neither.
 */
export function getFileExtension(url?: string): string | undefined {
  if (!url) return undefined;
  // Remove query parameters (?foo=bar) and hash (#anchor)
  const cleanedUrl = url.split("?")[0].split("#")[0];
  // Extract the file extension
  const extension = cleanedUrl.split(".").pop()?.toLowerCase();

  return extension;
}
