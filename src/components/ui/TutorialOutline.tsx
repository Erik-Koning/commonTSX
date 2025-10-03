"use client";

import { useItemSizeUL } from '../../hooks/useItemSizeUL';
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface TutorialProps {
  text: string;
  children: React.ReactNode;
  enable?: boolean;
}

const Tutorial: React.FC<TutorialProps> = ({ text, enable = true, children }) => {
  const [showTutorial, setShowTutorial] = useState(enable);
  const [topRightInfo, setTopRightInfo] = useState<{
    topRightPosition: { x: number; y: number };
    width: number;
    height: number;
  } | null>(null);

  const tutorialRef = useRef<HTMLDivElement>(null);

  const handleDismiss = () => {
    setShowTutorial(false);
  };

  // Call useItemSizeAndTopRight and set the values to state
  let { upperLeftPosition, width, height } = useItemSizeUL(
    tutorialRef // Pass the ref to the hook
  );

  ////console.log("topRightPosition", topRightPosition, "width", width, "height", height);

  useLayoutEffect(() => {
    // Access the outermost div element when the component mounts
    const outermostDiv = tutorialRef.current;
    if (outermostDiv) {
    }
  }, [tutorialRef]);

  if (!enable) return <>{children}</>;

  return (
    <>
      {showTutorial ? (
        // Create a portal to render the tutorial text outside the normal DOM hierarchy
        <div>
          {ReactDOM.createPortal(
            <div className="fixed inset-0 z-30 flex items-center justify-center">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                <p>{text}</p>
                <button onClick={handleDismiss} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Dismiss
                </button>
              </div>
            </div>,
            document.body // Render the portal into the body of the document
          )}
          <div className="fixed inset-0 bg-gray-200 blur-md filter backdrop-blur-md">
            <div ref={tutorialRef}>{children}</div>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </>
  );
};

export default Tutorial;
