"use server";

import safeStringify from "fast-safe-stringify";
import fs from "fs";
import path from "path";
import { isDevEnv } from "./environments";

export const saveObjectToFile = (
  obj: any,
  name: string = process.env.NEXT_PUBLIC_APP_DOMAIN_NAME ?? "Unknown Obj",
  dirPath: string = process.cwd(),
  flag: string = "w"
): string => {
  try {
    // Convert the global object to a string
    // Uses fast-safe-stringify to avoid circular references
    const objString = safeStringify(obj);

    // Define the path where you want to save the file
    const filePath = path.join(dirPath, `${name}-object.txt`);

    // Write the string to a file
    fs.writeFileSync(filePath, objString, { encoding: "utf-8", flag: flag });

    console.log(`${name} object saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving ${name} object:`, error);
  }

  return "Done";
};

/**
 * saveStateChangeLog is a server action that writes state/prop/hook changes to a local log file.
 *
 * @param changes - An object containing the keys that changed and their new values.
 * @param logFilePath - Optional custom log file path. Defaults to "<project root>/stateChanges.log".
 */
export async function saveStateChangeLog(changes: Record<string, any>, logFilePath?: string): Promise<void> {
  if (!isDevEnv()) {
    throw new Error("saveStateChangeLog can only be used in development mode");
  }
  const filePath = logFilePath ?? path.join(process.cwd(), "stateChanges.log");

  const logEntry = {
    timestamp: new Date().toISOString(),
    changes,
  };
  const logLine = safeStringify(logEntry) + "\n";

  try {
    fs.appendFileSync(filePath, logLine, { encoding: "utf-8" });
    console.log("Saved state changes:", logEntry);
  } catch (error) {
    console.error("Error writing state change log:", error);
  }
}
