import { isDef } from '../utils/types';
import useElementStyles from "./useElementStyles";
import useComputedStyles from "./useComputedStyle";
import { mergeKeepNonNullOrUndefined } from '../utils/objectManipulation';
import { RefObject } from "react";

/*
• useMutationAndResizeStyle combines useElementStyles and useComputedStyles to provide a more comprehensive style observation.
It uses both MutationObserver and ResizeObserver to detect changes in both inline styles and computed styles.
This approach ensures that both inline and computed styles are observed, providing a more accurate representation of the element’s layout.
*/
const useMutationAndResizeStyle = (
  containerRef?: RefObject<HTMLElement | null>,
  getPropertyStyles?: string[],
  getComputedStyles?: string[],
  delay: number = 40,
  enable: boolean = true,
  style?: React.CSSProperties,
  callback?: (styles: any) => void,
  debug: boolean = false
) => {
  if (!containerRef) return {};
  // Get styles that trigger re-render when 'height' changes
  const elementStyles = useElementStyles(enable, containerRef, getPropertyStyles, delay, debug);

  // Get computed styles based on 'visible' flag
  const computedStyles = useComputedStyles((isDef(enable) ?? false) && enable, containerRef, getComputedStyles, [enable], undefined, debug);

  // Merge styles, keeping non-null or undefined values
  const mergedStyles = mergeKeepNonNullOrUndefined(mergeKeepNonNullOrUndefined(computedStyles, elementStyles), style);

  if (enable && callback) callback(mergedStyles);

  return mergedStyles;
};

export default useMutationAndResizeStyle;
