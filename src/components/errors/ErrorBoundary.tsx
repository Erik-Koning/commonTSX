"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { useErrorBoundary, withErrorBoundary } from "react-use-error-boundary";
import { ModalLayout } from "@common/components/modals/ModalLayout";
import { Button } from "@common/components/ui/Button";
import axios from "axios";
import { ErrorToObj, removeCircularReferences } from "@common/utils/objectManipulation";
import { objectToTableRows } from "@common/utils/email";
import { LastInteraction } from "@common/components/ui/TopLevelUseClient";
import { isDevEnv } from "@common/utils/environments";
import { PageContentContainer } from "../ui/PageContentContainer";

interface GlobalErrorBoundaryProps {
  children?: ReactNode;
  initialUser?: any;
  getLastInteraction?: () => LastInteraction | null;
}

// A helper function to log and report errors.
export const reportError = async (
  error: Error | Record<string, unknown>,
  errorInfo: { componentStack: string },
  currentUser?: any | null,
  getLastInteraction?: () => LastInteraction | null,
  errorType: string = "React Error"
): Promise<void> => {
  const errorData = {
    userEmail: currentUser?.email,
    error: ErrorToObj(error),
    componentStack: errorInfo.componentStack,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    url: window.location.href,
    pathname: window.location.pathname,
    time: new Date().toISOString(),
    isOnline: navigator.onLine,
    lastInteraction: getLastInteraction ? getLastInteraction() : {},
    errorType: errorType,
    isReactError: errorType === "React Error",
  };

  debugger;

  let htmlTableRows;
  try {
    htmlTableRows = objectToTableRows(errorData);
  } catch (e) {
    const noCircularReferenceData = removeCircularReferences(errorData);
    htmlTableRows = objectToTableRows(noCircularReferenceData);
  }

  if (!errorType.toLowerCase().includes("console")) console.error(`${errorType} captured:`, htmlTableRows);
  else console.info(`${errorType} captured:`, htmlTableRows);

  //if (isDevEnv()) return;

  axios
    .post("/api/clientSideError", {
      data: htmlTableRows,
      rawData: errorData,
      note: `From GlobalErrorBoundary - ${errorType}`,
    })
    .catch((postError) => {
      console.error("Failed to post error:", postError);
    });
};

/*
WARNING:
Because React recreates the component tree from scratch after catching an error, 
the component using the useErrorBoundary hook is always remounted after an error 
is encountered. This means any state will be reinitialized: useState and useRef 
hooks will be reinitialized to their initial value and will not persist across 
caught errors. Any values that need to be preserved across error catching must 
be lifted into a parent component above the component wrapped in withErrorBoundary.
*/

function GlobalErrorBoundaryComponent({ children, initialUser, getLastInteraction }: GlobalErrorBoundaryProps) {
  const hasSetupGlobalHandlers = useRef(false);
  const originalConsoleError = useRef<typeof console.error>(console.error);

  // Use the useErrorBoundary hook with a callback to log/report React errors.
  const [error, resetError] = useErrorBoundary((err, errorInfo) => {
    reportError(err as Error, { componentStack: String(errorInfo) }, initialUser, getLastInteraction, "React Error");
  });

  useEffect(() => {
    // Prevent setting up multiple global handlers
    if (hasSetupGlobalHandlers.current) return;
    hasSetupGlobalHandlers.current = true;

    // 1. Catch all JavaScript errors (including async errors, event handler errors)
    const handleGlobalError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack || error.stack;

      reportError(
        error,
        { componentStack: `Global Error at ${event.filename}:${event.lineno}:${event.colno}` },
        initialUser,
        getLastInteraction,
        "JavaScript Error"
      );
    };

    // 2. Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

      reportError(error, { componentStack: "Unhandled Promise Rejection" }, initialUser, getLastInteraction, "Promise Rejection");

      // Prevent the default unhandled rejection behavior
      event.preventDefault();
    };

    // 3. Catch resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      const error = new Error(`Resource failed to load: ${target.tagName}`);

      reportError(
        error,
        { componentStack: `Resource Error: ${target.outerHTML?.substring(0, 200) || "Unknown"}` },
        initialUser,
        getLastInteraction,
        "Resource Error"
      );
    };

    // 4. Intercept console.error calls
    originalConsoleError.current = console.error;
    console.error = (...args: any[]) => {
      // Call original console.error first
      originalConsoleError.current?.(...args);

      // Then report the console error
      const errorMessage = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" ");

      const error = new Error(`Console Error: ${errorMessage}`);

      //TODO: turn back on console errors, once app is stable and common console errors are addressed
      //reportError(error, { componentStack: "Console Error" }, initialUser, getLastInteraction, "Console Error");
    };

    // Add event listeners
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleResourceError, true); // Capture phase for resource errors

    // Cleanup function
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleResourceError, true);

      // Restore original console.error
      if (originalConsoleError.current) {
        console.error = originalConsoleError.current;
      }

      hasSetupGlobalHandlers.current = false;
    };
  }, [initialUser, getLastInteraction]);

  if (error) {
    console.error("ErrorBoundary captured error:", error);
    return (
      <PageContentContainer variant="centeredXY">
        <ModalLayout title="An unexpected error occurred" variant="error">
          <div>
            <p>{error.hasOwnProperty("message") ? (error as Error).message : "An unexpected error occurred"}</p>
          </div>
          <Button
            onClick={() => {
              resetError();
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </ModalLayout>
      </PageContentContainer>
    );
  }

  return <>{children}</>;
}

// Wrap the component with the withErrorBoundary HOC for additional error boundary functionality.
export const GlobalErrorBoundary = withErrorBoundary(GlobalErrorBoundaryComponent);

export default GlobalErrorBoundary;
