import React, { ReactElement, ReactNode } from "react";
import { useWatch, Control } from "react-hook-form";

interface UseWatchWrapperProps {
  control: Control;
  name: string;
  defaultValue?: any;
  children: ReactElement<any>;
}

// useful for wrapping components that need useWatch so values are not lost on re-renders
const UseWatchWrapper: React.FC<UseWatchWrapperProps> = ({ control, name, defaultValue, children }) => {
  const value = useWatch({
    control,
    name,
  });

  return React.cloneElement(children, { ...children.props, value: value ?? defaultValue });
};

export default UseWatchWrapper;
