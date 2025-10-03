import React, { Dispatch, SetStateAction, useEffect, useImperativeHandle, useRef, forwardRef, useState } from "react";

interface HandleHoverStateTogglerProps {
  setSettersEnterTrue?: Dispatch<SetStateAction<boolean>>[];
  setSettersEnterFalse?: Dispatch<SetStateAction<boolean>>[];
  setSettersLeaveTrue?: Dispatch<SetStateAction<boolean>>[];
  setSettersLeaveFalse?: Dispatch<SetStateAction<boolean>>[];
  disableSetters?: boolean;
  disableSettersEnter?: boolean;
  disableSettersLeave?: boolean;
  children: any;
  style?: React.CSSProperties; // Include style prop
  className?: string; // Include className prop
}

export interface HandleHoverStateTogglerRef {
  handleLeave: () => void;
}

export const HandleHoverStateToggler = React.forwardRef<HandleHoverStateTogglerRef, HandleHoverStateTogglerProps>(
  (
    {
      setSettersEnterTrue,
      setSettersEnterFalse,
      setSettersLeaveTrue,
      setSettersLeaveFalse,
      disableSetters = false,
      disableSettersEnter = false,
      disableSettersLeave = false,
      children,
      style,
      className,
    },
    ref
  ) => {
    const [hasEntered, setHasEntered] = React.useState(false);

    // Use style directly
    const handleEnter = () => {
      setHasEntered(true);
      if (disableSettersEnter || disableSetters) return;
      ////console.log("HANDLE ENTER", setSettersEnterTrue, setSettersEnterFalse);
      if (setSettersEnterTrue)
        setSettersEnterTrue.forEach((setter) => {
          ////console.log("SETTER", setter);
          setter(true);
        });
      if (setSettersEnterFalse) setSettersEnterFalse.forEach((setter) => setter(false));
    };

    const handleLeave = () => {
      setHasEntered(false);
      if (disableSettersLeave || disableSetters) return;
      if (setSettersLeaveTrue) setSettersLeaveTrue.forEach((setter) => setter(true));
      if (setSettersLeaveFalse) setSettersLeaveFalse.forEach((setter) => setter(false));
    };

    useImperativeHandle(ref, () => ({
      handleLeave,
    }));

    return (
      <div onPointerEnter={handleEnter} onPointerLeave={handleLeave} style={style} className={className}>
        {children}
      </div>
    );
  }
);
HandleHoverStateToggler.displayName = "HandleHoverStateToggler";
