import { useCallback } from "react";

//custom hook for merging refs
export const useMergedRef = <T>(...refs: any[]): React.RefCallback<T> => {
  return useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (!ref) return;

        if (typeof ref === "function") {
          ref(element);
        } else {
          (ref as React.MutableRefObject<T>).current = element;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
};
