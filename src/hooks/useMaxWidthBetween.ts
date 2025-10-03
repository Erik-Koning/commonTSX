import { useEffect, useState } from "react";

export const useMaxWidthBetween = (refs?: React.RefObject<HTMLElement | null>[]) => {
  const [maxWidth, setMaxWidth] = useState(0);

  useEffect(() => {
    if (!refs || refs.length === 0) return;
    const updateWidth = () => {
      const [leftRef, rightRef] = refs;

      if (leftRef.current && rightRef.current) {
        const leftRect = leftRef.current.getBoundingClientRect();
        const rightRect = rightRef.current.getBoundingClientRect();

        const availableWidth = rightRect.left - leftRect.right;
        setMaxWidth(availableWidth);
      }
    };

    if (refs && refs.length > 0) {
      updateWidth();
      window.addEventListener("resize", updateWidth);
    }

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [refs]);

  return maxWidth;
};
