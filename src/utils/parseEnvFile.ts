import fs from "fs";

export type EnvironmentVariablesType = Record<string, string>;

export function parseEnvFile(filePath: string, excludeKeys: string[]): EnvironmentVariablesType {
  const envObject: EnvironmentVariablesType = {};
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Split the content by new lines
    const lines = fileContent.split("\n");

    // Iterate over each line
    for (let line of lines) {
      // Trim whitespace and skip if empty or starts with a comment
      line = line.trim();
      if (!line || line.startsWith("#")) continue;

      // Split each line by the first '='
      const [key, ...values] = line.split("=");

      // Skip if key is in the exclude list
      if (key && excludeKeys.includes(key.trim())) continue;

      // Join the values back together in case there are multiple '=' in the value
      const value = values.join("=").trim();

      //Remove leading and trailing quotes if they exist
      const trimmedValue = value.replace(/^"(.*)"$/, "$1");

      // Set the value in the object, even if it's an empty string
      envObject[key.trim()] = trimmedValue;
    }
  } catch (error) {
    console.error("Error reading the .env file:", error);
  }
  return envObject;
}
