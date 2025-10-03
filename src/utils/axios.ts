import axios from "axios";
import { wait } from "./timers";

export const tryAxiosMultiple = async (
  method: "post" | "get",
  url: string,
  data: Record<string, any>,
  maxAttempts = 3,
  delayBetweenAttempts?: number,
  cancelIfResDataObjContainsKey?: string[]
): Promise<Record<string, any> | undefined> => {
  let attempts = 0;
  let res;
  while (attempts < maxAttempts) {
    try {
      res = await axios[method](url, data);
      return res; // Return the response on success
    } catch (error: any) {
      const responseKeys = Object.keys(error.response.data);
      if (responseKeys.some((value: string) => cancelIfResDataObjContainsKey?.includes(value))) {
        throw error;
      }
      attempts++;
      console.error(`Attempt ${attempts} failed: ${error}`);
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to reach ${url}`);
      }
      if (delayBetweenAttempts) {
        await wait(delayBetweenAttempts);
      }
    }
  }
  return res;
};
