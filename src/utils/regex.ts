//regex to match 2 or more colons, text and a fwd slash. used in aws arn partitions, 'arn:aws:securityhub:us-east-1::standards/aws-foundational-security-best-practices/v/1.0.0
export const arnPartitionRegex: RegExp = /:{2,}[A-Za-z]+\//;

export const combineRegexPatterns = (patterns: (string | RegExp | undefined)[]): RegExp => {
  // Filter out any undefined or null patterns
  const validPatterns = patterns.filter((p): p is string | RegExp => p != null);

  // Extract the pattern source from RegExp objects, or use the string directly.
  const sources = validPatterns.map((p) => (p instanceof RegExp ? p.source : p));

  // Collect all unique flags (like 'i' for case-insensitive) from the regexes.
  const flags = [
    ...new Set(
      validPatterns
        .filter((p): p is RegExp => p instanceof RegExp)
        .map((p) => p.flags)
        .join("")
    ),
  ].join("");

  return new RegExp(sources.join("|"), flags);
};

export const isRegexValid = (pattern: string): boolean => {
  try {
    const newPattern = new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
};

export const stringToRegex = (string: string | RegExp | undefined): RegExp | undefined => {
  if (string === undefined || string === null) return undefined;
  if (!string) return new RegExp("");
  if (string instanceof RegExp) return string;
  if (string === "*") return new RegExp(".*");
  if (isValidRegexString(string)) {
    const lastSlashIndex = string.lastIndexOf("/");
    const pattern = string.slice(1, lastSlashIndex);
    const flags = string.slice(lastSlashIndex + 1);
    return new RegExp(pattern, flags ?? undefined);
  } else {
    return undefined;
  }
};

export const isValidRegexString = (pattern: string | RegExp): boolean => {
  if (pattern instanceof RegExp) return true;
  if (pattern === "*") return true;
  const regexPattern = /^\/(?:\\\/|[^\/])*\/[gimsuy]*$/;
  return regexPattern.test(pattern);
};

export const isInstanceOfRegExp = (pattern: string | RegExp): pattern is RegExp => {
  return pattern instanceof RegExp;
};

export const getFirstRegexMatchArray = (input: string, regexArray: RegExp[], longerRegexFirst: boolean = false): RegExpExecArray | null => {
  if (longerRegexFirst) {
    regexArray = [...regexArray.slice().sort((a, b) => b.source.length - a.source.length)];
  }

  for (let i = 0; i < regexArray.length; i++) {
    const regex = removeGlobalFlag(regexArray[i]);
    const match = regex.exec(input);
    if (match) {
      return match;
    }
  }
  return null;
};

/**
 * gets all text before the first regex match in a string.
 * @param {string} input - The input string to be processed.
 * @param {RegExp} regex - The regular expression to match.
 * @param {boolean} keepMatch - Optional parameter to keep the match in the result. Default is false.
 * @returns {string} - The processed string.
 */
export const getBeforeMatch = (input: string, regex: RegExp, keepMatch: boolean = false): string => {
  const match = regex.exec(input);
  if (!match) return input; // If no match, return the input string as is

  const matchIndex = match.index;
  const matchLength = match[0].length;

  if (keepMatch) {
    return input.substring(0, matchIndex + matchLength);
  } else {
    return input.substring(0, matchIndex);
  }
};

/**
 * get all text after the first regex match in a string.
 * @param {string} input - The input string to be processed.
 * @param {RegExp} regex - The regular expression to match.
 * @param {boolean} keepMatch - Optional parameter to keep the match in the result. Default is false.
 * @returns {string} - The processed string.
 */
export const getAfterMatch = (input: string, regex: RegExp, keepMatch: boolean = false): string => {
  const match = regex.exec(input);
  if (!match) return ""; // If no match, return an empty string

  const matchIndex = match.index;
  const matchLength = match[0].length;

  if (keepMatch) {
    return input.substring(matchIndex);
  } else {
    return input.substring(matchIndex + matchLength);
  }
};

export const removeGlobalFlag = (regex: RegExp): RegExp => {
  return new RegExp(regex.source, regex.flags.replace("g", ""));
};

export const ensureGlobalFlag = (regex: RegExp) => {
  // Check if 'g' is already included in the flags
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  // Create a new RegExp with the same pattern and updated flags
  return new RegExp(regex.source, flags);
};

export interface CustomRegExpExecArray extends Array<string> {
  index: number;
  input: string;
}

/**
 * Creates a custom RegExpExecArray-like object.
 * @param matches - An array of matched strings.
 * @param index - The index at which the match was found.
 * @param input - The input string against which the match was made.
 * @returns A custom object that mimics RegExpExecArray.
 */
export const createCustomRegExpExecArray = (matches: string[], index: number, input: string): CustomRegExpExecArray => {
  const result = matches as CustomRegExpExecArray;
  result.index = index;
  result.input = input;
  return result;
};
