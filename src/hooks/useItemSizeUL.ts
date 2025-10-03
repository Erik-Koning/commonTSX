import { useState, useEffect } from "react";

export interface ItemSizeUL {
  upperLeftPosition: { x: number; y: number };
  width: number;
  height: number;
}

export const getMaxElemWidthByRef = (ref?: any): number | null => {
  if (ref && ref.current) {
    const parent = ref.current.parentElement; // Get the parent element
    if (parent) {
      const parentRect = parent.getBoundingClientRect(); // Parent's dimensions
      const computedStyles = window.getComputedStyle(ref.current); // Current element's styles

      // Calculate max width considering padding and margins
      const maxWidth = parentRect.width - parseFloat(computedStyles.marginLeft) - parseFloat(computedStyles.marginRight);

      return maxWidth;
    }
  }
  return null; // Return null if no valid ref or parent
};

export const getElemSizeULByRef = (ref: any): ItemSizeUL => {
  if (ref && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    ////console.log("rect", rect);
    const x = rect.left;
    const y = rect.top;
    const w = rect.width;
    const h = rect.height;
    return { upperLeftPosition: { x, y }, width: w, height: h };
  }
  return { upperLeftPosition: { x: 0, y: 0 }, width: 0, height: 0 };
};

//returns the fixed position of the upper left corner of the element, as well as its width and height
export function useItemSizeUL(ref?: React.RefObject<HTMLElement | null>, enable: boolean = true, otherDependencies: any[] = []): ItemSizeUL {
  const [upperLeftPosition, setUpperLeftPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const handleResize = () => {
    const { upperLeftPosition: XY, width, height } = getElemSizeULByRef(ref);
    if (XY && width && height) {
      setUpperLeftPosition(XY);
      setWidth(width);
      setHeight(height);
    }
  };

  // Create a MutationObserver instance
  const observer = new MutationObserver(handleResize);

  // Specify what to observe (target node and what types of mutations)
  observer.observe(document.body, {
    attributes: true, // observe attribute changes
    childList: false, // observe direct children additions or removals
    subtree: false, // observe all descendants
    // You might include other configurations as needed
  });

  useEffect(() => {
    if (!enable || !ref) return;
    const { upperLeftPosition: XY, width, height } = getElemSizeULByRef(ref);
    if (XY && width && height) {
      setUpperLeftPosition(XY);
      setWidth(width);
      setHeight(height);
    }
    // Run the handleResize function when the ref loads
    setTimeout(() => {
      handleResize();
    }, 100);
    window.addEventListener("resize", handleResize);
    //window.addEventListener("pointerup", handleResize);
    //window.addEventListener("pointerleave", handleResize);
    //window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      //window.removeEventListener("pointerup", handleResize);
      //window.removeEventListener("pointerleave", handleResize);
      //window.removeEventListener('scroll', handleResize);
    };
  }, [ref, enable, ...otherDependencies]);

  return { upperLeftPosition, width, height };
}
