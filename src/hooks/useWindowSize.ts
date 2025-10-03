import { useState, useEffect } from "react";

export interface WindowSize {
  innerHeight: number;
  innerWidth: number;
  outerHeight: number;
  outerWidth: number;
}

const useWindowSize = (enable?: boolean): WindowSize | undefined => {
  const [windowSize, setWindowSize] = useState<WindowSize | undefined>(undefined);

  const getWindowSize = () => ({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    outerHeight: window.outerHeight,
    outerWidth: window.outerWidth,
  });

  //on first render, set the window size
  useEffect(() => {
    setWindowSize(getWindowSize());
  }, []);

  useEffect(() => {
    if (enable === false) return;
    const handleResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enable]);

  return windowSize;
};

export default useWindowSize;
