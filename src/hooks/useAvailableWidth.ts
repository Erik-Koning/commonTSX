//max width of a container

import { useEffect, useState } from "react";

export const useAvailableWidth = (containerRef: any) => {
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const rightContentWidth = containerRef.current.querySelector(".right-content")?.offsetWidth || 0;
        setAvailableWidth(containerWidth - rightContentWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [containerRef]);

  return availableWidth;
};
