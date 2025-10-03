"use client";

import { RefObject, useEffect, useState } from "react";

interface ElementsChangeDetectorOptions {
  observeResize?: boolean;
  observeMutations?: boolean;
  debounceMs?: number;
}

function useElementsChangeDetector(
  refs?: RefObject<HTMLElement | null>[],
  options: ElementsChangeDetectorOptions = {
    observeResize: true,
    observeMutations: true,
    debounceMs: 100,
  }
) {
  const [changeCounter, setChangeCounter] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!refs) return;
    // Filter out null refs
    const validRefs = refs.filter((ref) => ref.current);
    if (validRefs.length === 0) return;

    const triggerChange = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debouncing
      const newTimeoutId = setTimeout(() => {
        setChangeCounter((prev) => prev + 1);
      }, options.debounceMs);

      setTimeoutId(newTimeoutId);
    };

    const observers: (ResizeObserver | MutationObserver)[] = [];

    if (options.observeResize) {
      const resizeObserver = new ResizeObserver(triggerChange);
      validRefs.forEach((ref) => ref.current && resizeObserver.observe(ref.current));
      observers.push(resizeObserver);
    }

    if (options.observeMutations) {
      const mutationObserver = new MutationObserver(triggerChange);
      validRefs.forEach((ref) => {
        ref.current &&
          mutationObserver.observe(ref.current, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
          });
      });
      observers.push(mutationObserver);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [refs, options.observeResize, options.observeMutations, options.debounceMs]);

  return changeCounter;
}

export default useElementsChangeDetector;
