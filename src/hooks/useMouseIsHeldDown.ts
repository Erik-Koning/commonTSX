import { useState, useEffect, useRef } from "react";

const useMouseIsHeldDown = (duration = 200, enable = true) => {
  const [isHeld, setIsHeld] = useState(false);
  let holdTimerRef: NodeJS.Timeout;

  const startHold = () => {
    setIsHeld(false);
    holdTimerRef = setTimeout(() => {
      setIsHeld(true);
    }, duration);
  };

  const endHold = () => {
    clearTimeout(holdTimerRef);
    setIsHeld(false);
  };

  useEffect(() => {
    if (!enable) return;
    document.addEventListener("mousedown", startHold);
    document.addEventListener("mouseup", endHold);

    return () => {
      document.removeEventListener("mousedown", startHold);
      document.removeEventListener("mouseup", endHold);
      clearTimeout(holdTimerRef);
    };
  }, [enable]);

  return isHeld;
};

export default useMouseIsHeldDown;
