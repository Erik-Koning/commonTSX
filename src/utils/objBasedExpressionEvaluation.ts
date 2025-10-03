import { objHasValue } from "./objectManipulation";

/**
 * Evaluates the 'hidden' condition for a field.
 * @param {Object} hiddenObj - The hidden condition object.
 * @param {*} fieldValue - The value of the field being evaluated.
 * @param {Object} relatedObjects - Other related objects that may be referenced in the conditions.
 * @returns {boolean} - True if the field should be hidden, false otherwise.
 */
export function evaluateObjectBasedExpression(
  hiddenObj: Record<string, any>,
  fieldValue: any,
  relatedObjects: Record<string, any>,
  logicalOperator: string = "and"
): boolean {
  if (typeof hiddenObj !== "object" || hiddenObj === null) {
    return false;
  }

  const keys = Object.keys(hiddenObj);

  if (keys.length === 0) {
    return false;
  }

  const results = [...Array(keys.length)].map(() => false);

  keys.forEach((key, index) => {
    const conditionValue = hiddenObj[key];
    results[index] = evaluateCondition(key, conditionValue, fieldValue, relatedObjects);
  });
  return evaluateBooleanArray(results, logicalOperator);
}

export const evaluateBooleanArray = (results: boolean[], logicalOperator: string): boolean => {
  if (logicalOperator === "and") {
    return results.every((result) => result);
  } else if (logicalOperator === "or") {
    return results.some((result) => result);
  } else if (logicalOperator === "not") {
    if (results.length > 0) {
      //treat as an "and" operation and then negate the result
      return !results.every((result) => result);
    }
    return !results;
  } else {
    console.warn(`Unknown logical operator: ${logicalOperator}`);
    return false;
  }
};

/**
 * Evaluates a single condition.
 * @param {string} conditionKey - The condition operator (e.g., 'length', 'matches').
 * @param {*} conditionValue - The value to compare against.
 * @param {*} fieldValue - The value of the field being evaluated.
 * @param {Object} relatedObjects - Other related objects that may be referenced.
 * @returns {boolean} - Result of the condition evaluation.
 */
function evaluateCondition(conditionKey: string, conditionValue: any, fieldValue: any, relatedObjects: Record<string, any>): boolean {
  let relatedValue: any;
  switch (conditionKey) {
    case "length":
      if (Array.isArray(fieldValue) || typeof fieldValue === "string") {
        return fieldValue.length === conditionValue;
      } else {
        return false;
      }
    case "matches":
      relatedValue = getValueFromPath(relatedObjects, conditionValue);
      if (Array.isArray(fieldValue)) {
        // Check if fieldValue includes relatedValue
        return fieldValue.includes(relatedValue);
      } else {
        return fieldValue === relatedValue;
      }
    case "includes":
      relatedValue = getValueFromPath(relatedObjects, conditionValue);
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((value) => {
          if (typeof value === "object") {
            return objHasValue(value, relatedValue);
          } else {
            return value === relatedValue;
          }
        });
      } else if (typeof fieldValue === "object") {
        if (fieldValue.hasOwnProperty(conditionValue)) {
          return fieldValue[conditionValue].includes(relatedValue);
        } else if (conditionValue.includes(".")) {
          const path = conditionValue.split(".");
          const value = getValueFromPath(fieldValue, path);
          console.log("value", value);
          console.log("fieldValue", fieldValue);
          console.log("relatedValue", relatedValue);

          if (!value) return !relatedValue ? true : false;
          return value.includes(relatedValue);
        }
        return false;
      } else if (relatedValue === undefined) {
        return false;
      } else {
        return fieldValue.includes(relatedValue);
      }

    case "and":
    case "or":
    case "not":
      // Handle nested logical operators
      return evaluateObjectBasedExpression(conditionValue, fieldValue, relatedObjects, conditionKey);
    default:
      console.warn(`Unknown condition: ${conditionKey}`);
      return false;
  }
}

/**
 * Retrieves a value from an object based on a dot-separated path.
 * @param {Object} obj - The object to retrieve the value from.
 * @param {string} path - The dot-separated path string (e.g., 'office.id').
 * @returns {*} - The value at the specified path, or undefined if not found.
 */
export function getValueFromPath(obj: Record<string, any> | any[], path: string | (string | number)[]): any {
  const pathParts = Array.isArray(path) ? path : path.split(".");
  let value = obj;
  //Loop through the path parts and get the value
  for (let part of pathParts) {
    //we are getting the value from an object or an array, if not, return undefined
    if (typeof value !== "object" || value === null) {
      return undefined;
    }
    //if the value is an array and the part is a number, get the value from the array
    if (Array.isArray(value) && typeof part === "number") {
      value = value[part] as any;
      //if the value is an object and the part is a string, get the value from the object
    } else if (!Array.isArray(value) && typeof part !== "number" && value && (value as Record<string, any>)?.[part]) {
      value = (value as Record<string, any>)[part];
    } else {
      return undefined;
    }
  }
  return value;
}
