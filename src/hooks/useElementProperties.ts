import { RefObject, useLayoutEffect, useRef, useState } from "react";

// Get all properties from HTMLElement
type ElementPropertyTypes = Pick<HTMLElement, keyof HTMLElement> & {
  rect?: DOMRect;
};

// Or if you want to include properties from Element as well:
// type ElementPropertyTypes = Pick<HTMLElement & Element, keyof (HTMLElement & Element)>;

// Add at the top with other type definitions
type SafePropertyKey = keyof ElementPropertyTypes;

function useElementProperties<K extends keyof ElementPropertyTypes>(
  ref: RefObject<HTMLElement | null>,
  properties: K[] | boolean = true,
  enabled: boolean = true,
  dependents?: any[],
  debounceDelay: number = 100,
  debug: boolean = false
): Partial<Pick<ElementPropertyTypes, K>> {
  const [elementProperties, setElementProperties] = useState<Partial<ElementPropertyTypes>>({});
  const lastKnownProperties = useRef<Partial<ElementPropertyTypes>>({});

  useLayoutEffect(() => {
    if (!enabled || !ref?.current) return;

    const updateProperties = () => {
      const element = ref.current;
      if (!element) return;

      const propsObject: Partial<ElementPropertyTypes> = {};

      if (debug) console.log("DEBUG: Element", element);

      // If properties is an array, get only specified properties
      if (Array.isArray(properties)) {
        properties.forEach((prop) => {
          try {
            const value = (element as ElementPropertyTypes)[prop];
            if (typeof value !== "function" && value !== undefined) {
              (propsObject as any)[prop] = value;
            }
          } catch (e) {
            // Skip inaccessible properties
          }
        });
      }
      // If properties is true, get all accessible properties
      else if (properties === true) {
        // Get native HTMLElement properties we care about
        const nativeProps = [
          // Scroll metrics
          "scrollHeight",
          "scrollWidth",
          "scrollTop",
          "scrollLeft",

          // Client/Viewport metrics
          "clientHeight",
          "clientWidth",
          "clientTop",
          "clientLeft",

          // Offset metrics
          "offsetHeight",
          "offsetWidth",
          "offsetTop",
          "offsetLeft",
          "offsetParent",

          // Element properties
          "className",
          "classList",
          "id",
          "tagName",
          "nodeName",
          "nodeType",
          "nodeValue",
          "innerHTML",
          "innerText",
          "outerHTML",
          "outerText",
          "textContent",

          // Dimensions and visibility
          "hidden",
          "style",
          "title",
          "dataset",
          "attributes",
          "childNodes",
          "children",
          "firstChild",
          "lastChild",
          "nextSibling",
          "previousSibling",
          "parentNode",
          "parentElement",

          // Form-related
          "contentEditable",
          "isContentEditable",
          "dir",
          "lang",
          "draggable",
          "spellcheck",
          "tabIndex",
          "accessKey",

          // Position and layout
          "clientRects",
          "computedRole",
          "computedName",

          // State
          "scrolling",
          "autofocus",
          "disabled",
          "readOnly",

          // Dimensions as strings
          "naturalHeight", // For images
          "naturalWidth", // For images

          // ARIA properties
          "ariaAtomic",
          "ariaAutoComplete",
          "ariaBusy",
          "ariaChecked",
          "ariaColCount",
          "ariaColIndex",
          "ariaColSpan",
          "ariaCurrent",
          "ariaDisabled",
          "ariaExpanded",
          "ariaHasPopup",
          "ariaHidden",
          "ariaKeyShortcuts",
          "ariaLabel",
          "ariaLevel",
          "ariaLive",
          "ariaModal",
          "ariaMultiLine",
          "ariaMultiSelectable",
          "ariaOrientation",
          "ariaPlaceholder",
          "ariaPosInSet",
          "ariaPressed",
          "ariaReadOnly",
          "ariaRequired",
          "ariaRoleDescription",
          "ariaRowCount",
          "ariaRowIndex",
          "ariaRowSpan",
          "ariaSelected",
          "ariaSetSize",
          "ariaSort",
          "ariaValueMax",
          "ariaValueMin",
          "ariaValueNow",
          "ariaValueText",
        ] as const;

        // Add native properties first
        nativeProps.forEach((prop) => {
          (propsObject as any)[prop] = (element as any)[prop];
        });

        // Then get other safe properties
        const safeProps = Object.getOwnPropertyNames(element).filter((prop): prop is SafePropertyKey => {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), prop);
            return descriptor ? !descriptor.writable === false : true;
          } catch (e) {
            return false;
          }
        });

        safeProps.forEach((prop) => {
          try {
            const value = (element as ElementPropertyTypes)[prop];
            if (typeof value !== "function" && value !== undefined) {
              (propsObject as any)[prop] = value;
            }
          } catch (e) {
            // Skip inaccessible properties
          }
        });
      }

      // Add getBoundingClientRect data
      propsObject.rect = element.getBoundingClientRect();

      let hasChanged = false;
      // Check if properties have changed
      Object.keys(propsObject).forEach((prop) => {
        const key = prop as keyof ElementPropertyTypes;
        if (lastKnownProperties.current[key] !== propsObject[key]) {
          hasChanged = true;
        }
      });

      // Only update state if the values have changed
      if (hasChanged) {
        if (debug) console.log("DEBUG: Updated properties", propsObject);
        setElementProperties(propsObject);
        lastKnownProperties.current = propsObject;
      }
    };

    updateProperties();

    // Only set up observers if enabled
    if (enabled) {
      // Watch for size changes
      const resizeObserver = new ResizeObserver(updateProperties);
      resizeObserver.observe(ref.current);

      // Watch for content changes
      const mutationObserver = new MutationObserver(updateProperties);
      mutationObserver.observe(ref.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }
  }, [ref, properties, enabled, ...(dependents || [])]);

  return elementProperties;
}

export default useElementProperties;
