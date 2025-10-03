import { useEffect, useRef, useState } from "react";

interface UseDelayedErrorOptions {
  delay?: number;
  errorMessage?: string;
  condition?: boolean;
  crashType?: "boundary" | "memory" | "stack" | "module" | "insertBefore";
}

/**
 * A hook that throws various types of errors after a specified delay.
 * Some crash types will require restarting the development server.
 */
export function useThrowError(options?: UseDelayedErrorOptions): void {
  const { delay = 10000, errorMessage = "Intentional delayed error.", condition = true, crashType = "boundary" } = options || {};

  const errorThrownRef = useRef(false);
  const [triggerRerender, setTriggerRerender] = useState(false);

  useEffect(() => {
    if (!condition) {
      return;
    }

    const timer = setTimeout(() => {
      if (!errorThrownRef.current) {
        errorThrownRef.current = true;

        switch (crashType) {
          case "boundary":
            // Regular error that triggers error boundary
            throw new Error(errorMessage);

          case "insertBefore":
            // Simulate the insertBefore race condition error
            console.log("Starting insertBefore race condition attack...");

            // Step 1: Create a test element in the DOM
            const testContainer = document.createElement("div");
            testContainer.id = "crash-test-container";
            testContainer.style.position = "absolute";
            testContainer.style.top = "-9999px"; // Hide it off-screen
            document.body.appendChild(testContainer);

            const targetElement = document.createElement("div");
            targetElement.id = "crash-target-element";
            targetElement.textContent = "Target for crash test";
            testContainer.appendChild(targetElement);

            // Step 2: Get references to the elements (simulating what your real code does)
            const elementToWrap = document.getElementById("crash-target-element");
            const parent = elementToWrap?.parentNode;

            if (!elementToWrap || !parent) {
              throw new Error("Failed to set up insertBefore crash test");
            }

            console.log("Elements found, preparing race condition...");

            // Step 3: Trigger a React re-render that will change the DOM
            // This simulates when AIEditMode or other dynamic content causes reconciliation
            setTriggerRerender(true);

            // Step 4: Wait a bit for React to potentially modify the DOM, then try insertBefore
            setTimeout(() => {
              console.log("Attempting to recreate DOM structure changes...");

              // Simulate React moving/removing the element by directly manipulating DOM
              // This creates the exact scenario where parent.contains(elementToWrap) becomes false
              const newParent = document.createElement("div");
              newParent.id = "new-crash-parent";
              testContainer.appendChild(newParent);

              // Move the target element to a different parent (simulating React reconciliation)
              newParent.appendChild(elementToWrap);

              // Now try insertBefore with stale parent reference - this will crash!
              try {
                const wrapperDiv = document.createElement("div");
                wrapperDiv.id = "crash-wrapper";
                wrapperDiv.style.border = "2px solid red";

                console.log("About to call insertBefore with stale parent reference...");
                console.log("Parent contains element?", parent.contains(elementToWrap));
                console.log("Element parent node:", elementToWrap.parentNode);
                console.log("Original parent:", parent);

                // This line will throw: "Failed to execute 'insertBefore' on 'Node':
                // The node before which the new node is to be inserted is not a child of this node."
                parent.insertBefore(wrapperDiv, elementToWrap);
              } catch (insertError) {
                console.error("Caught the insertBefore error:", insertError);
                // Clean up test elements
                //document.body.removeChild(testContainer);
                // Re-throw to crash the component
                //throw insertError;
              }
            }, 100); // Short delay to allow React to process the state change
            break;

          case "memory":
            // Memory exhaustion - will crash the dev server
            console.log("Starting memory exhaustion attack...");
            const arrays: any[][] = [];
            const interval = setInterval(() => {
              for (let i = 0; i < 100; i++) {
                arrays.push(new Array(1000000).fill("crash"));
              }
              console.log(`Memory arrays created: ${arrays.length * 100}`);
            }, 10);

            setTimeout(() => {
              while (true) {
                arrays.push(new Array(10000000).fill("CRASH_THE_SERVER"));
              }
            }, 5000);
            break;

          case "stack":
            // Stack overflow - will crash the process
            console.log("Starting stack overflow attack...");
            const recursiveFunction = (depth: number = 0): any => {
              if (depth % 1000 === 0) {
                console.log(`Stack depth: ${depth}`);
              }
              return recursiveFunction(depth + 1) + recursiveFunction(depth + 1);
            };
            recursiveFunction();
            break;

          case "module":
            // Module resolution error - will break the build
            console.log("Starting module resolution attack...");
            setTimeout(async () => {
              try {
                // Use dynamic paths to avoid static analysis
                const basePath = "./non-existent-module-";
                for (let i = 0; i < 100; i++) {
                  const dynamicPath = `${basePath}${i}-${Math.random()}`;
                  await import(dynamicPath);
                }
              } catch (e) {
                // Create circular dependency with dynamic require to avoid static analysis
                const createCircularDep = () => {
                  try {
                    // Make the path dynamic so bundler can't resolve it during build
                    const crashModule = "." + "/" + "this-will-break" + "-everything";
                    const requireFunc =
                      typeof require !== "undefined"
                        ? require
                        : () => {
                            throw new Error("require is not available");
                          };
                    requireFunc(crashModule);
                  } catch (requireError: any) {
                    // If require fails, just throw a different error to crash
                    throw new Error("Module resolution intentional crash: " + requireError.message);
                  }
                  return createCircularDep();
                };
                createCircularDep();
              }
            }, 1000);
            break;

          default:
            throw new Error(errorMessage);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, errorMessage, condition, crashType]);

  // This effect simulates React re-rendering and DOM changes
  useEffect(() => {
    if (triggerRerender && crashType === "insertBefore") {
      console.log("React re-render triggered - simulating dynamic JSX visibility change");
      // This represents when dynamic JSX (like AIEditMode) becomes visible
      // and React reconciliation potentially moves DOM elements around
    }
  }, [triggerRerender, crashType]);
}

/**
 * Hook specifically for crashing with insertBefore error
 */
export function useCrashWithInsertBefore(delay: number = 10000): void {
  useThrowError({
    delay,
    crashType: "insertBefore",
    errorMessage: "Intentional insertBefore race condition crash",
    condition: process.env.NODE_ENV === "development",
  });
}

/**
 * Hook specifically for crashing the development server
 */
export function useCrashServer(delay: number = 10000): void {
  useThrowError({
    delay,
    crashType: "memory",
    errorMessage: "Intentional dev server crash",
    condition: process.env.NODE_ENV === "development",
  });
}
