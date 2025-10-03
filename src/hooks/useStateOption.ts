import { useState, useRef, useCallback, Dispatch, SetStateAction } from "react";

function useStateOption<T>(initialValue: T, rerender: boolean = false): [T, (value: SetStateAction<T>, forceRerender?: boolean) => void, () => T] {
  const [state, setState] = useState<T>(initialValue);
  const ref = useRef<T>(initialValue);

  const stateGetter = (): T => {
    return ref.current;
  };

  const stateSetter = useCallback(
    (value: SetStateAction<T>, forceRerender?: boolean) => {
      const newValue = typeof value === "function" ? (value as (prevState: T) => T)(ref.current) : value;
      ref.current = newValue;

      if (rerender || forceRerender) {
        setState(newValue);
      }
    },
    [rerender]
  );

  //even if rerender is false, if setState is called, the state will be updated and the component using the hook will rerender
  return [rerender ? state : ref.current, stateSetter, stateGetter];
}

////////
// Usage
////////
/*
  const [value, setter, getter] = useStateOption("the string");
  function randomNumber(max: number = 10) {
    // Simple client-side random number generator
    return Math.floor(Math.random() * max);
  }

  function showValue() {
    console.log("value, ", getter());
  }
  
  return(
    <PageContentContainer className="-mt-navbar-height px-10 pt-20" variant={"blank"}>
      <div className="w-[200px] bg-faintBlue">
        <Button
          onClick={() => {
            setter(getter() + String(randomNumber()), true);
          }}
          title="state"
        />
        <Button
          onClick={() => {
            setter(getter() + String(randomNumber()), false);
          }}
          title="ref"
        />
        <Button
          onClick={() => {
            showValue();
          }}
          title="show"
        />
  )
  */

export default useStateOption;
