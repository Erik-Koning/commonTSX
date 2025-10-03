import { isDevEnv } from '../utils/environments';
import { isArray } from '../utils/objectManipulation';
import { useState, useEffect, RefObject } from "react";

type StyleObject = Record<string, string | null>;
/*
• useElementStyles only observes changes in inline style attributes (via MutationObserver).
That alone will not reliably catch a layout shift if, for example, a banner above the navbar 
toggles or if some parent container pushes the element down without directly modifying 
the navbar’s inline style.
*/
function useElementStyles(
  enable: boolean = true,
  ref?: RefObject<HTMLElement | null>,
  styleProperties: string[] | boolean = true,
  delay: number = 0,
  debug: boolean = false
): StyleObject {
  const [styleValues, setStyleValues] = useState<StyleObject>({});

  useEffect(() => {
    if (!ref || !ref.current || !styleProperties || (isArray(styleProperties) && styleProperties.length === 0)) return;
    if (!enable) return;

    // Function to update the styleValues state
    const updateStyleValues = () => {
      if (!ref.current) return;
      const newStyles: StyleObject = {};
      const computedStyle = window.getComputedStyle(ref.current); // Get all computed styles

      if (debug) debugger;
      if (styleProperties === true) {
        // Get all computed styles if boolean is true
        Array.from(computedStyle).forEach((property) => {
          try {
            newStyles[property] = computedStyle.getPropertyValue(property);
          } catch (error) {
            console.warn("(useElementStyles) error getting property value ", property, "from ref", ref, "\nerror", error);
          }
        });
      } else if (isArray(styleProperties)) {
        // If styleProperties is an array, get only those specified
        styleProperties.forEach((property) => {
          try {
            newStyles[property] = computedStyle.getPropertyValue(property) || null;
          } catch (error) {
            console.warn("(useElementStyles) error getting property value ", property, "from ref", ref, "\nerror", error);
          }
        });
      }

      // Update state if there are any changes
      setTimeout(() => {
        setStyleValues((prevStyles) => {
          const hasChanged = Object.keys(newStyles).some((prop) => prevStyles[prop] !== newStyles[prop]);
          if (hasChanged && isDevEnv()) console.log("New Styles", newStyles);
          return hasChanged ? newStyles : prevStyles;
        });
      }, delay);
    };

    // Initial retrieval of the styles
    updateStyleValues();

    // Observer to detect changes in the style attribute
    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (debug) console.log("DEBUG: style mutation", mutation);
        if (mutation.attributeName === "style") {
          updateStyleValues();
          break; // No need to check further mutations
        }
      }
    });

    observer.observe(ref.current, { attributes: true, attributeFilter: ["style"] });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [ref, styleProperties]);

  return styleValues;
}

export default useElementStyles;
