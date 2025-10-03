import { useState, useLayoutEffect } from "react";
import { getElemSizeULByRef } from "./useItemSizeUL";
import { debug } from "console";

const useOverflowing = (
  containerRef: React.RefObject<HTMLElement | null>,
  innerRef: React.RefObject<HTMLElement | null>,
  maxWidthPX?: number,
  enable?: boolean,
  dependencies: any[] = []
) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (!enable) return;
    const { upperLeftPosition: XY, width, height } = getElemSizeULByRef(containerRef);
    const { upperLeftPosition: wordXY, width: wordWidth, height: wordHeight } = getElemSizeULByRef(innerRef);

    if ((maxWidthPX && wordWidth >= maxWidthPX) || wordXY.x + wordWidth >= XY.x + width) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [dependencies, containerRef, innerRef, maxWidthPX, enable]);

  return isOverflowing;
};

export default useOverflowing;
