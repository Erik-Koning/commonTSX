import { AxiosError } from "axios";

// Type guard function (optional, but good practice)
export function isAxiosError(error: any): error is AxiosError {
  // Add more checks if needed, e.g., error.isAxiosError
  return error && typeof error === "object" && "response" in error && "name" in error && error.name === "AxiosError";
}
