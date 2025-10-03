import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NextRouter } from "next/router";
import { navigateToPath } from "./DOM";
import { currentUrl } from "./window";
import { ensureUniqueDelimiterBetweenStrings } from "./stringManipulation";

//Download the file
export const handleDownloadUrlClick = async (linkUrl: string, linkName: string) => {
  try {
    const response = await fetch(String(linkUrl));
    console.info("handleDownloadUrlClick response", response);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = linkName;
    console.log("link", link);
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed for:", linkName, error);
  }
};

//add or update the params key values in the path sections of a url string
export function appendURLParams(path: string = currentUrl(), paramObj?: Record<string, string | undefined>): string {
  // Split the path into two parts: everything before the "?" and everything after.
  const [basePath, queryString] = path.split("?");

  // Use URLSearchParams to easily manipulate query parameters.
  const urlParams = new URLSearchParams(queryString || "");

  // Loop through each key-value pair in the provided object and update/add it to urlParams.
  for (const [key, value] of Object.entries(paramObj ?? {})) {
    if (value === undefined || value === null) {
      //remove the param
      urlParams.delete(key);
    } else {
      urlParams.set(key, value);
    }
  }

  // If there's at least one query parameter after updating, append it to the basePath.
  return urlParams.toString() ? `${basePath}?${urlParams.toString()}` : basePath;
}

export function getURLParams(url?: string): Record<string, string> {
  if (!url) url = currentUrl();

  // Extract the query string part after the '?'
  const queryString = url.includes("?") ? url.split("?")[1] : "";
  if (!queryString) return {};

  const urlParams = new URLSearchParams(queryString);
  const params: Record<string, string> = {};
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  urlParams.getAll("key");
  return params;
}

export function removeURLParams(path: string, paramKeys: string[]): string {
  // Split the path into two parts: everything before the "?" and everything after.
  const [basePath, queryString] = path.split("?");

  // Use URLSearchParams to easily manipulate query parameters.
  const urlParams = new URLSearchParams(queryString || "");

  // Loop through each key in the provided array and remove it from urlParams.
  for (const key of paramKeys) {
    urlParams.delete(key);
  }

  // If there's at least one query parameter after updating, append it to the basePath.
  return urlParams.toString() ? `${basePath}?${urlParams.toString()}` : basePath;
}

export function navigateToURL(router?: NextRouter | AppRouterInstance, path?: string, keepParams: Record<string, string> | boolean = true) {
  if (keepParams === false) {
    //navigate without params
    navigateToPath(router, path);
  } else if (keepParams === true) {
    //naviate with all params
    navigateToUrlKeepParams(router, path);
  } else {
    //navigate with the passed param
    navigateToUrlKeepParams(router, path, keepParams);
  }
}

export function navigateToURLWithParams(router?: NextRouter | AppRouterInstance, path?: string, paramObj: Record<string, string> = getURLParams()): void {
  const newPath = appendURLParams(path ?? currentUrl(), paramObj);

  navigateToPath(router, newPath);
}

export function navigateToUrlKeepParams(router?: NextRouter | AppRouterInstance, path?: string, additionalParams?: Record<string, string>): void {
  //extract the query params from the current path
  const currentQueryParams = getURLParams();

  // Merge current query params with additional params
  const mergedParams = { ...currentQueryParams, ...additionalParams };

  navigateToURLWithParams(router, path, mergedParams);
}

/**
 * Returns true if `str` is a valid URL; otherwise false.
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigates to a new URL by replacing the segment after the last '/' in the current path
 * with the provided pathSegment, keeping the query parameters.
 * If pathSegment is undefined, the URL remains unchanged and no navigation occurs.
 * If pathSegment is an empty string, it effectively removes the last segment before the query params.
 * e.g., /path/to/file?a=1 -> /path/to/?a=1
 *
 * @param router Optional NextRouter or AppRouterInstance for navigation.
 * @param pathSegment Optional string to replace the last path segment. If undefined, no action is taken.
 */
export function navigateToPathSegment(router?: NextRouter | AppRouterInstance, pathSegment?: string): void {
  // Do nothing if pathSegment is undefined
  if (pathSegment === undefined) {
    return;
  }

  const current = currentUrl();
  const [basePath, queryString] = current.split("?", 2); // Split into max 2 parts

  const lastSlashIndex = basePath.lastIndexOf("/");

  let newUrlPath = current; // Default to original URL

  // Only proceed if a slash is found. If not (e.g., "file.html?a=1"), the concept of "last segment" doesn't apply.
  if (lastSlashIndex !== -1) {
    // Extract the part of the path up to and including the last slash
    const pathPrefix = basePath.substring(0, lastSlashIndex + 1); // e.g., "/path/to/file" -> "/path/to/", "/path/" -> "/path/", "/" -> "/"

    // Construct the new base path by appending the new segment
    const newBasePath = pathPrefix + pathSegment;

    // Re-attach the query string if it existed
    newUrlPath = queryString !== undefined ? `${newBasePath}?${queryString}` : newBasePath;
  }

  // Avoid unnecessary navigation if the URL didn't change
  // This check is technically redundant if pathSegment must be defined to reach here,
  // unless the resulting URL calculation somehow results in the same URL (e.g. pathSegment was identical to original last segment)
  if (newUrlPath !== current) {
    navigateToPath(router, newUrlPath);
  }
}

/**
 * Returns true if the path ends with the specified suffix, ignoring any query parameters.
 * @param path - The URL path to check.
 * @param suffix - The suffix to check for at the end of the path.
 * @returns true if the path ends with the suffix, false otherwise.
 */
export function pathEndsWith(path: string, suffix: string): boolean {
  //remove the query params
  const pathWithoutParams = path.split("?")[0];
  return pathWithoutParams.endsWith(suffix);
}

/*
 * Returns true if the URL is valid; otherwise false.
 * @param url - The URL to check.
 * @param strict - If true, only absolute URLs are considered valid.
 * @returns true if the URL is valid, false otherwise.
 */
export function isValidURL(url: string, strict: boolean = false): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    if (strict) {
      return false;
    }
    // Allow relative URLs starting with a single '/'
    return url.startsWith("/") && !url.startsWith("//");
  }
}

export function getCurrentPath() {
  return window.location.pathname;
}

export function withDomainUrl(path?: string, https: boolean = true) {
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_ROOT_DOMAIN_URL is not set");
  }
  if (domain.includes("localhost")) {
    //Force http
    https = false;
  }
  const domainUrl = ensureUniqueDelimiterBetweenStrings(domain, "/", path ?? "");
  return `${https ? "https" : "http"}://${domainUrl}`;
}
