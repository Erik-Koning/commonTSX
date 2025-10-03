import { isArray } from '../utils/objectManipulation';
import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { debounce } from "../utils/timers";

type StyleObject = Record<string, string | null>;

/*
• useComputedStyles observes changes in computed style attributes (via ResizeObserver).
This is more reliable than useElementStyles for detecting layout shifts, but it is more resource-intensive.
which updates if the element’s content box changes size. A purely positional shift (e.g., the banner expands above the Navbar) 
may not fire a resize event if the Navbar’s width/height is otherwise unchanged.
*/
function useComputedStyles(
  enable: boolean,
  ref?: RefObject<HTMLElement | null>,
  styleProperties: string[] | boolean = true, //set true for all
  dependents?: any[],
  debounceDelay: number = 0,
  debug: boolean = false
): StyleObject {
  const [computedStyles, setComputedStyles] = useState<StyleObject>({});
  const lastKnownStyles = useRef<StyleObject>({});

  useLayoutEffect(() => {
    if (!enable) return;
    if (!ref || !ref.current || !styleProperties || (isArray(styleProperties) && styleProperties.length === 0)) return;

    const updateStyles = () => {
      const computedStyle = window.getComputedStyle(ref.current as HTMLElement);
      const stylesObject: StyleObject = {};

      if (debug) console.log("DEBUG: Computed styles", computedStyle);
      if (debug) debugger;
      if (isArray(styleProperties)) {
        styleProperties.forEach((style) => {
          try {
            const newValue = computedStyle.getPropertyValue(style);
            //debugger;
            stylesObject[style] = newValue;
          } catch (error) {
            console.warn("(useComputedStyles) error getting property value ", style, "from ref", ref, "\nerror", error);
          }
        });
      } else if (styleProperties) {
        for (let i = 0; i < computedStyle.length; i++) {
          const style = computedStyle[i];
          try {
            stylesObject[style] = computedStyle.getPropertyValue(style);
          } catch (error) {
            console.warn("(useComputedStyles) error getting property value ", style, "from ref", ref, "\nerror", error);
          }
        }
      }

      let hasChanged = false;
      // Check if styles have changed
      Object.keys(stylesObject).forEach((style) => {
        if (lastKnownStyles.current[style] !== stylesObject[style]) {
          hasChanged = true;
        }
      });

      // Only update state if the values have changed
      if (hasChanged) {
        setComputedStyles(stylesObject);
        lastKnownStyles.current = stylesObject;
      }
    };
    updateStyles();
    const debouncedUpdateStyles = debounce(updateStyles, debounceDelay); // Adjust the delay as needed

    // Observer to detect changes in the element's styles
    const resizeObserver = new ResizeObserver(debounceDelay > 0 ? debouncedUpdateStyles : updateStyles);
    resizeObserver.observe(ref.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, styleProperties, dependents]);

  return computedStyles;
}

export default useComputedStyles;
