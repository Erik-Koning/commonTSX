import React, { useEffect, useState, forwardRef } from "react";
import { Input, InputProps } from "./Input";

interface DebouncedInputProps extends Omit<InputProps, "value" | "onChange"> {
  id: string; // The id of the input
  value?: string; // The value of the input
  onChange: (value: string) => void; // The function to call when the value changes
  debounce?: number; // The time to wait before calling the onChange function in milliseconds
}

const DebouncedInput = forwardRef<HTMLInputElement, DebouncedInputProps>(({ id, value, onChange, debounce = 250, ...props }, ref) => {
  const [valueLoc, setValueLoc] = useState(undefined);
  const [prevValueLoc, setPrevValueLoc] = useState(undefined);

  let waitToCallOnChange: NodeJS.Timeout | undefined = undefined;

  useEffect(() => {
    if (value !== undefined) return;
    setValueLoc(value);
  }, [value]);

  useEffect(() => {
    if (valueLoc === prevValueLoc) return;
    if (waitToCallOnChange) clearTimeout(waitToCallOnChange);
    waitToCallOnChange = undefined;

    setPrevValueLoc(valueLoc);
    waitToCallOnChange = setTimeout(() => {
      onChange(valueLoc);
    }, debounce);

    return () => clearTimeout(waitToCallOnChange);
  }, [valueLoc, onChange, debounce]);

  return <Input id={id} ref={ref} value={valueLoc} onChange={(e) => setValueLoc(e.target.value)} {...props} />;
});

DebouncedInput.displayName = "DebouncedInput";

export { DebouncedInput };
