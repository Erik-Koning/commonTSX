//State + Ref combination (if you need both reactivity and ref-like behavior):

import { useEffect, useRef, useState } from "react";

export function useStateRef<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const ref = useRef<T>(initialValue);

  useEffect(() => {
    ref.current = state;
  }, [state]);

  return [state, setState, ref] as const;
}

////////
// Usage
////////
/*
function MyComponent() {
  const [value, valueSet, valueRef] = useStateRef(0);

  // value updates will trigger re-renders
  // valueRef.current gives you the latest value without re-renders
}
  */
