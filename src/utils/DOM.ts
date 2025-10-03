import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NextRouter } from "next/router";
import { getValueFromPath } from "./objBasedExpressionEvaluation";
import { appendURLParams } from "./url";
import { isNullOrUndefined } from "./booleansAndNullable";

export const replaceUrlDomain = (url: string, newDomain?: string, removePort = false) => {
  const urlObj = new URL(url);
  console.info("urlObj", urlObj);
  urlObj.host = newDomain ?? urlObj.host;
  if (removePort) {
    urlObj.port = "";
  }
  return urlObj.toString();
};

export const isServerSide = () => {
  return typeof window === "undefined";
};

export const isClientSide = () => {
  return typeof window !== "undefined";
};

export const RefreshWindow = (ifTrue?: boolean) => {
  if (ifTrue === undefined || ifTrue) {
    window.location.reload();
  }
};

export const fullPageReload = (url?: string) => {
  window.location.replace(url || window.location.href);
};

//By default keep the current query params, unless an empty object is passed in or replace with a new object
export const navigateToPath = (router?: NextRouter | AppRouterInstance, path?: string, queryParams?: Record<string, string>, e?: any) => {
  //If the URL points to a page outside your Next.js app or if you deliberately want a full page reload, you can use window.location.href = url or window.location.assign(url).
  if (!path) {
    RefreshWindow();
    return;
  }

  // If Cmd (Mac) or Ctrl (Windows/Linux) key is pressed, open in a new tab
  if (e?.metaKey || e?.ctrlKey) {
    window.open(path, "_blank");
    return;
  }

  const [pathWithoutQuery, queryString] = path.split("?");
  const pathParams = new URLSearchParams(queryString || "");

  // Start building the final query params
  const finalParams = new URLSearchParams();

  // keep the current ones always
  const currentQueryParams = new URLSearchParams(window.location.search);
  currentQueryParams.forEach((value, key) => {
    finalParams.set(key, value);
  });

  // Overlay params from the path string itself. These take precedence.
  if (queryParams === undefined) {
    pathParams.forEach((value, key) => {
      finalParams.set(key, value);
    });
  } else {
    // Otherwise, use the provided queryParams object as the new base
    Object.entries(queryParams).forEach(([key, value]) => {
      if (isNullOrUndefined(value)) {
        //remove the key from the finalParams
        finalParams.delete(key);
      }
      finalParams.set(key, value);
    });
  }

  const finalQueryString = finalParams.toString();
  const finalPath = finalQueryString ? `${pathWithoutQuery}?${finalQueryString}` : pathWithoutQuery;

  // Step 3: Compare to see if navigation is needed
  const isSamePath = window.location.pathname === pathWithoutQuery;
  const isSameQuery = new URLSearchParams(window.location.search).toString() === finalQueryString;

  if (isSamePath && isSameQuery) {
    RefreshWindow();
    return;
  } else {
    // Navigate to the new path
    if (router) {
      router.push(finalPath);
    } else {
      window.location.href = finalPath;
    }
  }
};

export const setTextSelected = (element: HTMLElement | string | undefined, start?: number, end?: number) => {
  if (!element) return;

  if (typeof element === "string") {
    element = document.getElementById(element) as HTMLElement;
  }

  if (!element) {
    console.error("Element not found");
    return;
  }

  const textNode = element.firstChild ?? element;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    console.error("Element does not contain a text node");
    return;
  }

  if (start === undefined || end === undefined) {
    console.error("Start or end is undefined");
    return;
  }

  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

export const getElementPaddingPx = (element: HTMLElement) => {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const padding = parseInt(style.paddingTop) + parseInt(style.paddingBottom);
  return padding;
};

export const getElementsCumulativeChildrenHeights = (element: HTMLElement, includeMargins = true) => {
  const children = element.children;
  let height = 0;
  for (const child of children) {
    if (!child) continue;
    height += child.clientHeight;
    if (includeMargins) {
      height += parseInt(window.getComputedStyle(child).marginBottom);
      height += parseInt(window.getComputedStyle(child).marginTop);
    }
  }
  return height;
};

export const getElementUnusedHeight = (element: HTMLElement) => {
  const height = element.clientHeight;
  const padding = getElementPaddingPx(element);

  const childrenHeight = getElementsCumulativeChildrenHeights(element);

  return height - padding - childrenHeight;
};

/**
 * Traverses up the DOM tree from an event's target element, looking for an element
 * where a specified property path resolves to a value.
 *
 * @param event - The DOM event object.
 * @param path - An array of strings/numbers representing the property path to check on each element (e.g., ['dataset', 'id'], ['attributes', 'role', 'value']).
 * @param levels - The maximum number of parent levels to traverse upwards. 0 means only check the target element itself.
 * @param expectedValue - (Optional) If provided, the value at the path must strictly match this value. If omitted, any non-undefined value satisfies the condition.
 * @returns The first element (including the target or its parents) that satisfies the condition, or null if no such element is found within the specified levels.
 */
export function findElementInEventHierarchy(
  event: Event | Element | null | undefined,
  path: (string | number)[],
  levels: number = 0,
  expectedValue?: any,
  direction: "up" | "down" = "up"
): Element | null {
  let currentElement = isEvent(event) ? (event.target as Element) : isTargetElement(event) ? event : null;
  let currentLevel = 0;

  if (!currentElement) {
    console.error("No element found in event hierarchy");
    return null;
  }

  while (currentElement && currentLevel <= levels) {
    const valueAtPath = getValueFromPath(currentElement, path);

    const valueExists = valueAtPath !== undefined;
    const valueMatches = expectedValue !== undefined ? valueAtPath === expectedValue : true;

    if (valueExists && valueMatches) {
      return currentElement; // Found the element satisfying the criteria
    }

    // Move to next element
    if (direction === "up") currentElement = currentElement.parentElement;
    else currentElement = currentElement.children[0] as Element;
    currentLevel++;
  }

  return null; // No matching element found within the specified levels
}

export function findParentElementWithTagName(element: Element, tagName: string, maxSteps: number = 10): Element | null {
  let currentElement: Element | null = element;
  let steps = 0;
  while (currentElement && steps < maxSteps) {
    if (!currentElement) return null;
    if (currentElement.tagName.toLowerCase() === tagName.toLowerCase()) return currentElement;
    currentElement = currentElement.parentElement;
    steps++;
  }
  return null;
}

// Confirm: that all targets have an ownerDocument or parentElement property
export const isTargetElement = (event: Event | null | undefined | Element | undefined): event is Element => {
  if (!event) return false;
  if ((event as Element).ownerDocument || (event as Element).parentElement) return true;
  if ((event as Event).target) return false;
  return false;
};

// Confirm: that all events have a target property
export const isEvent = (event: Event | null | undefined | Element | undefined): event is Event => {
  if (!event) return false;
  if ((event as Event).target) return true;
  return false;
};

export function highlightDiv(
  componentId: string,
  baseClassNames: string = "rounded-md transition-all duration-500 ease-out",
  classNames: string = "ring-offset-[7px] ring-[3px]",
  duration: number = 2500
) {
  if (!componentId) return;
  const div = document.getElementById(componentId);

  if (div) {
    const classNamesArray = classNames.split(" ");
    const baseClassNamesArray = baseClassNames.split(" ");
    const combinedClassNamesArray = [...baseClassNamesArray, ...classNamesArray];

    // Add the new class names to provide a highlighting effect to the div
    div.classList.add(...combinedClassNamesArray);

    // Remove the highlight after a delay
    setTimeout(() => {
      div.classList.remove(...classNamesArray);
    }, duration);
  } else {
    // Child div not found cancelling highlight
    // Child div not found, so try to wrap the element with a div and then highlight it
    //wrapElementWithDiv(componentId, componentId + "_outerMostDiv", baseClassNames, classNames, duration);
  }
}

// DANGER: This function works, but can cause race conditions with react re-renders. Advised to manage DOM structure declaratively.
// Can produce error: Error: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
// The insertBefore error and potential race conditions are due to the fundamental conflict between your direct DOM manipulations and React's control over the DOM. While DOM operations correctly set up the parent-child structure for the wrapper, React has not become aware of these changes.
export function wrapElementWithDiv(
  elementId: string,
  wrapperDivId: string = "_outerMostDiv",
  baseClassNames: string = "transition-all duration-1000 ease-in-out",
  classNamesParam: string = "bg-blue-500 text-white rounded-sm", // Renamed to avoid confusion
  duration: number = 5000
) {
  debugger;
  requestAnimationFrame(() => {
    const elementToWrap = document.getElementById(elementId);

    // Ensure elementToWrap exists and is part of the live document
    if (!elementToWrap || !document.body.contains(elementToWrap)) {
      console.warn(`Element with id '${elementId}' not found or not in document. Aborting wrap.`);
      return;
    }

    const currentClassNames = classNamesParam.split(" ");
    const baseClassNamesArray = baseClassNames.split(" ");
    const combinedClassNamesArray = [...baseClassNamesArray, ...currentClassNames];

    const wrapperDiv = document.createElement("div");
    wrapperDiv.id = wrapperDivId;
    wrapperDiv.classList.add(...combinedClassNamesArray);

    const parent = elementToWrap.parentNode;

    // Ensure parent exists and elementToWrap is indeed its child before manipulation
    if (parent && parent.contains(elementToWrap)) {
      try {
        parent.insertBefore(wrapperDiv, elementToWrap);
        // After insertBefore, elementToWrap is now a sibling of wrapperDiv, both under parent.
        // Now, move elementToWrap inside wrapperDiv.
        wrapperDiv.appendChild(elementToWrap);

        setTimeout(() => {
          // Check if wrapperDiv is still in the DOM before attempting to modify classes
          if (wrapperDiv.parentNode) {
            wrapperDiv.classList.remove(...currentClassNames);

            // Optional: If the wrapper is temporary and should be fully removed,
            // restoring elementToWrap to its original position:
            /*
                const originalParent = wrapperDiv.parentNode;
                if (wrapperDiv.contains(elementToWrap)) { // Ensure element is still in wrapper
                  originalParent.insertBefore(elementToWrap, wrapperDiv); // Move element out
                }
                originalParent.removeChild(wrapperDiv); // Remove empty wrapper
                */
          }
        }, duration);
      } catch (error) {
        console.error(`Failed to execute DOM manipulation for '${elementId}':`, error);
        // Attempt to clean up if wrapperDiv was inserted but appendChild failed
        if (wrapperDiv.parentNode && !wrapperDiv.contains(elementToWrap)) {
          wrapperDiv.parentNode.removeChild(wrapperDiv);
        }
      }
    } else {
      console.warn(`Element '${elementId}' is no longer a child of its parent node, or parent is null. Aborting wrap.`);
    }
  });
}
