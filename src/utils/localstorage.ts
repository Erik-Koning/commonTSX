import { deepMerge } from "./objectManipulation";

// Function to save data to local storage
export const saveDataToLocalStorage = (key: string, data: any, merge: boolean = false) => {
  /*const dataToStore = {
    tabs: { ...data },
    timestamp: Date.now(), // Add a timestamp
  };
  */
  //if append and the key exists, merge the subkeys
  if (typeof data === "object" && merge && localStorage.getItem(key)) {
    const storedData = getDataFromLocalStorage(key);
    try {
      if (storedData && typeof storedData === "object") {
        data = { ...deepMerge(data, storedData) };
      }
    } catch (e) {
      console.log("error parsing stored data", storedData);
    }
  }

  if (typeof data === "object") {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    localStorage.setItem(key, data);
  }
};

export const isDataInLocalStorage = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};

// Function to get data from local storage
export const getDataFromLocalStorage = (key: string): Record<string, any> | null => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData) as Record<string, any>;
    } catch (e) {
      console.log("error parsing stored data", storedData);
      return null;
    }
  }
  return null;
};

export const updateDataInLocalStorage = (key: string, newData: any, overwrite: boolean = false): void => {
  const storedData = getDataFromLocalStorage(key);
  if (storedData) {
    const updatedData = overwrite ? { ...newData } : { ...deepMerge(newData, storedData) };
    saveDataToLocalStorage(key, updatedData);
  } else {
    saveDataToLocalStorage(key, newData); // Save if not already present
  }
};

export const getDataWithTimestampFromLocalStorage = (key: string) => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return null;
};

export const removeDataFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const clearLocalStorage = (): void => {
  localStorage.clear();
};

export const listAllKeysInLocalStorage = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
};

export const getMostRecentKeyFromLocalStorage = (parentKey?: string): string | null => {
  //if a parent key is given, get all keys inside the parent key
  if (parentKey) {
    const parentObj = getDataFromLocalStorage(parentKey);
    if (!parentObj) return null;
    const keys = Object.keys(parentObj);
    if (keys.length > 0) {
      const mostRecentKey = keys.reduce((a, b) => (a > b ? a : b));
      return mostRecentKey;
    }
    return null;
  }
  //if no parent key is given, get the most recent key
  const keys = listAllKeysInLocalStorage();
  if (keys.length > 0) {
    const mostRecentKey = keys.reduce((a, b) => (a > b ? a : b));
    return mostRecentKey;
  }
  return null;
};

export const getMostRecentNKeyDataFromLocalStorage = (key: string, n: number, timeLimitSeconds?: number): Record<string, any> => {
  let result: Record<string, any> = {};
  const parentObj = getDataFromLocalStorage(key);
  if (!parentObj) return [];
  //The keys are timestamps, in unix time
  const keys = Object.keys(parentObj);
  let mostRecentKeys = keys
    .map(Number) // Convert strings to numbers
    .sort((a, b) => b - a) // Sort numerically in descending order
    .map(String);
  mostRecentKeys = mostRecentKeys.slice(0, n);
  //Check if the first key is a valid timestamp
  const firstKey = mostRecentKeys[0];
  const firstKeyTimestamp = parseInt(firstKey);
  if (firstKey && typeof firstKey === "string" && firstKey.length === 10 && !isNaN(parseInt(firstKey))) {
    //loop over all mostRecentKeys from the most recent to the oldest and remove all keys that are older than the timeLimit
    for (let i = 0; i < mostRecentKeys.length; i++) {
      const key = mostRecentKeys[i];
      if (key && typeof key === "string" && key.length === 10 && !isNaN(parseInt(key))) {
        const timestamp = parseInt(key);
        if (timeLimitSeconds !== undefined && timestamp < firstKeyTimestamp - timeLimitSeconds) {
          //The keys are now beyond the timeLimit, ignore them
          break;
        }
        //Merge the data from the key
        result = deepMerge(result, parentObj[key], true, false);
      } else {
        //invalid key skip it
        continue;
      }
    }
  }

  return result;
};

export const keyExistsInLocalStorage = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};
