export const updateUrl = (url?: string, params?: Record<string, string>, setUrl: boolean = true) => {
  if (!url) url = window.location.href;
  if (!params) return url;
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });
  if (setUrl) {
    window.history.pushState(null, "", urlObj.toString());
  }
  return urlObj.toString();
};
export const domainSlash = (url: string) => {};

//Get the full URL of the current page, including query parameters, hash, etc.
export const currentUrl = (): string => {
  if (isClient()) {
    return window.location.href || "";
  }
  return "";
};

export function isClient() {
  return typeof window !== "undefined";
}

export function isServer() {
  return typeof window === "undefined";
}
