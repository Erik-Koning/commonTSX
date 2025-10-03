import { RefObject, useEffect, useRef } from "react";

export function useUserUnengaged(
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[] | null,
  callback: () => void,
  duration: number | null = 6000,
  enable = true,
  startTimerOnEnable = false,
  startTimerOnEnableDuration = 6000,
  captureEvent = false
) {
  const timeoutRef = useRef<NodeJS.Timeout | number>(null);

  function handleMouseLeave(e: any, timeDuration: number | null = duration) {
    if (timeDuration === null) {
      return;
    }
    //console.log("handleMouseLeave");
    timeoutRef.current = setTimeout(() => {
      callback();
    }, timeDuration); // Start the timer when the mouse leaves
  }

  function handleMouseEnter() {
    timeoutRef.current && clearTimeout(timeoutRef.current); // Clear the timer if the mouse re-enters
  }

  function handleClickOutside(event: any) {
    if (!ref) return;
    //console.log("handleClickOutside");
    if (Array.isArray(ref)) {
      let isInsideAtLeastOneRef = false;

      ref.forEach((refItem) => {
        if (refItem.current && refItem.current.contains(event.target)) {
          isInsideAtLeastOneRef = true;
        }
      });
      if (!isInsideAtLeastOneRef) {
        callback();
      }
    } else {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
  }

  useEffect(() => {
    if (!ref) return;
    //console.log("useUserUnengaged111");
    if (!enable) {
      // Cleanup: remove event listeners when disabled
      if (Array.isArray(ref)) {
        ref.forEach((refItem) => {
          refItem.current?.removeEventListener("mouseleave", handleMouseLeave);
          refItem.current?.removeEventListener("mouseenter", handleMouseEnter);
        });
      } else {
        ref.current?.removeEventListener("mouseleave", handleMouseLeave);
        ref.current?.removeEventListener("mouseenter", handleMouseEnter);
      }
      document.removeEventListener("mousedown", handleClickOutside);
      timeoutRef.current && clearTimeout(timeoutRef.current);
      return;
    }

    if (startTimerOnEnable) {
      handleMouseLeave(undefined, startTimerOnEnableDuration);
    }

    // Bind the event listeners if the ref(s) exists
    if (Array.isArray(ref)) {
      let thereIsAtLeastOneRef = false;
      ref.forEach((refItem) => {
        if (refItem.current) {
          thereIsAtLeastOneRef = true;
          refItem.current.addEventListener("mouseleave", handleMouseLeave);
          refItem.current.addEventListener("mouseenter", handleMouseEnter);
        }
      });
      if (thereIsAtLeastOneRef) {
        document.addEventListener("mousedown", handleClickOutside);
      }
    } else if (ref.current) {
      document.addEventListener("mousedown", handleClickOutside);
      ref.current?.addEventListener("mouseleave", handleMouseLeave);
      ref.current?.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      // Unbind the event listeners and clear timeout on clean up
      document.removeEventListener("mousedown", handleClickOutside);
      if (Array.isArray(ref)) {
        ref.forEach((refItem) => {
          refItem.current?.removeEventListener("mouseleave", handleMouseLeave);
          refItem.current?.removeEventListener("mouseenter", handleMouseEnter);
        });
      } else {
        ref.current?.removeEventListener("mouseleave", handleMouseLeave);
        ref.current?.removeEventListener("mouseenter", handleMouseEnter);
      }
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [ref, startTimerOnEnable, enable]);

  // Additional clean-up to handle component unmounting
  useEffect(() => {
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, []);
}
