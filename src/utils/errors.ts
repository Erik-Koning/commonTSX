import { Prisma } from "@/app-core/prisma/prismadb";
import { isDevEnv } from "./environments";
import safeStringify from "fast-safe-stringify";

export const userFacingErrorMsg = (err: any, fallbackMsg?: string, formatErrorMsg: boolean = true): string => {
  if (isDevEnv()) console.error("userFacingErrorMsg", err);
  let message = "";
  if (typeof err === "string") {
    message = err;
  } else if (typeof err === "object") {
    if (err?.response?.data?.message) {
      message = userFacingErrorMsg(err.response.data.message, fallbackMsg, false);
    } else if (err?.response?.data?.error) message = userFacingErrorMsg(err.response.data.error, fallbackMsg, false);
    else if (err?.message && typeof err.message === "string") {
      message = err.message;
    }
  }

  if (!message) {
    message = fallbackMsg ?? "We encountered an error. If this persists, please contact support.";
  }
  if (formatErrorMsg) {
    message = formatUserErrorMsg(message);
  }
  if (!message) {
    message = fallbackMsg ?? "We encountered an error. If this persists, please contact support.";
  }

  return message;
};

export const getUserFacingPrismaError = (error: string | Prisma.PrismaClientKnownRequestError | unknown): string | undefined => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const cause = error.cause;
    if (typeof cause === "string") {
      error = cause;
    }
  } else if (typeof error === "string") {
    const match = error.match(/^No '([^']+)' record\(s\)/);
    if (match) {
      return `No ${match[1].toLowerCase()} attached to your account`;
    }
  }
  return undefined;
};

export const formatUserErrorMsg = (msg: string, maxLength: number = 80): string => {
  if (!msg) return "";

  if (typeof msg !== "string") {
    try {
      msg = safeStringify(msg);
    } catch (error) {
      console.error("safeStringify error formatting error message ", msg, "Error:\n", error);
      return "";
    }
  }

  // trim the message to the max length
  msg = msg.length > maxLength ? msg.substring(0, maxLength) + "..." : msg;

  // Remove the "Error: " prefix from the error message
  msg = msg.replace(/(Error: |Error:)/g, "");

  // Remove any trailing periods
  msg = msg.replace(/\.$/, "");

  // Capitalize the first letter
  msg = msg.charAt(0).toUpperCase() + msg.slice(1);

  return msg;
};

/**
 * Retries a Prisma transaction if a write conflict or deadlock occurs.
 * @param promiseFn The function that returns the Prisma promise to execute.
 * @param maxRetries The maximum number of times to retry.
 * @param retryDelay The base delay between retries in milliseconds.
 * @returns The result of the Prisma query.
 */
export async function retryPromise<T>(promiseFn: () => Promise<T>, retries: number = 3, delay: number = 40): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await promiseFn();
    } catch (error) {
      console.error("retryPromise error, running function:", promiseFn.name || "[anonymous]", promiseFn.toString(), "Error:\n", error);
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError ?? new Error("retryPromise failed after all retries");
}
