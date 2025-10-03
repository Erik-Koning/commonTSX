import throttle from "lodash/throttle";
import { useState, useEffect, useCallback } from "react";

interface UseMousePositionProps {
  enableGetMousePosition?: boolean;
  relativeToViewport?: boolean;
  throttleMs?: number;
}

const useMousePosition = ({ enableGetMousePosition = true, relativeToViewport = false, throttleMs = 70 }: UseMousePositionProps = {}) => {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  //memoized update function
  const updatePosition = useCallback(
    throttle((event) => {
      const { pageX, pageY, clientX, clientY } = event;

      if (relativeToViewport) {
        setPosition({
          x: clientX,
          y: clientY,
        });
      } else {
        setPosition({
          x: pageX,
          y: pageY,
        });
      }
    }, throttleMs),
    [relativeToViewport]
  );

  useEffect(() => {
    if (enableGetMousePosition) {
      document.addEventListener("mousemove", updatePosition, false);
      document.addEventListener("mouseenter", updatePosition, false);
    }

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", updatePosition);
    };
  }, [enableGetMousePosition]);

  return position;
};

export default useMousePosition;
