import { useEffect, useRef, useState } from "react";

export const useDebounce = (value?: string, delay: number = 200): string | undefined => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  let debouncedChange = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (debouncedChange.current) {
      clearTimeout(debouncedChange.current);
      debouncedChange.current = null;
    }
    debouncedChange.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      if (debouncedChange.current) {
        clearTimeout(debouncedChange.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};
