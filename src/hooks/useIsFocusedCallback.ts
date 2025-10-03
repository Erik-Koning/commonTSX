import { useState, useCallback } from "react";

export function useIsFocusedCallback() {
  const [isFocused, setIsFocused] = useState(false);

  const onFocusSetter = useCallback((e: any) => setIsFocused(true), []);
  const onBlurSetter = useCallback((e: any) => setIsFocused(false), []);

  return { isFocused, onFocusSetter, onBlurSetter };
}
