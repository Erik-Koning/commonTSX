import { RefObject, useLayoutEffect, useState } from "react";

type ScrollMetrics = {
  scrollHeight?: number;
  scrollWidth?: number;
  clientHeight?: number;
  clientWidth?: number;
  scrollTop?: number;
  scrollLeft?: number;
  offsetHeight?: number;
  offsetWidth?: number;
};

function useScrollDimensions(
  ref: RefObject<HTMLElement | null>,
  properties: (keyof ScrollMetrics)[] = ["scrollHeight", "clientHeight"],
  debug: boolean = false
): ScrollMetrics {
  const [dimensions, setDimensions] = useState<ScrollMetrics>({});

  useLayoutEffect(() => {
    if (!ref.current) return;

    const updateDimensions = () => {
      const element = ref.current;
      if (!element) return;

      const newDimensions: ScrollMetrics = {};
      properties.forEach((prop) => {
        if (prop in element) {
          newDimensions[prop] = element[prop] as number;
        }
      });

      if (debug) {
        console.log("New dimensions:", newDimensions);
      }

      setDimensions((prev) => {
        const hasChanged = properties.some((prop) => prev[prop] !== newDimensions[prop]);
        return hasChanged ? newDimensions : prev;
      });
    };

    // Initial measurement
    updateDimensions();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(ref.current);

    // Watch for content changes
    const mutationObserver = new MutationObserver(updateDimensions);
    mutationObserver.observe(ref.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, ...properties]);

  return dimensions;
}

export default useScrollDimensions;
