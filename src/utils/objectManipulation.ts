import { ChangeEvent } from "react";
import { isNullable } from "@common/utils/booleansAndNullable";
import { isDate } from "@common/utils/dateManipulation";
import { isRegexValid } from "@common/utils/regex";
import { anonymizeStringWithReferencedFields, getSubstringFromNthDelimiter } from "@common/utils/stringManipulation";
import { getValueFromPath } from "@common/utils/objBasedExpressionEvaluation";
import safeStringify from "fast-safe-stringify";

export async function hashObject(obj: any): Promise<string> {
  // Convert object to string
  const str = JSON.stringify(obj);

  // Use Web Crypto API (browser-compatible)
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = crypto.subtle.digest("SHA-256", msgUint8);

  // Convert hash to hex string
  return hashBuffer.then((buf) => {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

// Recursively substitutes the values of keys in an object based on a dictionary.
export function substituteKeyValues(
  modifyObject: any,
  dictionary: Record<string, any>,
  workWithNestedValueKeys = false, // If a key matches and its value is an object like { value: "..." }, only substitute the inner "value".
  caseInsensitive = false
): any {
  if (Array.isArray(modifyObject)) {
    // If the item is an array, process each item recursively.
    return modifyObject.map((item) => substituteKeyValues(item, dictionary, workWithNestedValueKeys, caseInsensitive));
  }

  if (modifyObject === null || typeof modifyObject !== "object") {
    // If the item is a primitive, it cannot be processed further.
    return modifyObject;
  }

  // Create a new object to avoid mutating the original.
  const newObject: Record<string, any> = {};

  // Iterate over the keys of the object.
  for (const key in modifyObject) {
    if (Object.prototype.hasOwnProperty.call(modifyObject, key)) {
      const value = modifyObject[key];

      const isSpecialCase =
        workWithNestedValueKeys &&
        (caseInsensitive
          ? Object.keys(dictionary).some((dictKey: string) => key.toLowerCase() === dictKey.toLowerCase())
          : dictionary.hasOwnProperty(key)) &&
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.hasOwnProperty("value");

      if (isSpecialCase) {
        // The key is in the dictionary and its value is an object with its own 'value' property.
        // Recurse on this object, but with a special, temporary dictionary that targets only the inner 'value' key.
        newObject[key] = substituteKeyValues(value, { value: dictionary[key] }, workWithNestedValueKeys, caseInsensitive);
      } else if (
        caseInsensitive ? Object.keys(dictionary).some((dictKey: string) => key.toLowerCase() === dictKey.toLowerCase()) : dictionary.hasOwnProperty(key)
      ) {
        // The key is in the dictionary, so replace the value entirely.
        if (caseInsensitive) {
          const caseInsensitiveKey = Object.keys(dictionary).find((dictKey: string) => key.toLowerCase() === dictKey.toLowerCase());
          if (caseInsensitiveKey) {
            newObject[key] = dictionary[caseInsensitiveKey];
          }
        } else {
          newObject[key] = dictionary[key];
        }
      } else if (value !== null && typeof value === "object") {
        // The key is not in the dictionary, but the value is another object or array, so recurse into it.
        newObject[key] = substituteKeyValues(value, dictionary, workWithNestedValueKeys, caseInsensitive);
      } else {
        // The value is a primitive and its key is not in the dictionary, so just copy it.
        newObject[key] = value;
      }
    }
  }
  return newObject;
}

export const convertDateValuesToISO = (obj: { [key: string]: Record<string, any> }) => {
  const newObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isDate(value)) {
      newObj[key] = value.toISOString();
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
};

export function removeKeys<T>(obj: T, keysToRemove: string[]): T {
  // If obj is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map((item) => removeKeys(item, keysToRemove)) as unknown as T;
  }
  // If obj is a non-Date object, process each key
  else if (obj && typeof obj === "object" && !isDate(obj)) {
    const newObj: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      if (!keysToRemove.includes(key)) {
        newObj[key] = removeKeys((obj as Record<string, unknown>)[key], keysToRemove);
      }
    });
    return newObj as T;
  }
  // If obj is neither an object nor an array (or is a Date), return it as is
  else {
    return obj;
  }
}

export function removeKeysNotInArray(obj: any, keysToKeep: string[]): any {
  // If obj is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map((item) => removeKeysNotInArray(item, keysToKeep));
  }
  // If obj is an object, process each key
  else if (obj && typeof obj === "object" && !isDate(obj)) {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      // If the key is in the list, add it to the new object
      if (keysToKeep.includes(key)) {
        newObj[key] = removeKeysNotInArray(obj[key], keysToKeep);
      }
    });
    return newObj;
  }
  // If obj is neither an object nor an array, return it as is
  else {
    return obj;
  }
}

export const removeKeysAndFlatten = (obj: Record<string, any>, keyToRemove: string | string[]): Record<string, any> => {
  if (typeof keyToRemove === "string") {
    keyToRemove = [keyToRemove];
  }
  if (!obj) return {};
  const result = {};

  // Stack to keep track of objects to process
  let stack = [{ currentObj: obj, currentResult: result }] as { currentObj: Record<string, any>; currentResult: Record<string, any> }[];

  while (stack.length > 0) {
    const { currentObj, currentResult } = stack.pop()!;

    Object.keys(currentObj).forEach((key) => {
      const value = currentObj[key];
      if (keyToRemove.includes(key) && typeof value === "object" && !Array.isArray(value)) {
        // Merge the nested object's properties into the current result
        Object.keys(value).forEach((subKey) => {
          currentResult[subKey] = value[subKey];
        });
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // If it's an object and not one of the keys to remove, prepare to process further
        if (!currentResult[key]) currentResult[key] = {};
        stack.push({ currentObj: value, currentResult: currentResult[key] });
      } else {
        // If it's a normal property, just copy it over
        currentResult[key] = value;
      }
    });
  }

  return result;
};

export function renameKeys(
  obj: Record<string, any> | any[], //the object to rename keys of
  keyMap?: Record<string, string>, //the key map to rename keys with, keys are the old keys, values are the new keys
  renameFunction?: (key: string) => string //the function to rename keys with, if provided, this will override the keyMap
): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === "object" && item !== null) {
        return renameKeys(item, keyMap, renameFunction);
      } else {
        return item;
      }
    });
  } else if (obj && typeof obj === "object" && !isDate(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        let newKey = keyMap ? keyMap[key] || key : key;
        if (renameFunction) {
          newKey = renameFunction(newKey);
        }
        return [newKey, value];
      })
    );
  } else {
    return obj;
  }
}

export function renameKeysMap(obj: Record<string, any>, keyMap: Record<string, string>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [keyMap[key] || key, value]));
}

export const removeNthEntry = (obj: Record<string, any>, n: number) => {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be a non-null object");
  }

  const entries = Object.entries(obj);

  if (n < 0 || n >= entries.length) {
    throw new Error("Invalid index");
  }

  // Remove the nth entry
  entries.splice(n, 1);

  // Convert back to an object
  return Object.fromEntries(entries);
};

export function swapObjIndices(obj: Record<string, any>, index1: number, index2: number) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be a non-null object");
  }

  const entries = Object.entries(obj);

  // Validate indices
  if (index1 < 0 || index1 >= entries.length || index2 < 0 || index2 >= entries.length) {
    throw new Error("Invalid indices");
  }

  // Swap the entries
  [entries[index1], entries[index2]] = [entries[index2], entries[index1]];

  // Convert back to an object
  return Object.fromEntries(entries);
}

export function swapIndices(obj: any, index1: number, index2: number) {
  //if obj is an array, swap the elements at the given indices
  if (Array.isArray(obj)) {
    if (index1 < 0 || index1 >= obj.length || index2 < 0 || index2 >= obj.length) {
      throw new Error("Invalid indices");
    }
    [obj[index1], obj[index2]] = [obj[index2], obj[index1]];
    return obj;
  } else if (typeof obj === "object" && obj !== null) {
    //if obj is an object, swap the keys at the given indices
    return swapObjIndices(obj, index1, index2);
  } else {
    return obj;
  }
}

/**
 * Filters an object by keeping only specified keys and, optionally, replacing their values with a nested value.
 * Works recursively on nested objects.
 *
 * @param obj - The object to filter.
 * @param keysToKeep - An array of keys to keep.
 * @param skipRootLevelKeys - If true, skips filtering keys at the root level.
 * @param valueKey - If provided, replaces the value of kept keys with the value at this nested key.
 * @returns A new object with only the specified keys.
 */
export const filterKeysAndReplaceValues = (obj: any, keysToKeep: string[], skipRootLevelKeys: boolean = false, valueKey?: string): any => {
  // Helper function to perform recursion
  function helper(currentObj: any, atRootLevel: boolean): any {
    if (Array.isArray(currentObj)) {
      // If the current object is an array, recursively apply the helper to each element
      return currentObj.map((item) => {
        if (typeof item === "object" && item !== null) {
          return helper(item, false);
        } else {
          return item;
        }
      });
    } else if (typeof currentObj === "object" && currentObj !== null) {
      // For objects, filter the keys
      const newObj: any = {};
      for (const key in currentObj) {
        const value = currentObj[key];
        const shouldSkip = atRootLevel && skipRootLevelKeys;

        // Determine whether to keep the key
        const keepKey = shouldSkip || keysToKeep.includes(key);

        // Recurse into nested objects or handle value replacement
        let newValue;
        if (keepKey) {
          if (valueKey && typeof value === "object" && value !== null && valueKey in value) {
            // Replace the value with value[valueKey]
            newValue = value[valueKey];
          } else {
            // Keep the value as is or process it recursively
            newValue = typeof value === "object" && value !== null ? helper(value, false) : value;
          }
          newObj[key] = newValue;
        } else {
          if (!shouldSkip) {
            // Recurse into nested objects to continue filtering
            const nestedValue = typeof value === "object" && value !== null ? helper(value, false) : value;
            if (typeof nestedValue === "object" && nestedValue !== null && Object.keys(nestedValue).length > 0) {
              newObj[key] = nestedValue;
            }
          } else {
            // Keep the key as is when skipping root level keys
            newObj[key] = value;
          }
        }
      }
      return newObj;
    } else {
      // For primitives, return as is
      return currentObj;
    }
  }

  // Start the recursion at the root level
  return helper(obj, true);
};

// Function to remove keys not in the type
export function removeExtraKeys<T>(obj: any, allowedKeys: (keyof T)[]): T {
  const result: Partial<T> = {};
  for (const key of allowedKeys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result as T;
}

//given an object, it will return a new object with the additional duplicate KV pairs where the duplicate keys are renamed to be pastedKeyNames array
export const copyKeys = (obj: Record<string, any>, keysToCopy: string[], pastedKeyNames: string[]): Record<string, any> => {
  const newObj: Record<string, any> = { ...obj };
  keysToCopy.forEach((key, index) => {
    if (obj.hasOwnProperty(key)) {
      newObj[pastedKeyNames[index]] = obj[key];
    }
  });
  return newObj;
};

export function keepKeys(obj: any, keysToKeep: string[]): any {
  // If obj is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map((item) => keepKeys(item, keysToKeep));
  }
  // If obj is an object, process each key
  else if (obj && typeof obj === "object" && !isDate(obj)) {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      // If the key is in the list, add it to the new object
      if (keysToKeep.includes(key)) {
        newObj[key] = keepKeys(obj[key], keysToKeep);
      }
    });
    return newObj;
  }
  // If obj is neither an object nor an array, return it as is
  else {
    return obj;
  }
}

//note that slice is not inclusive of the end index, so plus 1 is needed
export function sumElements(array: number[], n?: number, initialValue: number = 0): number {
  if (n === undefined) n = array.length - 1;
  if (n < 0) return initialValue;
  const sum = array.slice(0, n + 1).reduce((acc: number, curr: number) => acc + curr, initialValue);
  return sum;
}

export function ObjectHasPath(obj: Record<string, any>, path: string[]): boolean {
  let current = obj;
  for (const key of path) {
    if (!current || current[key] === undefined) {
      return false;
    }
    current = current[key];
  }
  return true;
}

export const findKeyWithValue = (obj: Record<string, any>, value: any): Record<string, any> | undefined => {
  for (const key in obj) {
    if (obj[key] === value) {
      return { [key]: value };
    }
  }
  return undefined;
};

export function findObjectWithValueAtPath(obj: any[], path: string[], value: any): any {
  for (const item of obj) {
    if (getObjectValueByPath(item, path) === value) {
      return item;
    }
  }
  return undefined;
}

export function getObjectValueByPath(obj: Record<string, any>, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (!current || current[key] === undefined) {
      return undefined; // Or any default/fallback value
    }
    current = current[key];
  }
  return current;
}

//Returns validity of element in array
export function elementInArray(element?: any, array?: any[]): boolean {
  if (!array) return false;
  if (typeof element === "object" && element !== null) {
    for (let i = 0; i < array.length; i++) {
      //all array elems
      if (typeof array[i] === "object" && array[i] !== null) {
        //array elem is an object too lets compare
        if (isSubset(element, array[i])) {
          //the elem object is in the array object
          return true;
        }
      }
    }
    return false;
  } else {
    return array.includes(element);
  }
}

//Returns truth of obj1(or array) being a subset of obj2(or array). ie all of obj1's keys and respective values are in obj2. All works with checking if all array elements in obj1 are in obj2
export const isSubset = (
  obj1: Record<string, any> | any[] | undefined | null,
  obj2: Record<string, any> | any[] | undefined | null,
  ignoreKeys?: string[]
): boolean => {
  if (typeof obj1 === typeof obj1 && obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (
    Array.isArray(obj1) ||
    Array.isArray(obj2) ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    Object.keys(obj1).length > Object.keys(obj2).length
  ) {
    if (Array.isArray(obj1) && Array.isArray(obj2) && obj1.length > obj2.length) {
      return false;
    } else if (Array.isArray(obj1) && Array.isArray(obj2) && obj1.length <= obj2.length) {
      //There are the same or less items in array obj1 than array obj2
      //Go over all items in obj1 array and check if they are in obj2
      for (let i = 0; i < obj1.length; i++) {
        if (!elementInArray(obj1[i], obj2)) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    obj1 = obj1 as Record<string, any>;
    obj2 = obj2 as Record<string, any>;
    for (let key in obj1) {
      if (ignoreKeys && ignoreKeys.includes(key)) {
        continue;
      }
      if (!obj2.hasOwnProperty(key)) {
        return false;
      } else {
        if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
          if (!isSubset(obj1[key], obj2[key])) {
            return false;
          }
        } else if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }
    return true;
  }
};

export const objEqualObj = (obj1?: Record<string, any> | null, obj2?: Record<string, any> | null): boolean => {
  if (obj1 && !obj2) return false;
  else if (!obj1 && obj2) return false;
  else if (!obj1 && !obj2) return true;
  return isIdentical(obj1, obj2);
};

export const isIdentical = (
  obj1?: Record<string, any> | null | string | number | boolean,
  obj2?: Record<string, any> | null | string | number | boolean
): boolean => {
  // Handle case where obj1 or obj2 is null
  if ((obj1 === null && obj2 === null) || (obj1 === undefined && obj2 === undefined)) {
    return true;
  }

  // If one is null and the other isn't, return false
  if (obj1 === null || obj2 === null) {
    return false;
  }

  // Handle case where both are not objects
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    if (obj1 === obj2) {
      return true;
    } else {
      return false;
    }
  }

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // Check if both objects have the same number of keys
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  // Check if all keys in obj1 exist in obj2 and have the same values
  for (let key of obj1Keys) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }

    if (typeof obj1[key] === "object" && typeof obj2[key] === "object" && !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
      if (!isIdentical(obj1[key], obj2[key])) {
        return false;
      }
    } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      if (
        obj1[key].length !== obj2[key].length ||
        !obj1[key].every((val, index) => {
          if (typeof val !== "object") {
            return val === obj2[key][index];
          }
          isIdentical(val, obj2[key][index]);
        })
      ) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

export const elementBeforeOther = (array: any[], element: any, other: any): boolean => {
  const indexElement = array.indexOf(element);
  const indexOther = array.indexOf(other);
  return indexElement < indexOther;
};

//Return the entries of newObj that are different from prevObj
export function getDiffEntries(
  newObj: Record<string, any> | undefined,
  prevObj: Record<string, any> | undefined,
  isFalsyIsEqual: boolean = true
): Record<string, any> {
  if (!newObj) {
    return {};
  }
  if (!prevObj) {
    return newObj;
  }
  const diff: Record<string, any> = {};
  for (const [key, value] of Object.entries(newObj)) {
    //We consider undefined, null, and blank strings to be equal and therefore unchanged
    if (isFalsyIsEqual && elementInArray(value, [undefined, null, ""]) && elementInArray(prevObj[key], [undefined, null, ""])) {
      //items are equal, so skip
      continue;
    }
    if (typeof value === "object" && typeof prevObj[key] === "object") {
      //Recursively check for differences in nested objects
      const nestedDiff = getDiffEntries(value, prevObj[key]);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } //Is it a diff key or does the value differ from the previous object?
    else if (!prevObj.hasOwnProperty(key) || prevObj[key] !== value) {
      diff[key] = value;
    } else {
      continue;
    }
  }
  return diff;
}

// This function filters the keys of an object based on a suffix provided in the retainedKeys array.
// It creates a new object with keys that have the specified suffix and removes that suffix from the key in the new object.
export function filterObjectKeys(obj: Record<string, any>, retainedKeys: string[] = ["value"]) {
  let result: Record<string, any> = {};

  for (const key in obj) {
    const parts = key.split("_");
    const lastPart = parts[parts.length - 1];

    // Check if the last part of the key is in the list of retained keys
    if (retainedKeys.includes(lastPart)) {
      // Construct the new key by removing the last part and its preceding underscore
      const newKey = key.slice(0, -lastPart.length - 1);
      // Assign the value from the original object to the new key in the result object
      result[newKey] = obj[key];
    }
  }

  // Return the filtered object with modified keys
  return result;
}

// This function recursively flattens a nested object into a single-level object with concatenated keys.
// It retains specific nested values based on the retainedKeys array.
export function flattenObject(
  obj: Record<string, any>,
  parentKey: string = "",
  retainedKeys: string[] = ["value"],
  outerMost: boolean = true, // Indicates if this is the outermost call of the recursive function
  currentDepth: number = 1, // Add currentDepth parameter
  maxDepth: number = 6 // Add maxDepth parameter with default value
): Record<string, any> {
  let result: Record<string, any> = {};

  // Check if the current depth exceeds the maximum depth allowed
  if (currentDepth > maxDepth) {
    //return obj; // Return an empty object or handle as needed
  }

  for (const key in obj) {
    // Check if the value is an object that needs to be flattened
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recursively flatten the object
      const inner = flattenObject(obj[key], parentKey + key + "_", retainedKeys, false, currentDepth + 1, maxDepth);
      // Merge the flattened object into the result
      result = { ...result, ...inner };
    } else {
      // Construct the full key for the flattened object
      const fullKey = parentKey + key;
      // Check if the value is an object with a 'value' property to be retained
      if (obj[key] && typeof obj[key] === "object" && "value" in obj[key]) {
        if (retainedKeys.includes(fullKey)) {
          // Assign the 'value' property to the full key in the result object
          result[fullKey] = obj[key].value;
        }
      } else if (typeof obj[key] !== "object") {
        // Directly assign non-object values to the result object
        result[fullKey] = obj[key];
      }
    }
  }
  // If this is the outermost call, filter the keys of the result object
  if (outerMost) {
    return filterObjectKeys(result, retainedKeys);
  }
  // Return the result object for inner calls
  return result;
}

//An object has a depth of 1 if the object has no keys whose values are objects, else it has a depth of 2 or more
export const objectDepthMax = (obj: Record<string, any> | any, stopAtDepth?: number): number => {
  if (!obj || typeof obj !== "object") {
    return 0;
  }
  if (stopAtDepth !== undefined && stopAtDepth <= 0) {
    //We have gone deep enough and have likely reached maxDepth
    return 1;
  }
  if (Array.isArray(obj)) {
    //map over all elems and get that elems depth
    return 1 + Math.max(...obj.map((item) => objectDepthMax(item, stopAtDepth ? stopAtDepth - 1 : undefined)));
  }
  let depth = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      depth = Math.max(depth, objectDepthMax(obj[key], stopAtDepth ? stopAtDepth - 1 : undefined));
    }
  }
  return 1 + depth;
};

export const objectDepthGreaterThan = (obj: Record<string, any> | any, n: number = 1, currentDepth: number = 1): boolean => {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  //The object is indeed an object so it has depth of at least 1
  let maxDepth = currentDepth;

  for (const key in obj) {
    //Get the larger of the current depth or get any child objects depths and add to the current depth, then compare
    maxDepth = Math.max(maxDepth, currentDepth + objectDepthMax(obj[key], n - currentDepth)); //3-1=2
    if (maxDepth > n) {
      return true;
    }
  }
  return maxDepth > n;
};

export const atLeafObject = (obj: Record<string, any> | any): boolean => {
  return !objectDepthGreaterThan(obj, 1);
};

export const getNonEnumerableProps = (obj: Record<string, any> | any): Record<string, any> => {
  const regularObj: Record<string, any> = {};

  // Copy non-enumerable properties
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((prop) => {
    try {
      // Only copy if it's not a function
      if (typeof obj[prop] !== "function") {
        regularObj[prop] = obj[prop];
      }
    } catch {
      // Some properties may throw an error on access
    }
  });

  // Copy enumerable properties
  for (const key in obj) {
    try {
      regularObj[key] = obj[key];
    } catch {
      // Handle errors if any occur
    }
  }

  // Use Object.getOwnPropertyNames to get non-enumerable properties
  const allProps = Object.getOwnPropertyNames(event).reduce((acc: any, key: string) => {
    acc[key] = (event as any)[key];
    return acc;
  }, {});
  return allProps;
};

export const ErrorToObj = (error: Error | Record<string, unknown>) => {
  const errorFauxObj = error as Record<string, any>;
  const errorObj = {
    message: error instanceof Error ? safeStringify(error.message) : safeStringify(error),
    stack: error instanceof Error ? safeStringify(error.stack) : safeStringify(error),
    ...(errorFauxObj.hasOwnProperty("name") ? { name: errorFauxObj.name } : {}),
    ...(errorFauxObj.hasOwnProperty("cause") ? { cause: errorFauxObj.cause } : {}),
  };

  return errorObj;
};

//WIP
export const getKeyValuesNotBeyondDepth = (
  obj: Record<string, any> | any,
  maxDepth: number = 1,
  currentDepth: number = 1
): Record<string, any> | undefined => {
  if (currentDepth > maxDepth) {
    return undefined;
  }
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  let result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "object" && currentDepth < maxDepth) {
      const candidate = getKeyValuesNotBeyondDepth(value, maxDepth, currentDepth + 1);
    } else if (typeof value !== "object" && !Array.isArray(value)) {
      //we can keep it becuase does not go beyond the max depth
      result[key] = value;
    }
  }
  return result;
};

export const findKeyValueByPredicate = <T>(
  obj: Record<string, T>,
  keyPredicate: (key: string) => boolean,
  valuePredicate?: (value: any) => boolean,
  returnEntry: boolean = false
): T | Record<string, any> | undefined => {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      if (keyPredicate(key) && (!valuePredicate || valuePredicate(obj[key]))) {
        return returnEntry ? { [key]: obj[key] } : obj[key];
      }
    }
  }
  // If no key satisfies the predicate, return undefined
  return undefined;
};

export const spliceKeysAtSeparator = (obj: Record<string, any>, separator = "_"): Record<string, any> => {
  const renamedObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    // Extract the substring after the first underscore or use the original key if no underscore exists
    const newKey = key.includes(separator) ? key.split(separator)[1] : key;
    renamedObj[newKey] = obj[key];
  });

  return renamedObj;
};

export const mergeKeysByDelimiter = (data: Record<string, any>, delimiter: string, nth: number) => {
  const mergedObject: Record<string, any> = {};
  // Iterate over each key in the object
  for (const key of Object.keys(data)) {
    // Use regex to capture the part of the key up to the second underscore
    const subString = getSubstringFromNthDelimiter(key, delimiter, nth);
    if (subString) {
      //replace the ending substring with an empty string
      const newKey = key.replace(subString, "");
      ////console.log("prefix", prefix);
      //const newKey = key.replace(regex, prefix + '_'); // Replace up to the second underscore with the prefix and a single underscore
      //console.log("newKey", newKey);
      //console.log("data[key]", data[key], key.endsWith("_value"));
      // Check if the key ends with '_value', and use its value
      if (subString === "_value") {
        mergedObject[newKey] = data[key];
      } else if (subString === "_options" && Array.isArray(data[key]) && data[key].length > 0) {
        // If there's an '_options' key with a non-empty array, use the first element
        mergedObject[newKey] = data[key][0];
      } else if (!mergedObject.hasOwnProperty(newKey)) {
        // If no '_value' or non-empty '_options', set to empty string if not already set
        mergedObject[newKey] = "";
      }
    } else {
      // If the key does not match the pattern, it might not have a second underscore
      // We can decide to copy it as is or handle it differently
      mergedObject[key] = data[key];
    }
  }

  return mergedObject;
};

export const isObject = (obj: any, nullIsObject: boolean = false): boolean => {
  return (obj !== null && typeof obj === "object" && !Array.isArray(obj)) || (nullIsObject && obj === null);
};

export const deepMerge = (obj1: Record<string, any>, obj2: Record<string, any>, preferObj1 = true, nullIsValid = false) => {
  if (falseOrEmpty(obj1)) return obj2;
  if (falseOrEmpty(obj2)) return obj1;

  // Result object
  const result: Record<string, any> = {};

  // Combine keys from both objects
  new Set([...Object.keys(obj1), ...Object.keys(obj2)]).forEach((key) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Check if both are objects
    if (isObject(val1) && isObject(val2)) {
      result[key] = deepMerge(val1, val2, preferObj1); // Recursively merge
    } else if (Array.isArray(val1) && Array.isArray(val2)) {
      result[key] = [...new Set([...val1, ...val2])]; // Merge and remove duplicates
    } else if (val1 === val2) {
      result[key] = preferObj1 ? val1 : val2; // Choose based on the preferObj1 flag
    } else {
      // If only one exists or they are different, choose based on existence or preference
      result[key] = val2 === undefined || (((val1 !== undefined && val1 !== null) || (nullIsValid && val1 === null)) && preferObj1) ? val1 : val2;
    }
  });

  return result;
};

//loop over all keys, retain all unique keys and if key is in both keep the value of the one that is not null or undefined
export const mergeKeepNonNullOrUndefined = (obj1: Record<string, any> = {}, obj2: Record<string, any> = {}): Record<string, any> => {
  const result: Record<string, any> = {};

  // Combine keys from both objects
  new Set([...Object.keys(obj1), ...Object.keys(obj2)]).forEach((key) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Check if both are objects
    if (isObject(val1) && isObject(val2)) {
      result[key] = mergeKeepNonNullOrUndefined(val1, val2); // Recursively merge
    } else if (Array.isArray(val1) && Array.isArray(val2)) {
      result[key] = [...new Set([...val1, ...val2])]; // Merge and remove duplicates
    } else if (val1 === val2) {
      result[key] = val1; // Choose based on the preferObj1 flag
    } else {
      // If only one exists or they are different, choose based on existence or preference, keep val2 if it is not null or undefined
      result[key] = val2 === undefined || val2 === null ? val1 : val2;
    }
  });

  return result;
};

//Given a record obj we look to replace it with the value key in it, if no value key is found then we replace it with the first element or if no elements than undefined
export const removeRecordsRetainValues = (
  obj: Record<string, any> | Record<string, any>[] | any,
  keepParentObj: boolean = true,
  skipKey?: string
): Record<string, any> | undefined | any => {
  if (obj === null || obj === undefined) return undefined;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => removeRecordsRetainValues(item, false));
  }

  // Handle objects
  if (typeof obj === "object") {
    const newObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === skipKey) {
        continue;
      }

      // Recursively handle objects and arrays
      if (typeof value === "object" && value !== null) {
        newObj[key] = removeRecordsRetainValues(value, false);
      } else {
        newObj[key] = value;
      }

      // Directly return the value if 'value' key is found and `keepParentObj` is false
      if (key === "value" && !keepParentObj) {
        return value;
      }
    }

    // Return the modified object or the first value in the object if empty
    if (!keepParentObj) {
      if (Object.keys(newObj).length === 0) {
        return Object.values(obj)[0] ?? undefined;
      } else {
        return newObj;
      }
    }

    return newObj;
  }

  // Return primitive types as-is
  return obj;
};

//loop over an object and only keep the keys that are in the keysToKeep array
export const retainKeys = (
  obj: Record<string, any> | Record<string, any>[] | any,
  keysToKeep: string[],
  keepParentObj: boolean = true,
  recurse: boolean = false
): Record<string, any> | undefined | any => {
  if (obj === null || obj === undefined) return undefined;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => retainKeys(item, keysToKeep, true, recurse));
  }

  // Handle objects
  if (typeof obj === "object") {
    const newObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (keysToKeep.includes(key)) {
        // Recursively handle objects and arrays
        if (recurse && typeof value === "object" && value !== null) {
          newObj[key] = retainKeys(value, keysToKeep, false, recurse);
        } else {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }

  // Return primitive types as-is
  return obj;
};

export const retainKeysWithValues = (obj: Record<string, any>, values: any[]): Record<string, any> | undefined => {
  if (!obj) return undefined;
  const newObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (values.includes(value)) {
      newObj[key] = value;
    }
  }

  return newObj;
};

//creates a new record where the keys are the keys of the map and the value of that key is the value of the key in the map
//Please consider the key to be used as user facing labels, and values as the data to be used by system
export const newRecordFromKeys = (obj: Record<string, any>, map: Record<string, any>): Record<string, any> | undefined => {
  if (!obj) return undefined;
  const newObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(map)) {
    let newKey = undefined;
    //do we have a matching key in the object?
    if (obj.hasOwnProperty(key)) {
      newKey = obj[key];
      newObj[newKey] = undefined;
    }
    //Did we find a matching key and do we have a matching value as a key from our map in the object?
    if (newKey !== undefined && obj.hasOwnProperty(value)) {
      newObj[newKey] = obj[value];
    }
  }
  return newObj;
};

export function flattenObjectRetainValues(
  obj: Record<string, any> | any,
  parentKey: string = "",
  currentDepth: number = 1, // Current depth of the recursion
  maxDepth: number = 2, // Maximum depth you want to flatten
  skipKey?: string,
  ignoreKeysAtSkipKeyDepth?: boolean
): Record<string, any> {
  let result: Record<string, any> = {};

  if (typeof obj !== "object" || obj === null) return result;

  const objKeys = Object.keys(obj);

  for (const key in obj) {
    // Construct the full key for the flattened object
    const fullKey = parentKey + key;

    if (ignoreKeysAtSkipKeyDepth && skipKey && skipKey !== key && objKeys.includes(skipKey)) {
      continue;
    }

    // Check if the value is an object that needs to be flattened
    if ((skipKey && key === skipKey) || (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key]) && currentDepth < maxDepth)) {
      let inner: Record<string, any> = {};
      if (skipKey && key === skipKey) {
        // Skip the current key if it matches the skipKey
        inner = flattenObjectRetainValues(obj[key], parentKey, currentDepth, maxDepth, skipKey, ignoreKeysAtSkipKeyDepth);
      } else {
        // Recursively flatten the object
        inner = flattenObjectRetainValues(obj[key], fullKey + "_", currentDepth + 1, maxDepth, skipKey, ignoreKeysAtSkipKeyDepth);
      }
      result = { ...result, ...inner };
    } else {
      // Handle the assignment based on the presence of 'value' or 'options'
      if (obj[key] && typeof obj[key] === "object") {
        if ("value" in obj[key]) {
          result[fullKey] = obj[key].value;
        } else if ("options" in obj[key] && Array.isArray(obj[key].options) && obj[key].options.length > 0) {
          result[fullKey] = obj[key].options[0]; // Take the first element of the options array
        } else {
          result[fullKey] = ""; // Set to empty string if neither 'value' nor 'options' is present
        }
      } else {
        // Directly assign non-object values to the result object
        result[fullKey] = obj[key];
      }
    }
  }

  return result;
}

//TODO can this function be replace by existing functions?
export const fieldsObjectToHumanReadable = (data: Record<string, any>): string => {
  let result = "";

  for (const parentKey in data) {
    result += `${parentKey}:\n`;

    if (typeof data[parentKey] !== "object") {
      result += `\t${data[parentKey]}\n`;
      continue;
    } else if (typeof data[parentKey] === "object" && data[parentKey] !== null && !Array.isArray(data[parentKey])) {
      for (const subKey in data[parentKey]) {
        const subObject = data[parentKey][subKey];
        let value = "";
        if (subObject.hasOwnProperty("value")) {
          value = subObject.value;
        } else if (typeof subObject === "string") {
          value = subObject;
        }
        result += `\t${subKey}: ${value}\n`;
        if (typeof subObject === "object" && Object.keys(subObject).length > 1) {
          // Recursively call the function to handle other nested items, remove the 'value' key becuase we have already handled it
          result += fieldsObjectToHumanReadable(removeKeys(subObject, ["value"]));
        }
      }
    } else if (typeof data[parentKey] === "object" && data[parentKey] === null) {
      result += `\t${data[parentKey]}\n`;
      continue;
    } else if (Array.isArray(data[parentKey])) {
      for (const subKey in data[parentKey]) {
        const value = data[parentKey][subKey];
        result += `\t${subKey}: ${value}\n`;
      }
      continue;
    } else {
      result += `\t${data[parentKey]}\n`;
    }
  }

  return result;
};

/**
 * given an object, return true if it has a key in the object, otherwise return false,
 * @param obj
 * @param key
 * @param checkArrayForKeyAsElement
 * @returns boolean
 */
export const objHasKey = (obj: any, key: string, checkArrayForKeyAsElement: boolean = true): boolean => {
  if (!obj || typeof obj !== "object") return false;
  // Base case for arrays
  if (Array.isArray(obj)) {
    // If checkArrayForKeyAsElement is true, check if key exists as an element in the array
    if (checkArrayForKeyAsElement) {
      return obj.includes(key);
    }
    // If the array contains objects, check each object recursively
    for (const item of obj) {
      if (typeof item === "object" && item !== null && objHasKey(item, key, checkArrayForKeyAsElement)) {
        return true;
      }
    }
    return false;
  }

  // Base case for objects
  if (typeof obj === "object" && obj !== null) {
    // If the key is found at the current level, return true
    if (obj.hasOwnProperty(key)) {
      return true;
    }

    // Recursively check all nested objects
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        const value = obj[k];
        if (typeof value === "object" && value !== null) {
          if (objHasKey(value, key, checkArrayForKeyAsElement)) {
            return true;
          }
        }
      }
    }
  }

  // If the key was not found, return false
  return false;
};

export const objHasValue = (obj?: Record<string, any> | null, value?: any | null): boolean => {
  if (!obj || typeof obj !== "object") return false;

  for (const key in obj) {
    if (obj[key] === value) {
      return true;
    }
    if (typeof obj[key] === "object" && objHasValue(obj[key], value)) {
      return true;
    }
  }

  return false;
};

export const objHasKeysOtherThan = (obj: Record<string, any>, keys: string[]): boolean => {
  for (const key in obj) {
    if (!keys.includes(key)) {
      return true;
    }
  }
  return false;
};

export const objHasElementAtIndex = (
  obj: Record<string, any> | any[] | any[][],
  index: number = 0,
  nullableIsValid: boolean = true,
  emptyArrayIsNull: boolean = false
): boolean => {
  if (Array.isArray(obj)) {
    if (index < obj.length) {
      if (nullableIsValid) {
        return true;
      } else {
        return !isNullable(obj[index], emptyArrayIsNull);
      }
    }
  }
  if (typeof obj === "object" && !Array.isArray(obj)) {
    obj = obj as Record<string, any>;
    const keys = Object.keys(obj);
    const keyAtIndex = keys[index];
    if (keyAtIndex) {
      if (nullableIsValid) {
        return true;
      } else {
        if (obj[keyAtIndex]) {
          return !isNullable(obj[keyAtIndex]);
        }
      }
    }
  }
  return false;
};

/**
 * Checks if `newObj` is "deep-equal" to any object already in `arr`.
 * If not, we push `newObj` onto `arr` and return the updated array.
 *
 * @param arr        The existing array of objects
 * @param newObj     The object we want to add only if unique
 * @returns          The updated array (which may or may not have been appended)
 */
export function insertIfUniqueElemSimple<T extends object>(arr: T[] | null | undefined, newObj: T): T[] {
  if (!arr) return [newObj];
  // If array is empty, just push
  if (arr.length === 0) {
    arr.push(newObj);
    return arr; // Return the array, not the push result
  }

  // We'll do a quick deep comparison by JSON.stringify.
  // If your data has Dates or other non-JSON types, consider a custom comparator instead.
  const newStr = JSON.stringify(newObj);

  // Check if there's any identical object in the array
  const alreadyExists = arr.some((existing) => {
    return JSON.stringify(existing) === newStr;
  });

  // If none are identical, push the newObj
  if (!alreadyExists) {
    arr.push(newObj);
  }

  // Return the same array reference (mutated in place)
  return arr;
}

export const isArray = (obj: any): obj is any[] => {
  return typeof obj === "object" && Array.isArray(obj);
};

export const getRecordAtIndex = (obj: Record<string, any> | any[], index: number): any => {
  if (Array.isArray(obj)) {
    return obj[index]; // Returns undefined if index is out of bounds
  }

  if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj);
    return keys[index] !== undefined ? (obj as Record<string, any>)[keys[index]] : undefined;
  }

  return undefined;
};

//returns the value of the key in the object, if the key is not found then it returns the default value
export const getObjectKeysValue = (obj: Record<string, any> | undefined, key: string, recurse: boolean = true, allowRegex = false): any => {
  if (!obj) return undefined;
  let defaultValue: any = undefined;
  let foundValue: any = undefined;
  //loop over object keys
  for (const [k, v] of Object.entries(obj)) {
    //if the key matches then return the value
    if (k === key) {
      foundValue = v;
    }
    if (k === "default") {
      defaultValue = v;
    }
    if (allowRegex && isRegexValid(k)) {
      const regex = new RegExp(k);
      if (regex.test(key)) {
        foundValue = v;
      }
    }
    if (foundValue !== undefined) {
      break;
    }
  }
  if (
    recurse &&
    ((foundValue !== undefined && typeof foundValue === "object") ||
      (foundValue === undefined && defaultValue !== undefined && typeof defaultValue === "object"))
  ) {
    const value = getObjectKeysValue(foundValue !== undefined ? foundValue : defaultValue, key, recurse, allowRegex);
    if (value) {
      return value;
    }
  }
  return foundValue !== undefined ? foundValue : defaultValue !== undefined ? defaultValue : null;
};

export const getObjectKeyNames = (obj: Record<string, any> | any, recurse: boolean = false): string[] => {
  if (!obj) return [];
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    keys.push(key);
    if (recurse && typeof value === "object") {
      keys = keys.concat(getObjectKeyNames(value, recurse));
    }
  }
  return keys;
};

export const getObjectKeyNamesThatMatchFilterKeys = (
  obj: Record<string, any> | any,
  filterKeys: string[],
  objectKeyModifierFn?: (key: string) => string,
  recurse?: boolean // not implemented yet, would use a for loop to go over sub objects and call this function (ex: getObjectKeyNames)
): string[] => {
  if (!obj || !filterKeys || !Array.isArray(filterKeys)) return [];
  const result = Object.keys(obj).filter((originalKey) => {
    let modifiedKey;
    modifiedKey = objectKeyModifierFn ? objectKeyModifierFn(originalKey) : originalKey;
    return filterKeys.includes(modifiedKey);
  });
  return result;
};

//return object that contains a key with a specific value
export const getObjectWithKeyValue = (obj: any, key: string, value: any): Record<string, any> | null => {
  if (Array.isArray(obj)) {
    // If it's an array, iterate through each element
    for (const element of obj) {
      const result = getObjectWithKeyValue(element, key, value);
      if (result) return result;
    }
  } else if (obj !== null && typeof obj === "object") {
    // If it's an object, check if this object has the key-value pair
    if (obj[key] === value) {
      return obj;
    }
    // Otherwise, iterate through each property of the object
    for (const subKey in obj) {
      const result = getObjectWithKeyValue(obj[subKey], key, value);
      if (result) return result;
    }
  }
  // If no match is found or the item is neither an array nor an object
  return null;
};

export const getFirstValidKeyValue = (obj: Record<string, any> | undefined, keys: string[], fallback = null, ifObjCheckValue?: string) => {
  if (!obj) return fallback;
  // Iterate through the array of keys
  for (const key of keys) {
    // Check if the current key exists in the object
    if (obj.hasOwnProperty(key)) {
      if (ifObjCheckValue && obj[key].hasOwnProperty(ifObjCheckValue)) {
        return obj[key][ifObjCheckValue];
      } else {
        // Return the value of the first existing key
        return obj[key];
      }
    }
  }
  // Return the fallback value if none of the keys exist in the object
  return fallback;
};

export const createObjFromObjFormat = (objFormat: Record<string, any> | string[], relatedObjects?: Record<string, any>): Record<string, any> => {
  // keys in the obj are the keys of objFormat, the values are the values of the keys in the relatedObjects, it may use dot notion to get the value
  const objResult: Record<string, any> = {};
  if (!relatedObjects) return objResult;
  if (Array.isArray(objFormat)) {
    return (objFormat as string[]).map((key) => relatedObjects[key]);
  }
  for (const [key, value] of Object.entries(objFormat)) {
    const valueResult = getValueFromPath(relatedObjects, value);
    objResult[key] = valueResult;
  }
  return objResult;
};

export const runFunctionOnEachValue = (obj: Record<string, any> | any[] | any, func: (value: any) => any): Record<string, any> | any[] => {
  // Check if the object is an array
  if (Array.isArray(obj)) {
    // If it's an array, map over each element and apply the function
    return obj.map(func);
  } else if (obj !== null && typeof obj === "object") {
    // If it's an object, create a new object with the same keys and apply the function to each value
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[key] = runFunctionOnEachValue(obj[key], func);
    }
    return result;
  } else {
    // If it's neither an array nor an object, apply the function directly
    return func(obj);
  }
};

export const consoleLogObject = (obj: any, withTimeStamp = false) => {
  if (withTimeStamp) {
    console.log(new Date().toISOString());
  }
  console.log(JSON.stringify(obj, null, 2));
};

export const renameObjectKeys = (obj: Record<string, any>, keyMap: Record<string, string>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Use the key mapping to rename the keys
    const newKey = keyMap[key] || key;
    result[newKey] = value;
  }
  return result;
};

export const renameObjectKeysFoundInArray = (obj: Record<string, any>, keyMap: Record<string, string[]>): Record<string, any> => {
  //given a keymap where the values are string[], replace all keys that are in the string[] with the key
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // use the key mapping to rename the keys
    for (const [newKey, oldKeys] of Object.entries(keyMap)) {
      if (oldKeys.includes(key)) {
        result[newKey] = value;
      }
    }
  }
  return result;
};

export const renameObjectKeysTypeSafe = <T extends Record<string, any>, U extends Record<string, string>>(
  obj: T,
  keyMap: U
): Omit<T, keyof U> & { [K in keyof U]: T[U[K]] } => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key as keyof U] || key;
    acc[newKey] = obj[key];
    return acc;
  }, {} as any);
};

type RemoveKeys<T, K extends keyof T> = Omit<T, K>;

export const removeKeysTypeSafe = <T extends Record<string, any>, K extends (keyof T)[]>(obj: T, keysToRemove: K): RemoveKeys<T, K[number]> => {
  const result = { ...obj } as RemoveKeys<T, K[number]>;
  keysToRemove.forEach((key) => {
    delete (result as T)[key]; // Cast 'result' back to T to allow deletion
  });
  return result;
};

export const setKeyValues = (obj: Record<string, any>, keyValues: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = { ...obj };
  for (const [key, value] of Object.entries(keyValues)) {
    result[key] = value;
  }
  return result;
};

export const removeEmptyValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== "" && value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export const removeEntriesWithValues = (obj?: Record<string, any>, values?: any[], caseSensitive: boolean = true): Record<string, any> | undefined => {
  if (!obj || !values || values.length === 0) {
    return obj;
  }
  if (!caseSensitive) {
    values = values.map((value) => value.toLowerCase());
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!values.includes(!caseSensitive ? value.toLowerCase() : value)) {
      result[key] = value;
    }
  }
  return result;
};

export function unDef(value: any): value is undefined {
  return value === undefined;
}

export function unDefOrNull(value: any): value is undefined | null {
  return value === undefined || value === null;
}

export const falseOrEmpty = (value: any): value is null | undefined | false | "" | 0 | [] | Record<string, never> | typeof NaN => {
  if (!value) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "number" && isNaN(value)) return true;
  return false;
};

export const trueAndNotEmpty = <T>(value: T): value is Exclude<T, null | undefined | false | "" | 0 | [] | Record<string, never> | typeof NaN> => {
  return !falseOrEmpty(value);
};

export const hasElements = (obj: Record<string, any> | any[] | any): boolean => {
  if (!obj) return false;
  if (Array.isArray(obj)) {
    return obj.length > 0;
  }
  return Object.keys(obj).length > 0;
};

//removes all values in that are already in the array, or entries that have the same value.
export const removeDuplicates = (obj: Record<string, any> | any[]): Record<string, any> | any[] => {
  const result: Record<string, any> = {};
  if (Array.isArray(obj)) {
    return Array.from(new Set(obj));
  }
  const uniqueValues = new Set();
  for (const [key, value] of Object.entries(obj)) {
    if (!uniqueValues.has(value)) {
      result[key] = value;
      uniqueValues.add(value);
    }
  }
  return result;
};

//removes all values in that are already in the array, or entries that reference the same object in a circular reference.
export const removeCircularReferences = (obj: Record<string, any> | any[]): Record<string, any> | any[] => {
  //safeStringify(obj);
  const objString = safeStringify(obj);
  const objNoCircular = JSON.parse(objString) as Record<string, any> | any[];
  return objNoCircular;
};

export const removeDuplicatesWithMatchingKeyValues = <T>(
  obj: T[],
  keys?: string[],
  caseSensitive: boolean = true,
  requireAllKeys: boolean = true //require all key values to match to be removed
): T[] => {
  const result: T[] = [];
  if (Array.isArray(obj)) {
    if (obj.length <= 1) return obj;
    //loop over all the elements in the array, if the element does not share a key value with any other element then keep it
    for (const [index, elem] of obj.entries()) {
      let allDiff = true; // assume all are unique
      let foundDiff = false; // for proving atleast one is unqiue
      for (const [index2, elem2] of obj.entries()) {
        if (index !== index2) {
          if (typeof elem === "object" && typeof elem2 === "object") {
            //if keys is specified only check those keys, else check all keys
            if (keys && keys.length > 0) {
              for (const key of keys) {
                if (
                  (elem as Record<string, any>).hasOwnProperty(key) &&
                  (elem2 as Record<string, any>).hasOwnProperty(key) &&
                  ((elem as Record<string, any>)[key] === (elem2 as Record<string, any>)[key] ||
                    (!caseSensitive &&
                      typeof (elem as Record<string, any>)[key] === "string" &&
                      typeof (elem2 as Record<string, any>)[key] === "string" &&
                      (elem as Record<string, any>)[key].toLowerCase() === (elem2 as Record<string, any>)[key].toLowerCase()))
                ) {
                  allDiff = false;
                  if (!requireAllKeys) {
                    break;
                  }
                } else {
                  //The value of these keys are diff
                  foundDiff = true;
                }
              }
            } else {
              //check all keys
              for (const key in elem) {
                if ((elem as Record<string, any>)[key] === (elem2 as Record<string, any>)[key]) {
                  allDiff = false;
                  if (!requireAllKeys) {
                    break;
                  }
                } else {
                  //The value of these keys are diff
                  foundDiff = true;
                }
              }
            }
            if (!requireAllKeys && !allDiff) {
              break;
            }
          } else {
            //not an object so just check if the values are the same
            if (elem === elem2) {
              allDiff = false;
              break;
            }
          }
        }
      }
      //end of checking against other objs
      if ((!requireAllKeys && allDiff) || (requireAllKeys && foundDiff)) {
        result.push(elem);
      }
    }
  }

  return result;
};

export const combineToArray = (item1: any, item2: any): any[] => {
  if (Array.isArray(item1) && Array.isArray(item2)) {
    return [...item1, ...item2];
  }
  if (Array.isArray(item1)) {
    return [...item1, item2];
  }
  if (Array.isArray(item2)) {
    return [item1, ...item2];
  }
  return [item1, item2];
};

export const countSumOfArray = (array: number[]): number => {
  return array.reduce((acc, curr) => acc + curr, 0);
};

export const arrayHasElementsWithContent = (array: any[]): boolean => {
  //loop over each item
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    //if the item is an array, then check if it has elements with content
    if (Array.isArray(item)) {
      if (arrayHasElementsWithContent(item)) {
        return true;
      }
    } else if (typeof item === "object") {
      //if the item is an object, then check if it has elements with content
      if (Object.keys(item).length > 0) {
        return true;
      }
    } else if (item !== undefined && item !== null) {
      return true;
    }
  }
  return false;
};

export const elementWithKeyInArray = (array: any[], key: string): boolean => {
  return array.some((item) => item.hasOwnProperty(key));
};

export const numElementsTrue = (array: boolean[]): number => {
  return array.filter((item) => item).length;
};

export const filterArrayByBooleanArray = <T>(array: T[], booleans?: boolean[]): T[] => {
  if (!array || !booleans) return [];
  return array.filter((_, index) => index < booleans.length && booleans[index]);
};

export const updateEntries = (obj?: Record<string, any>, keyValues?: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = { ...obj };
  if (!keyValues) return result;

  //loop over all new keyValues and update the result only if the key exists in the object
  for (const [key, value] of Object.entries(result)) {
    if (keyValues.hasOwnProperty(key)) {
      result[key] = keyValues[key];
    }
  }
  return result;
};

export const updateDependentValueByBehaviour = (
  prevObj: Record<string, any>,
  KeyToUpdate: string,
  NewValues: string | any[],
  updateBehaviour: string = "replace"
): Record<string, any> => {
  let newObj;

  if (!updateBehaviour || updateBehaviour === "replace") {
    newObj = { ...prevObj, [KeyToUpdate]: NewValues };
  } else if (updateBehaviour.includes("append")) {
    if (Array.isArray(prevObj[KeyToUpdate])) {
      newObj = { ...prevObj, [KeyToUpdate]: [...prevObj[KeyToUpdate], ...NewValues] };
    } else {
      newObj = { ...prevObj, [KeyToUpdate]: NewValues };
    }
  } else {
    console.warn("updateDependentValueByBehaviour: Invalid updateBehaviour");
    newObj = updateDependentValueByBehaviour(prevObj, KeyToUpdate, NewValues, "replace");
  }

  return newObj;
};

interface GenerateEventOptions {
  value: any;
  name: string;
}

export function generateEvent({ value, name }: GenerateEventOptions): ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  const event = {
    target: {
      value: value,
      name: name, // Priority: registerName > id > name
    },
  } as unknown as ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  return event;
}

/**
 * Move the value at the source path to the destination path in the object.
 * @param obj The object to update.
 * @param sourcePath The path to the value to move.
 * @param destinationPath The path to move the value to.
 * @param retainKey Whether to retain the key at the source path.
 * @returns The updated object.
 */

export const moveValueAtPathToPath = (
  obj: Record<string, any>,
  sourcePath: string[],
  destinationPath: string[],
  retainKey = false
): Record<string, any> => {
  const sourceValue = getObjectValueByPath(obj, sourcePath);
  if (sourceValue === undefined) {
    return obj;
  }

  let newObj = { ...obj };
  newObj = removeValueAtPath(newObj, sourcePath);
  newObj = setValueByPath(newObj, destinationPath, sourceValue);

  return newObj;
};

export const removeValueAtPath = (obj: Record<string, any>, path: string[]): Record<string, any> => {
  if (path.length === 0) {
    return obj;
  }

  const key = path[0];
  if (path.length === 1) {
    const newObj = { ...obj };
    delete newObj[key];
    return newObj;
  }

  const value = obj[key];
  if (value === undefined || value === null) {
    return obj;
  }

  const newValue = removeValueAtPath(value, path.slice(1));
  if (newValue === value) {
    return obj;
  }

  return {
    ...obj,
    [key]: newValue,
  };
};

export const setValueByPath = (obj: Record<string, any>, path: string[], value: any): Record<string, any> => {
  if (path.length === 0) {
    // Assign the value directly to the root object
    return { ...obj, ...value };
  }

  const key = path[0];
  if (path.length === 1) {
    return {
      ...obj,
      [key]: value,
    };
  }

  const currentValue = obj[key];
  if (currentValue === undefined || currentValue === null) {
    return {
      ...obj,
      [key]: setValueByPath({}, path.slice(1), value),
    };
  }

  const newValue = setValueByPath(currentValue, path.slice(1), value);
  if (newValue === currentValue) {
    return obj;
  }

  return {
    ...obj,
    [key]: newValue,
  };
};

/*
schema
: 
additionalProperties
: 
false
properties
: 
reports
: 
additionalProperties
: 
false
properties
: 
{}
required
: 
[]
type
: 
"object"
[[Prototype]]
: 
Object
[[Prototype]]
: 
Object
required
: 
['reports']
type
: 
"object"
*/
/*
 * Count the number of keys in a TemplateSchemaForAI object.
 * @param obj The object to count the keys of.
 * @returns The number of keys in the object.
 * */
export const getNumKeysTemplateSchemaForAI = (obj: Record<string, any>): number => {
  //OPENAI schemas have an object with a key for additionalProperties, properties, required, and type
  //Recursively loop over all properties and count the number of keys inside the properties object that is of type of than object
  let numKeys = 0;
  if (obj.hasOwnProperty("properties")) {
    const properties = (obj as Record<string, any>).properties;
    if (properties) {
      for (const key of Object.keys(properties)) {
        numKeys += getNumKeysTemplateSchemaForAI(properties[key]);
      }
    }
  } else if (obj.hasOwnProperty("type")) {
    const type = (obj as Record<string, any>).type;
    if (type !== "object") {
      numKeys += 1;
    }
  }
  return numKeys;
};

/*
 * Count the length of key and value strings in a JSON object.
 * @param obj The object to count the length of.
 * @param includeQuotes Whether to include the quotes around the key and value strings.
 * @returns The total length of the key and value strings.
 * */
export const getLengthJSONStringContent = (obj: Record<string, any> | string, includeQuotes: boolean = false): number => {
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj) as Record<string, any>;
    } catch (e) {
      return 0;
    }
  }

  let totalLength = 0;

  function traverse(obj: Record<string, any> | any) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        traverse(item);
      }
    } else if (obj !== null && typeof obj === "object") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Count key length
          let keyLength = key.length;
          if (includeQuotes) {
            keyLength += 2; // For quotes around key
          }
          totalLength += keyLength;

          const value = obj[key];
          if (typeof value === "string") {
            // Count value length
            let valueLength = value.length;
            if (includeQuotes) {
              valueLength += 2; // For quotes around value
            }
            totalLength += valueLength;
          } else if (typeof value === "object" && value !== null) {
            traverse(value);
          } else if (Array.isArray(value)) {
            traverse(value);
          } else if (typeof value === "number") {
            totalLength += value.toString().length;
          } else if (typeof value === "boolean") {
            totalLength += value ? 4 : 5; // true or false
          } else if (typeof value === "undefined") {
            totalLength += 9; // undefined
          } else {
            totalLength += 4; // null
          }
        }
      }
    } else if (typeof obj === "string") {
      let valueLength = obj.length;
      if (includeQuotes) {
        valueLength += 2; // For quotes around value
      }
      totalLength += valueLength;
    }
  }

  traverse(obj);
  return totalLength;
};

export const countElements = (array: any[]) => {
  let total = 0;

  function traverse(element: any) {
    if (Array.isArray(element)) {
      for (const item of element) {
        traverse(item as any);
      }
    } else {
      total += 1;
    }
  }

  traverse(array);
  return total;
};

export const countElementsThatMeetPredicate = (array: any[], predicate: (element: any) => boolean): number => {
  let count = 0;
  for (const element of array) {
    if (predicate(element)) {
      count++;
    }
  }
  return count;
};

export function countUniqueStrings(input: any[]): number {
  const uniqueStrings = new Set<string>();

  function traverseArray(array: any[]): void {
    for (const element of array) {
      if (typeof element === "string") {
        uniqueStrings.add(element);
      } else if (Array.isArray(element)) {
        traverseArray(element); // Recursively traverse nested arrays
      }
    }
  }

  traverseArray(input);
  return uniqueStrings.size; // Return the count of unique strings
}

export const listObjectFields = (obj?: Record<string, any>, anonymizeValues?: Record<string, string>): string => {
  let result = "";
  if (!obj) return result;
  for (let [key, value] of Object.entries(obj)) {
    //if the string is empty, skip it and don't add it to the prompt
    if (!value) continue;
    if (anonymizeValues) {
      value = anonymizeStringWithReferencedFields(value, anonymizeValues);
    }
    result += `${key}: ${value}\n`;
  }
  if (result) {
    result += "\n";
  }
  return result;
};

/*
 * Returns the value specified by the i,j indices in a 2D array. if the indices are out of bounds, it returns the last element in the row.
 * @param obj The object to check.
 * @returns Whether the object is empty.
 * */

export function safelyGetOverflowIndicesFrom2dArray<T>(array?: (T | T[])[], i?: number, j?: number, undefinedIfOverflow: boolean = false): T | undefined {
  if (array === undefined) return undefined;
  if (!Array.isArray(array)) return array;

  if (i === undefined) return undefined;

  // Check if the i-th element is within bounds
  if (i < array.length) {
    const element = array[i];

    // If the i-th element is an array, handle the j-th index
    if (Array.isArray(element)) {
      return j !== undefined
        ? j < element.length
          ? element[j] // Return the element at [i][j] if within bounds
          : element[element.length - 1] // Return the last element in the row if j overflows
        : undefined; // If j is not provided, return undefined for a nested array
    } else {
      return element; // If not an array, return the i-th element
    }
  }

  // If i overflows, fall back to the last element
  const lastIdx = array.length - 1;
  const lastElement = array[lastIdx];

  // If the last element is an array, handle the j-th index
  if (Array.isArray(lastElement)) {
    return safelyGetOverflowIndicesFrom2dArray(lastElement, j ?? 0); // Recursively call the function with the last element as the new array
  }

  return lastElement as T | undefined; // Return the last element directly if it's not an array
}

export const isRef = (obj: any): boolean => {
  return typeof obj === "object" && obj !== null && "current" in obj;
};

export const unWrapRef = (obj: any): any => {
  while (isRef(obj)) {
    obj = obj.current;
  }
  return obj;
};

export function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64); // Decode Base64 to binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // Convert binary string to Uint8Array
  }
  return bytes;
}

export function compareUint8Arrays(arr1: Uint8Array, arr2: Uint8Array) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export function arrayEndsWithArray(array1: any[], array2: any[]) {
  //checks that array1 has same elements as array2 in the same order from end of array2 towards start of array2
  for (let i = array2.length - 1; i >= 0; i--) {
    if (array1[array1.length - 1 - (array2.length - 1 - i)] !== array2[i]) {
      return false;
    }
  }
  return true;
}

export function toSerializableObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}
