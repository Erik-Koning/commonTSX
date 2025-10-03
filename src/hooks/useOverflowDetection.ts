"use client";

import { RefObject, useLayoutEffect, useState } from "react";

interface OverflowState {
  horizontal: boolean;
  vertical: boolean;
  any: boolean;
}

function useOverflowDetection(ref: RefObject<HTMLElement | null>, debounceDelay: number = 100, dependents?: any[]): OverflowState {
  const [overflowState, setOverflowState] = useState<OverflowState>({
    horizontal: false,
    vertical: false,
    any: false,
  });

  useLayoutEffect(() => {
    if (!ref.current) return;

    let timeoutId: NodeJS.Timeout;

    const updateOverflow = () => {
      const element = ref.current;
      if (!element) return;

      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
      const hasVerticalOverflow = element.scrollHeight > element.clientHeight;

      setOverflowState({
        horizontal: hasHorizontalOverflow,
        vertical: hasVerticalOverflow,
        any: hasHorizontalOverflow || hasVerticalOverflow,
      });
    };

    const debouncedUpdateOverflow = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateOverflow, debounceDelay);
    };

    // Initial check
    updateOverflow();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(debouncedUpdateOverflow);
    resizeObserver.observe(ref.current);

    // Watch for content changes
    const mutationObserver = new MutationObserver(debouncedUpdateOverflow);
    mutationObserver.observe(ref.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, debounceDelay, ...(dependents || [])]);

  return overflowState;
}

export default useOverflowDetection;
