import { useCallback, useEffect, useRef } from "react";
import fs from "fs";
import { isDevEnv } from '../utils/environments';
import path from "path";
import safeStringify from "fast-safe-stringify";
import { saveStateChangeLog } from '../utils/fileSystem';
import { isRef, objectDepthGreaterThan, unWrapRef } from '../utils/objectManipulation';

interface LoggerOptions {
  logFilePath?: string; // Path to the log file. Defaults to "stateChanges.log" in the current directory.
  debug?: boolean; // Whether to also log to the console. Defaults to true.
}

// Helper to safely stringify objects (handles circular references)
function trySafeStringify(value: any): string {
  try {
    return safeStringify(value);
  } catch (error) {
    return "[Unstringifiable]";
  }
}

/**
 * useStateChangeLogger is a debugging hook that you can use to log changes in values
 * (such as state, props, or any hook-derived values) across renders.
 * Only available in development mode.
 *
 * @param monitoredValues An object containing all the values you want to watch.
 * @param options Optional configuration for the logger.
 * @throws Error if called outside of development mode
 */
export function useStateChangeLogger(monitoredValues: Record<string, any>, options?: LoggerOptions) {
  if (!isDevEnv()) {
    throw new Error("useStateChangeLogger can only be used in development mode");
  }

  //const { logFilePath = "stateChanges.log", debug = true } = options || {};
  const fileBuffer = useRef<string[]>([]);
  const previousValuesRef = useRef<Record<string, any> | null>(null);
  const debouncedChange = useRef<NodeJS.Timeout>(null);
  const skipNChanges = useRef(40);

  /*const debouncedHandleChange = useCallback(
    (changes: Record<string, { previous: any; current: any }>) => {
      // Clear any existing timeout
      if (debouncedChange.current) {
        clearTimeout(debouncedChange.current);
      }

      //Add the changes to the file buffer
      //add a timestamp line to the buffer
      fileBuffer.current.push(`${new Date().toISOString()}: ${JSON.stringify(changes)}`);
      //the previous to buffer
      fileBuffer.current.push("Previous");
      for(Object.entries(changes))

      // Set new timeout
      debouncedChange.current = setTimeout(() => {
        console.log("debouncedHandleChange", event.target.value);
        saveStateChangeLog(changes, logFilePath);
      }, 1000);
    },
    []
  );*/

  // If previous values exist, compare them to current monitoredValues and record differences.
  if (previousValuesRef.current && skipNChanges.current <= 0) {
    const previousValues = previousValuesRef.current;
    const changes: Record<string, { previous: any; current: any }> = {};

    for (const key in monitoredValues) {
      if (isRef(monitoredValues[key])) {
        monitoredValues[key] = unWrapRef(monitoredValues[key]);
      }
      if (isRef(previousValues[key])) {
        previousValues[key] = unWrapRef(previousValues[key]);
      }
      if (objectDepthGreaterThan(monitoredValues[key], 9) || objectDepthGreaterThan(previousValues[key], 9)) {
        console.log("OBJ to big, Skipping", key, monitoredValues[key], previousValues[key]);
        continue;
      }
      console.log("key*****", key, monitoredValues[key], previousValues[key]);
      const currentValue = trySafeStringify(monitoredValues[key]);
      const previousValue = trySafeStringify(previousValues[key]);
      if (currentValue === "[Unstringifiable]" || previousValue === "[Unstringifiable]") {
        console.log("Unstringifiable", key, currentValue);
        continue;
      }

      if (
        (typeof monitoredValues[key] === "object" && typeof previousValues[key] === "object" && currentValue !== previousValue) ||
        (typeof monitoredValues[key] !== "object" && typeof previousValues[key] !== "object" && currentValue !== previousValue) ||
        typeof monitoredValues[key] !== typeof previousValues[key]
      ) {
        changes[key] = {
          previous: previousValues[key],
          current: monitoredValues[key],
        };
      }
    }

    // If there are changes, append the changes with a timestamp to the log file.
    if (Object.keys(changes).length > 0) {
      //debouncedHandleChange(changes);
      console.log("changes12345", changes);
    }
  }
  skipNChanges.current--;
  console.log("skipNChanges", skipNChanges.current);

  // Update previousValuesRef for the next render.
  previousValuesRef.current = { ...monitoredValues };
}
