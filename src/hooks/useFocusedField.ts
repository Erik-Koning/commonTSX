import { useState, useEffect, useRef, MutableRefObject } from "react";

/**
 * useFocusedField - Tracks the currently focused field.
 *
 * If you pass an external ref (e.g., created by useRef<string | null>(null)), the hook
 * updates that ref's .current value on focus changes without triggering re-renders.
 *
 * If no external ref is provided, the hook falls back to internal state and returns
 * both the stateful value and the ref.
 *
 * @param externalRef Optional external ref to store the current focused field (string or null).
 * @returns If externalRef is provided, returns that ref; otherwise returns an object
 *          with { focusedField, focusedFieldRef }.
 */
function useFocusedField(externalRef?: MutableRefObject<string | null>) {
  // Fallback: when no external ref is provided use internal state for reactive updates.
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const internalRef = useRef<string | null>(null);
  // Use the external ref if given; otherwise, use the internalRef.
  const effectiveRef = externalRef ?? internalRef;

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      const newFocus = target.id;
      effectiveRef.current = newFocus;
      if (!externalRef) {
        // Only update state if no external ref provided.
        setFocusedField(newFocus);
      }
    }
  };

  const handleBlur = () => {
    effectiveRef.current = null;
    if (!externalRef) {
      setFocusedField(null);
    }
  };

  useEffect(() => {
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [externalRef]);

  // If an external ref was provided, return it directly; otherwise, return both.
  if (externalRef) {
    return effectiveRef;
  }
  return { focusedField, focusedFieldRef: effectiveRef };
}

export default useFocusedField;
