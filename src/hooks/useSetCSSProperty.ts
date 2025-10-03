import { allDefined } from '../utils/types';
import { useLayoutEffect, RefObject } from "react";

function useSetCSSProperty(ref: RefObject<HTMLElement | null>, propertyName: string, value: string | number | undefined, onlySetIfDefined: any[]) {
  useLayoutEffect(() => {
    if (ref.current && allDefined(onlySetIfDefined)) {
      ref.current.style.setProperty(propertyName, `${value}`);
    }
  }, [ref, propertyName, value]);
}

export default useSetCSSProperty;
