import { isClientSide } from "./DOM";

export const getCSSVariable = (variable: string): string => {
  if (isClientSide()) return window.getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return "";
};
