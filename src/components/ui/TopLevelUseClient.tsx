"use client";

import { scan } from "react-scan"; // import this BEFORE react
import React, { useState, useEffect, useRef, MouseEventHandler } from "react";
import { reportError } from "@common/components/errors/ErrorBoundary";
import { ErrorToObj, getNonEnumerableProps } from '../../utils/objectManipulation';
import { escapeHTML } from '../../utils/stringManipulation';
import LastInteractionContext from '../../contexts/LastInteractionContext';
import { isDevEnv } from '../../utils/environments';
import { findParentElementWithTagName } from "../../utils/DOM";

interface TopLevelUseClientProps {
  children: React.ReactNode;
  currentUser?: any | null;
}

export type LastInteraction = MouseEvent | KeyboardEvent | PointerEvent | EventTarget | { [key: string]: any };

const TopLevelUseClient: React.FC<TopLevelUseClientProps> = ({ children, currentUser }) => {
  const [hasMounted, setHasMounted] = useState(false);

  // Ref to store minimal last interaction info
  const lastInteractionRef = useRef<LastInteraction>({});

  // Function to read the last interaction info when needed
  const getLastInteraction = () => lastInteractionRef.current;

  const enableReactScan = false;

  //React scan is a tool to help with debugging react components, it is not needed in production
  if (isDevEnv() && enableReactScan) {
    try {
      //Only enable if window is defined, aka we are in the browser
      if (window !== undefined && typeof window !== "undefined") {
        scan({
          enabled: enableReactScan ? isDevEnv() : false, // enables/disables the plugin (default: false)
          log: true, // logs render info to console (default: false)
        });
      }
    } catch (error) {
      console.warn("Problem enabling react scan", error);
    }
  }

  useEffect(() => {
    setHasMounted(true);

    //handler for mouse event and pointer and keyboard event
    const interactionHandler = (ev: MouseEvent | KeyboardEvent) => {
      let e = ev as MouseEvent & KeyboardEvent & PointerEvent & EventTarget;
      // Extract minimal info: event type and the element's id if available

      const target = e.target as HTMLElement;

      const hasButtonParent = findParentElementWithTagName(target, "button", 10);

      lastInteractionRef.current = {
        type: e.type,
        id: target?.id,
        pointerType: e.pointerType,
        hasButtonParent: hasButtonParent
          ? {
              id: hasButtonParent.id,
              textContent: hasButtonParent.textContent,
              nodeName: hasButtonParent.nodeName,
            }
          : null,
        outerHTML: escapeHTML(target.outerHTML),
        innerHTML: escapeHTML(target.innerHTML),
        innerText: target.innerText,
        innerId: target.id,
        nodeName: target.nodeName,
      };
    };

    // Add global event listeners for mouse/keyboard interactions
    window.addEventListener("click", interactionHandler, { capture: true });
    window.addEventListener("keydown", interactionHandler, { capture: true });

    return () => {
      window.removeEventListener("click", interactionHandler, { capture: true });
      window.removeEventListener("keydown", interactionHandler, { capture: true });
    };
  }, []);

  //Top level error handling for client side errors, these catch non-react errors
  if (typeof window !== "undefined") {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error("window.onerror", message, source, lineno, colno, error);

      if (isDevEnv()) return;

      const lastInteraction = getLastInteraction();

      let nonReactErrorDetails: Error | string;
      if (error instanceof Error) {
        // Now we need a way to show the custom error page in the UI.
        // We'll handle this by giving the GlobalErrorBoundary a static method to trigger a state update.
        nonReactErrorDetails = error;
      } else {
        nonReactErrorDetails = new Error(String(message));
      }

      reportError(
        {
          ...(error ? ErrorToObj(error) : { message }),
          lastInteraction,
        },
        { componentStack: String(message) + "\nnonReactErrorDetails:\n" + String(nonReactErrorDetails) },
        currentUser,
        getLastInteraction
      );

      let setShowNonReactError = false;

      if (source && source.includes(process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL!)) {
        //console.log("error1", source, lineno, colno, error);
        //setShowNonReactError = true;
      }

      // Return false to allow the error to propagate as normal if needed
      return false;
    };

    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      console.error("onunhandledrejection event", event.reason);

      if (isDevEnv()) return;

      const lastInteraction = getLastInteraction();

      const reason = event.reason as Error;
      const error: Record<string, any> = ErrorToObj(reason);

      //currentTarget is what the event bubbled up to (parent element)  target is the element that triggered the event
      const clientInfo = (event.currentTarget as any)?.clientInformation;
      console.log("clientInfo", event.currentTarget);
      console.log("clientInfo", clientInfo);

      //reference to the object onto which the event was dispatched
      const eventTarget = event.target as Record<string, any>;
      console.log("eventTarget", eventTarget);
      const eventInfoObj = {
        type: eventTarget.type,
        timeStamp: eventTarget.timeStamp,
        target: eventTarget.target,
        currentTarget: eventTarget.currentTarget,
        eventPhase: eventTarget.eventPhase,
        bubbles: eventTarget.bubbles,
        cancelable: eventTarget.cancelable,
        defaultPrevented: eventTarget.defaultPrevented,
        composed: eventTarget.composed,
        isTrusted: eventTarget.isTrusted,
        returnValue: eventTarget.returnValue,
        cancelBubble: eventTarget.cancelBubble,
        screen: {
          availHeight: eventTarget.screen.availHeight,
          availWidth: eventTarget.screen.availWidth,
          height: eventTarget.screen.height,
          width: eventTarget.screen.width,
        },
      };

      const clientInfoObj = {
        userAgent: clientInfo.userAgent,
        platform: clientInfo.platform,
        language: clientInfo.language,
        languages: clientInfo.languages,
        vendor: clientInfo.vendor,
        maxTouchPoints: clientInfo.maxTouchPoints,
        cookieEnabled: clientInfo.cookieEnabled,
        //clipboard: clientInfo.clipboard.read(),
        userActivation: {
          hasBeenActive: clientInfo.userActivation.hasBeenActive,
          isActive: clientInfo.userActivation.isActive,
          isUserActivated: clientInfo.userActivation.isUserActivated,
          type: clientInfo.userActivation.type,
        },
        userAgentData: {
          platform: clientInfo.userAgentData.platform,
          brands: { ...clientInfo.userAgentData.brands },
          mobile: clientInfo.userAgentData.mobile,
        },
        // ... add any other properties you need
      };

      const allNonEnumerableProps = getNonEnumerableProps(clientInfo);

      let nonReactErrorDetails: Error | string;
      if (error instanceof Error) {
        // Now we need a way to show the custom error page in the UI.
        // We'll handle this by giving the GlobalErrorBoundary a static method to trigger a state update.
        nonReactErrorDetails = error;
      } else {
        nonReactErrorDetails = new Error(String(reason));
      }

      reportError(
        { ...{ error: { ...error } }, lastInteraction, ...allNonEnumerableProps, ...clientInfoObj, ...eventInfoObj },
        { componentStack: String(reason) + "\nnonReactErrorDetails:\n" + String(nonReactErrorDetails) },
        currentUser
      );
    };
  }

  if (!hasMounted) return null;

  //provide the function to get the last interaction info, getLastInteraction function does not change but the value it returns does, providing it this way reduces the number of re-renders for components that use it
  //This is how to update a value in a parent component without re-rendering the parent component or its children
  return <LastInteractionContext.Provider value={{ getLastInteraction }}>{children} </LastInteractionContext.Provider>;
};

export default TopLevelUseClient;
