import formatFormGeneratorFields, {
  containsReferencedFields,
  getAllReferencedFieldDetails,
  parseNestedFields,
  referencedFieldsRegex,
} from "@common/components/formGenerator/formatGeneratorData";
import { evaluateExpression } from "./expressionEvaluator";
import { falseOrEmpty, objHasElementAtIndex } from "./objectManipulation";
import { removeGlobalFlag } from "./regex";
import {
  appendWithSingleSpaceBetween,
  arrayElemInString,
  isAcronym,
  isStartOfHeading,
  isStartOfSentence,
  replaceStringAtIndicesWithText,
} from "./stringManipulation";
import { DateFormat } from "./dateManipulation";

const replaceReferencedFields = (template: string, replacements: string[], enforceStrictReferencedField: boolean = false) => {
  let field_idx = -1;
  //start at the beginning of the string and move along
  for (let i = 0; i < replacements.length; i++) {
    //get the first available referencedField
    const match = parseNestedFields(template, undefined, undefined, undefined, enforceStrictReferencedField);

    if (!match || !match[0]) {
      //no more matches
      break;
    }

    //replace the referenced field with the replacement
    template = replaceStringAtIndicesWithText(template, [[Number(match.index), Number(match.index + match[0].length)]], [replacements[i]]);
  }
  return template;
};

export function spliceStringFromKey(
  spliceIds: string[],
  spliceIndicies: number[][],
  spliceDelimiters: (string | null)[],
  replacementString: string,
  key: string
) {
  // if the key is in the ids array then we know that we need to splice the replacement
  if (spliceIds && spliceIds.includes(key)) {
    //get the index of the splice
    const spliceIndex = spliceIds.indexOf(key);
    if (spliceDelimiters && spliceDelimiters[spliceIndex] !== null) {
      replacementString = replacementString.split(spliceDelimiters[spliceIndex])[spliceIndicies[spliceIndex][0]];
    } else {
      //get the indicies of the splice
      const replacementLength: number = replacementString.length;
      const spliceStart = spliceIndicies[spliceIndex][0] < 0 ? replacementLength + spliceIndicies[spliceIndex][0] : spliceIndicies[spliceIndex][0];
      const spliceEnd = spliceIndicies[spliceIndex][1] < 0 ? replacementLength + spliceIndicies[spliceIndex][1] : spliceIndicies[spliceIndex][1];
      //get the string that we want to splice
      replacementString = replacementString.slice(spliceStart, spliceEnd === replacementLength - 1 ? undefined : spliceEnd + 1);
    }
  }
  return replacementString;
}

export const spliceStringByIndiciesAndDelimiters = (spliceString: string, spliceIndicies: number[], spliceDelimiter?: string | null) => {
  if (spliceDelimiter !== null && spliceDelimiter !== undefined) {
    return spliceString.split(spliceDelimiter)[spliceIndicies[0]];
  } else {
    if (spliceIndicies.length === 0) return spliceString;
    //get the indicies of the splice
    const replacementLength: number = spliceString.length;
    const spliceStart = spliceIndicies[0] < 0 ? replacementLength + spliceIndicies[0] : spliceIndicies[0];
    const spliceEnd = spliceIndicies[1] < 0 ? replacementLength + spliceIndicies[1] : spliceIndicies[1];
    //get the string that we want to splice
    return spliceString.slice(spliceStart, spliceEnd === replacementLength - 1 ? undefined : spliceEnd + 1);
  }
};

export function replacePlaceholders(
  template: string,
  data: Record<string, any>,
  regex?: RegExp,
  enforceStrictReferencedField?: boolean,
  depth?: number,
  maxReplacePlaceholdersDepth?: number,
  config?: {
    dateFormat?: DateFormat;
  }
): string;
export function replacePlaceholders(
  template: Record<string, any>,
  data: Record<string, any>,
  regex?: RegExp,
  enforceStrictReferencedField?: boolean,
  depth?: number,
  maxReplacePlaceholdersDepth?: number,
  config?: {
    dateFormat?: DateFormat;
  }
): Record<string, any>;
export function replacePlaceholders(
  template: string | Record<string, any>,
  data: Record<string, any>,
  regex: RegExp = referencedFieldsRegex,
  enforceStrictReferencedField: boolean = true,
  depth: number = 0,
  maxReplacePlaceholdersDepth?: number,
  config?: {
    dateFormat?: DateFormat;
  }
): string | Record<string, any> {
  if (typeof template === "object") {
    // If the template is an object, recursively process its values
    const result: Record<string, any> = {};
    for (const key in template) {
      if (template.hasOwnProperty(key)) {
        const value = template[key];
        // Recursively call replacePlaceholders on the value

        //if (key.toLowerCase().includes("preamble")) debugger;

        result[key] =
          !maxReplacePlaceholdersDepth || depth <= maxReplacePlaceholdersDepth
            ? //recursively replace the placeholders
              replacePlaceholders(value, data, regex, enforceStrictReferencedField, depth + 1, maxReplacePlaceholdersDepth, config)
            : //if we have reached the max depth, return the value as is
              value;
      }
    }

    return result;
  } else if (typeof template === "string") {
    //for lowercasing or uppercasing the values
    const personPlaceThing = [
      "firstName",
      "lastName",
      "dentist",
      "lawyer",
      "professional",
      "name",
      "user",
      "date",
      "time",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "zip",
      "country",
      "website",
      "place",
      "location",
      "event",
    ];

    //if (template.toLowerCase().includes("pronouns")) debugger;

    /*if (
      template ===
        "Thank you for the referral of {patient_firstName} {patient_lastName}. It was a pleasure to meet with {patient_pronouns</1>} and I appreciate the opportunity to be involved in {patient_pronouns</2> === Hers ? Her : {patient_pronouns</2> === Theirs ? Their : {patient_pronouns</2>}}} treatment. Please see below for summary of our appointment. More information can be found on additional pages/attachments as applicable." ||
      template === "{patient_pronouns</0> === 'They' ? 'Dr. Smith' : 'Dr. Smitha'}"
    )
      //debugger;
      */
    //TODO if no matchs are found, then no referenced fields in this string??

    // If the template is a string, check for splice identifiers inside placeholders, this is the function that parses out the referenced fields for ids, indicies, delimiters, and special logic
    //splices is the index start and index end of the splice
    const {
      ids: fieldIds, //all field ids extracted in order as appear in the template
      fieldIndicies, //the indicies of the referenced fields in the template including the curly braces
      spliceIndicies: spliceIndicies, //the indicies to use for selecting the replacement string from the referenced field once split via the delimiters
      delimiters: spliceDelimiters, //the delimiters of the splice in the referenced fields
      operationLogic: operationLogic, //the operation logic to determine final replacement string from the referenced fields
    } = getAllReferencedFieldDetails(template, regex ? [regex] : undefined, true, enforceStrictReferencedField);

    //todo possible we dont need the below becuase the template.replace will replace all the placeholders regardless of their content and additional flags
    //template = removeSplicedTokensFromReferencedFields(template);
    let index = 0;
    // perform the regex now and replace the placeholders with the data, this regex will run over the entire string and replace all placeholders

    //loop over the template and replace all the placeholders with the data
    //loop over all the referenced fields, note some might have nesting so we loop by getting indicies from the match = parseNestedFields(input.substring(i));

    //array to hold resultant of the placeholder replacements, size is length of the fieldIds
    let replacements: string[] = new Array(fieldIds.length);
    for (let i = 0; i < fieldIds.length; i++) {
      //loop over each referenced field and replace it with the data
      const match = template.substring(fieldIndicies[i][0], fieldIndicies[i][1] + 1);

      if (match === "{patient_pronouns</2> === Hers ? Her : {patient_pronouns</2>} === Theirs ? Their : {patient_pronouns</2>}}") {
        //debugger;
      }

      let replacement: string = "";
      const fieldId = fieldIds[i];

      //if we have a replacement that is in our dataset we can replace with it
      if (data && data.hasOwnProperty(fieldId)) {
        replacement = String(data[fieldId]);

        const firstWord = replacement.split(" ")[0];
        const replacementShouldUpperCase =
          isStartOfSentence(template, fieldIndicies[i][0]) ||
          isStartOfHeading(template, fieldIndicies[i][0] - 1) || //minus 1 to not consider the curly brace reference field notation as a heading
          arrayElemInString(personPlaceThing, fieldId) ||
          isAcronym(firstWord) ||
          firstWord.toUpperCase() === "I";

        //are there any splices in the replacement
        if (objHasElementAtIndex(spliceIndicies, i, false, true) && objHasElementAtIndex(spliceDelimiters, i, false, true)) {
          if (falseOrEmpty(spliceIndicies) || falseOrEmpty(spliceDelimiters)) {
            console.error("spliceIndicies or spliceDelimiters is empty", spliceIndicies, spliceDelimiters);
          }

          //proceed to splice the replacement
          replacement = spliceStringByIndiciesAndDelimiters(String(replacement), spliceIndicies[i], spliceDelimiters[i]) ?? "";
        } else if (objHasElementAtIndex(spliceIndicies, i, false, true)) {
          //if there are no delimiters, then we splice the replacement from the indicies
          replacement = spliceStringByIndiciesAndDelimiters(String(replacement), spliceIndicies[i]) ?? replacement;
        }
        if (objHasElementAtIndex(operationLogic, i, false, true)) {
          //if it has operation logic, there is a possibility that the replacement has a nested referenced field
          if (replacement && replacement.length > 0 && containsReferencedFields(replacement, regex)) {
            //replace the nested referenced fields
            replacement = replacePlaceholders(replacement, data, regex, enforceStrictReferencedField, undefined, undefined, config);
          }
          //the operation logic is a string that is to be evaluated such as " === 'They' ? 'Dr. Smith' : 'Dr. Smitha'}"
          if ((operationLogic[i] !== null && containsReferencedFields(operationLogic[i]), regex)) {
            operationLogic[i] = replacePlaceholders(String(operationLogic[i]), data, regex, enforceStrictReferencedField, undefined, undefined, config);
          }
          //evaluate the expression via an AST node tree, with the replacement(start of the operation) and the operation logic together, this will return the final replacement
          replacement = evaluateExpression(appendWithSingleSpaceBetween(replacement, operationLogic[i]), replacement);
        }
        if (replacement && replacement.length > 0) {
          //if the replacement is at the start of a sentence, or the key is noun, capitalize it
          if (replacementShouldUpperCase) {
            replacement = replacement[0].toUpperCase() + replacement.slice(1);
          } else {
            //if the replacement is not at the start of a sentence, and not in the toLowerCaseKeysIgnore array, lowercase it
            //lowercase the replacement
            replacement = replacement[0].toLowerCase() + replacement.slice(1);
          }
        }
      } else {
        console.warn("replacePlaceholders: key not found in data", fieldId);
      }
      index++;

      // If a value is found, use it; otherwise, see if the formatFormGeneratorFields function can format the key, if it can't then it return's an empty string
      replacements[i] =
        replacement !== undefined && replacement !== null
          ? (replacement as any)
          : //checks other referenced fields such as {TODAY} and {NOW}, and removes any unfound from there
            formatFormGeneratorFields(match, undefined, undefined, undefined, true, config);
    }
    //we have the replacements in order, now we can replace the placeholders with the replacements
    template = replaceReferencedFields(template, replacements, enforceStrictReferencedField);
    return template;
  } else {
    console.warn("replacePlaceholders: template is not a string or object", template);
    return template;
  }
}

//removes leading tags such as <Regular Follow-up and Treatment> inside "<Regular Follow-up and Treatment>Please continue to see {patient_firstName} for reg"
export const removeLeadingShortformTags = (str: string): string => {
  return str.replace(/^<.*?>/, "");
};
