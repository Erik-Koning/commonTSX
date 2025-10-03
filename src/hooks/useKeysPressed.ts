import { countUniqueStrings, safelyGetOverflowIndicesFrom2dArray } from '../utils/objectManipulation';
import { isInstanceOfRegExp } from '../utils/regex';
import { useEffect, useRef } from "react";

// Calls the callback if the specified keys are pressed
export function useKeysPressed(
  callback: (ev?: KeyboardEvent) => void | ((ev?: KeyboardEvent) => void)[], //for callback arrays the nth callback will be called if the nth targetKeys are pressed
  targetKeys: ((string | RegExp) | (string | RegExp)[])[] = ["Meta", "Win"], // Command or Windows key, for multi-key shortcuts ex: [["Meta", "a"], ["Meta", "b"]] for Meta+a and Meta+b
  enable: boolean | boolean[] = true, // Enable or disable the hook
  satisfyAllTargets = false, //only applies to single depth targetKeys, all must be pressed for depth 2 targetKeys
  matchIndexOrder: (boolean | boolean[])[] = [], //if true, the targetKeys must be pressed in the order they are specified
  numKeysPressedMatchTargetKeysLength: boolean | boolean[] = true, //if true, the number of keys pressed must match the length of targetKeys for that targetKey to be satisfied
  ignoreKeys: string[] = [], //if true, the CMD or Control key will not be converted to the letter
  ignoreUnlessStartsWith?: string[], //Keys which the currently pressed keys or newlt pressed key must start with or be ignored
  ignoreAltConversion = false, //if true, the alt key will not be converted to the letter
  resetTimeout?: number, //if true, the keys will be reset after the timeout
  onVisibilityChange?: (isVisible: boolean) => void,
  disableDownHandlerAfterFirstKeyPress = false, //if true, the down handler will not be called after the first key press
  debug = false //if true, the targetKeys will be logged to the console
) {
  //holds the keys that are currently pressed
  const pressedKeysRef = useRef<Array<string>>([]);
  // Timeout reference to clear the pressed keys after 5 seconds.
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Flag to disable processing in the downHandler once a key has already been pressed.
  const disableDownHandler = useRef<boolean>(false);

  // Function to clear the pressed keys
  const clearKeys = () => {
    if (pressedKeysRef.current.length > 0) {
      console.log("Clearing pressed keys after timeout.");
      pressedKeysRef.current = [];
      disableDownHandler.current = false;
    }
    timeoutIdRef.current = null;
  };

  function getLetterIgnoringAlt(event: KeyboardEvent): string {
    // If Alt is pressed and the code starts with "Key", extract the letter.
    if (event.altKey && event.code.startsWith("Key")) {
      // Convert the physical key to a lowercase letter.
      return event.code.substring(3).toLowerCase();
    }
    // Otherwise return the normal key value.
    return event.key;
  }

  const targetKeyIsValid = (targetKey: string | RegExp, keyToMatch?: string): boolean => {
    if (typeof targetKey === "string" && (keyToMatch ? keyToMatch === targetKey : pressedKeysRef.current.includes(targetKey))) {
      return true;
    } else if (isInstanceOfRegExp(targetKey) && (keyToMatch ? targetKey.test(keyToMatch) : pressedKeysRef.current.some((k) => targetKey.test(k)))) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (debug) debugger;

      //The key pressed, ignoring Alt if ignoreAltConversion is true
      const key = ignoreAltConversion ? getLetterIgnoringAlt(event) : event.key;
      if (!key) return;
      if (ignoreUnlessStartsWith && ignoreUnlessStartsWith.length > 0) {
        //check the rest if more than one key is pressed
        const tempPressed = [...pressedKeysRef.current, key];
        if (!ignoreUnlessStartsWith.includes(tempPressed[0])) {
          return;
        }
      }
      // Debug log keydown events with current keys pressed:
      if (debug) console.log("event", event, `KeyDown: "${key}"  Pressed keys:`, [...pressedKeysRef.current]);

      if (pressedKeysRef.current.includes(key)) return;
      if (ignoreKeys.includes(key)) {
        pressedKeysRef.current = pressedKeysRef.current.filter((k) => !ignoreKeys.includes(k));
        return;
      }
      // Every keydown resets the timer.
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      // Set a new timeout to clear the keys after the reset timeout.
      if (resetTimeout !== undefined) {
        timeoutIdRef.current = setTimeout(clearKeys, resetTimeout);
      }

      pressedKeysRef.current.push(key);
      if (satisfyAllTargets && numKeysPressedMatchTargetKeysLength) {
        const matchNumKeysPressed = Array.isArray(numKeysPressedMatchTargetKeysLength)
          ? numKeysPressedMatchTargetKeysLength[0]
            ? countUniqueStrings(targetKeys)
            : undefined
          : countUniqueStrings(targetKeys);
        if (matchNumKeysPressed && pressedKeysRef.current.length !== matchNumKeysPressed) {
          return;
        }
      }

      const numPressedKeys = pressedKeysRef.current.length;
      const maxTargetKeys = Array.isArray(targetKeys[0]) ? Math.max(...targetKeys.map((t) => (Array.isArray(t) ? t.length : 1))) : targetKeys.length;
      let count = -1;
      let i = -1;
      for (const targetKey of targetKeys) {
        i++;

        if (Array.isArray(targetKey)) {
          //check if the number of keys pressed matches the length of the targetKey - useful to prevent callback of a function that includes one of the pressed keys but not all
          if (numKeysPressedMatchTargetKeysLength) {
            const matchNumKeysPressed = Array.isArray(numKeysPressedMatchTargetKeysLength)
              ? numKeysPressedMatchTargetKeysLength[i]
                ? targetKey.length
                : undefined
              : targetKey.length;
            if (matchNumKeysPressed && numPressedKeys !== matchNumKeysPressed) {
              continue;
            }
          }

          //all keys in targetKey must be pressed
          let hasAllKeys = true;
          let j = -1;
          for (const tarKey of targetKey) {
            j++;
            const mustMatchIndex = safelyGetOverflowIndicesFrom2dArray(matchIndexOrder, i, j) ?? true;
            const keyToMatch = mustMatchIndex ? pressedKeysRef.current[j] : undefined;
            if (!targetKeyIsValid(tarKey, keyToMatch)) {
              hasAllKeys = false;
              break;
            }
          }
          if (hasAllKeys) {
            count++;
            if (!satisfyAllTargets) {
              const func = safelyGetOverflowIndicesFrom2dArray(callback as any, i) as (ev: KeyboardEvent) => void | undefined;
              func && func(event);
              if (numPressedKeys === maxTargetKeys) {
                //reset the pressed keys
                pressedKeysRef.current = [];
                return;
              }
            }
          }
        } else {
          //targetKey is a single key
          const mustMatchIndex = safelyGetOverflowIndicesFrom2dArray(matchIndexOrder, i) ?? true;
          const keyToMatch = mustMatchIndex ? pressedKeysRef.current[i] : undefined;
          //targetKey is a single key
          if (targetKeyIsValid(targetKey, keyToMatch)) {
            count++;
            if (!satisfyAllTargets) {
              //we have a match, call the callback
              const func = safelyGetOverflowIndicesFrom2dArray(callback as any, i) as (ev: KeyboardEvent) => void | undefined;
              func && func(event);
            } else if (satisfyAllTargets) {
              //visited all targetKeys, and all targetKeys have been satisfied
              if (count === targetKeys.length - 1) {
                let func = Array.isArray(callback) ? (callback[0] as (ev: KeyboardEvent) => void) : (callback as (ev: KeyboardEvent) => void | undefined);
                func && func(event);
              }
            }
            if (count === maxTargetKeys - 1) {
              //reset the pressed keys
              pressedKeysRef.current = [];
            }
          } else if (satisfyAllTargets) {
            //but targetKey is not satisfied
            return;
          }
        }
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      const { key } = event;
      if (!key || !pressedKeysRef.current.includes(key)) return;
      pressedKeysRef.current = pressedKeysRef.current.filter((k) => k !== key);

      //no more keys pressed, clear the timer
      if (pressedKeysRef.current.length === 0) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        // When no keys are pressed, re-enable the downHandler.
        disableDownHandler.current = false;
      }
    };

    const handleWindowBlur = () => {
      if (onVisibilityChange) {
        disableDownHandler.current = false;
        onVisibilityChange(false);
      }
    };

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      if (onVisibilityChange) {
        disableDownHandler.current = false;
        onVisibilityChange(isVisible);
      }
    };

    if (enable) {
      // Listen for visibility change on the document
      //document.addEventListener("visibilitychange", handleVisibilityChange);  //For only tab blur, triggers on tab change, not when OS app is blurred
      window.addEventListener("blur", handleWindowBlur); //For tab and application blurs
      window.addEventListener("keydown", downHandler);
      window.addEventListener("keyup", upHandler);
    } else {
      pressedKeysRef.current = [];
    }

    return () => {
      // Always clean up unconditionally.
      //document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
      //Don't reset the pressedKeysRef here, or will loose state of keys pressed if a callback is called
      //pressedKeysRef.current = [];
    };
  }, [targetKeys, callback, satisfyAllTargets, enable]);
}
