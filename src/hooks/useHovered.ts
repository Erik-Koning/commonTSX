import { useState, useEffect, useCallback } from "react";

interface UseHoverStateOptions {
  setSettersEnterTrue?: React.Dispatch<React.SetStateAction<boolean>>[];
  setSettersEnterFalse?: React.Dispatch<React.SetStateAction<boolean>>[];
  setSettersLeaveTrue?: React.Dispatch<React.SetStateAction<boolean>>[];
  setSettersLeaveFalse?: React.Dispatch<React.SetStateAction<boolean>>[];
  disableSetters?: boolean;
  disableSettersEnter?: boolean;
  disableSettersLeave?: boolean;
}

export function useHoverState(refs: React.RefObject<HTMLElement | null>[], options?: UseHoverStateOptions): boolean {
  const [hasEntered, setHasEntered] = useState(false);

  const handleEnter = useCallback(() => {
    setHasEntered(true);
    if (options?.disableSettersEnter || options?.disableSetters) return;

    if (options?.setSettersEnterTrue) {
      options.setSettersEnterTrue.forEach((setter) => setter(true));
    }
    if (options?.setSettersEnterFalse) {
      options.setSettersEnterFalse.forEach((setter) => setter(false));
    }
  }, [options]);

  const handleLeave = useCallback(() => {
    setHasEntered(false);
    if (options?.disableSettersLeave || options?.disableSetters) return;

    if (options?.setSettersLeaveTrue) {
      options.setSettersLeaveTrue.forEach((setter) => setter(true));
    }
    if (options?.setSettersLeaveFalse) {
      options.setSettersLeaveFalse.forEach((setter) => setter(false));
    }
  }, [options]);

  useEffect(() => {
    if (options?.disableSetters) return;
    const elements = refs.map((ref) => ref.current).filter(Boolean) as HTMLElement[];

    elements.forEach((element) => {
      element.addEventListener("pointerenter", handleEnter);
      element.addEventListener("pointerleave", handleLeave);
    });

    return () => {
      elements.forEach((element) => {
        element.removeEventListener("pointerenter", handleEnter);
        element.removeEventListener("pointerleave", handleLeave);
      });
    };
  }, [refs, handleEnter, handleLeave]);

  return hasEntered;
}
