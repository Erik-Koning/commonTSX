import { debug } from "console";
import { round } from "./math";

//given a hex colour return the colour less vibrant
export const desaturateHex = (hex: string, factor: number = 0.5): string => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl[1] = hsl[1] * factor;
  return hslToHex(hsl);
};

export const lightenHex = (hex: string, factor: number = 1.1): string => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl[2] = hsl[2] * factor;
  return hslToHex(hsl);
};

export const colourIsDark = (hex?: string): boolean => {
  if (!hex) return false;
  const rgb = hexToRgb(hex);
  // equation weights for calculating if a colour is dark: https://www.w3.org/TR/AERT/#color-contrast
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 186;
};

export const hexToRgb = (hex: string): number[] => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export const rgbToHsl = (rgb: number[]): number[] => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [round(h * 360, 1), round(s * 100, 1), round(l * 100, 1)];
};

export const parseColorToHSL = (color: string): number[] => {
  if (color.startsWith("#")) {
    // Handle HEX to HSL conversion
    return hexToHsl(color);
  } else {
    // Handle HSL string
    return parseHSL(color);
  }
};

// Convert HEX to HSL
const hexToHsl = (hex: string): number[] => {
  // Remove the '#' if present
  hex = hex.replace("#", "");

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find max and min RGB values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const parseHSL = (hslString: string): number[] => {
  // Split the string into its components
  const [h, s, l] = hslString
    .split(/\s+/) // Split by whitespace
    .map((val, i) => {
      // For hue (index 0), parse as a float
      if (i === 0) return parseFloat(val);

      // For saturation and lightness (indices 1 and 2), remove '%' and parse as a percentage
      return parseFloat(val.replace("%", ""));
    });

  return [h, s, l];
};

export const hslToHex = (hsl: number[]): string => {
  let [h, s, l] = hsl;
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const colourToHex = (colour: string | number[], withHash: boolean = true): string => {
  //hsl number array
  if (Array.isArray(colour)) return hslToHex(colour);
  if (typeof colour === "string") {
    //hsl string with spaces
    if (colour.includes(" "))
      return hslToHex(
        colour.split(" ").map((n) => {
          //remove % sign
          if (n.includes("%")) return parseFloat(n);
          return parseFloat(n);
        })
      );
    //hsl string with commas
    if (colour.includes(","))
      return hslToHex(
        colour.split(",").map((n) => {
          //remove % sign
          if (n.includes("%")) return parseFloat(n);
          return parseFloat(n);
        })
      );
    //hex string
    if (colour.includes("#")) return colour;
    else {
      if (withHash) return `#${colour}`;
    }
  }
  return withHash ? `#` : "";
};

export const cssVarHexToRgba = (cssVarName: string, alpha: number = 1): string | null => {
  if (typeof window === "undefined") {
    console.warn("cssVarHexToRgba cannot be used in a non-browser environment.");
    return null;
  }
  try {
    const hexValue = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    if (!hexValue || !hexValue.startsWith("#")) {
      console.warn(`CSS variable ${cssVarName} not found or not a valid hex color.`);
      return null;
    }

    const rgb = hexToRgb(hexValue);
    if (!rgb || rgb.length !== 3) {
      console.warn(`Could not convert hex ${hexValue} from ${cssVarName} to RGB.`);
      return null;
    }

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  } catch (error) {
    console.error(`Error processing CSS variable ${cssVarName}:`, error);
    return null;
  }
};

export const generateRandomHexColor = (type = "more muted") => {
  switch (type) {
    case "grays":
      // Generate shades of gray
      const grayValue = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      return `#${grayValue}${grayValue}${grayValue}`.toUpperCase();

    case "bright":
      // Generate bright colors
      const brightComponent = () => Math.floor(0xd0 + Math.random() * (256 - 0xd0)).toString(16);
      return `#${brightComponent()}${brightComponent()}${brightComponent()}`.toUpperCase();

    case "muted":
      // Generate muted colors (no component brighter than D0)
      const mutedComponent = () =>
        Math.floor(Math.random() * 0xd0)
          .toString(16)
          .padStart(2, "0");
      return `#${mutedComponent()}${mutedComponent()}${mutedComponent()}`.toUpperCase();

    case "more muted":
      // Generate muted colors (no component brighter than D0)
      const moreMutedComponent = () =>
        Math.floor(Math.random() * 0xb5)
          .toString(16)
          .padStart(2, "0");
      return `#${moreMutedComponent()}${moreMutedComponent()}${moreMutedComponent()}`.toUpperCase();

    case "pastels":
      // Generate pastel colors (lighter colors)
      const pastelComponent = () => Math.floor(0x80 + Math.random() * 0x80).toString(16);
      return `#${pastelComponent()}${pastelComponent()}${pastelComponent()}`.toUpperCase();

    case "full saturated":
      // Generate fully saturated colors
      return `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase()}`;

    default:
      // Default to fully saturated if type is unknown
      return `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase()}`;
  }
};
