import React, { CSSProperties, useEffect, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import TextIncreaseOutlinedIcon from "@mui/icons-material/TextIncreaseOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import { Button } from "./Button";
import { isSubset } from '../../utils/objectManipulation';
import { cn } from '../../lib/utils';
import useWindowSize from '../../hooks/useWindowSize';
import { Properties } from "csstype";

interface TextFieldBubblesProps {
  limitNumberVisible?: number;
  fieldValues: { [key: string]: string }[];
  useCurrentFieldIndex?: boolean;
  handleAction?: (actionType: string, fieldId: string, fieldValue: string) => void;
}

const TextFieldBubbles: React.FC<TextFieldBubblesProps> = ({ fieldValues, limitNumberVisible = 1, useCurrentFieldIndex = false, handleAction }) => {
  const buttonIcons = {
    append: {
      icon: <PlaylistAddOutlinedIcon style={{ fontSize: 19 }} />,
      actionType: "append", // Add action type
      tooltip: "Append",
    },
    check: {
      icon: <CheckIcon style={{ fontSize: 19 }} />,
      actionType: "check", // Add action type
      tooltip: "Replace",
    },
    clear: {
      icon: <ClearIcon style={{ fontSize: 19 }} />,
      actionType: "clear", // Add action type
      tooltip: "Dismiss",
    },
  };

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [animationIndex, setAnimationIndex] = useState(0);

  const [prevVisibleBubbles, setPrevVisibleBubbles] = useState<{ [key: string]: string }[]>([]);
  const [visibleBubbles, setVisibleBubbles] = useState<{ [key: string]: string }[]>([]);

  const [bubblePositions, setBubblePositions] = useState<{
    [fieldId: string]: { left: number; top: number };
  }>({});

  const [triggerRender, setTriggerRender] = useState(false);

  const windowSize = useWindowSize();
  const innerHeight = windowSize?.innerHeight;
  const innerWidth = windowSize?.innerWidth;
  const outerHeight = windowSize?.outerHeight;
  const outerWidth = windowSize?.outerWidth;

  useEffect(() => {
    console.log("windowSize and fieldValues", innerHeight, innerWidth, outerHeight, outerWidth, fieldValues);
    updateBubblePositions();
    const handler = setTimeout(() => {
      // Recompute location values here
      console.log("updateBubblePositions");
      updateBubblePositions();
      //setTriggerRender((prev) => !prev);
    }, 240);

    return () => {
      clearTimeout(handler);
    };
  }, [innerWidth, outerWidth, fieldValues]);

  useEffect(() => {
    // Check if fieldValues is a subset of prevVisibleBubbles
    console.log("fieldValue99", fieldValues);
    //debugger;
    if (!isSubset(fieldValues, prevVisibleBubbles)) {
      //We have new fieldValues, fieldValues larger than prevVisibleBubbles
      //debugger;
      // Reset prevVisibleBubbles to the new fieldValues
      setPrevVisibleBubbles(fieldValues);
      // are the currently visible bubbles the same as the new fieldValues? loop over each and only reset from the first new one onwards
      const firstDifferentIndex = fieldValues.findIndex((field, index) => {
        return !visibleBubbles[index] || Object.keys(field)[0] !== Object.keys(visibleBubbles[index])[0];
      });
      if (visibleBubbles.length > 0 && firstDifferentIndex >= visibleBubbles.length) {
        //it did not find a difference in the visible bubbles, so we can leave as is
        return;
      }
      if (firstDifferentIndex !== -1) {
        //retain the current visible bubbles up to the first different index
        setVisibleBubbles(fieldValues.slice(0, limitNumberVisible ? limitNumberVisible : fieldValues.length));
      }
      if (useCurrentFieldIndex) {
        setCurrentFieldIndex(0);
      } else {
        setAnimationIndex(0);
      }
    } else {
      //fieldValues is a subset of prevVisibleBubbles
      // Check if the fieldValues have changed
      if (fieldValues.length !== prevVisibleBubbles.length) {
        // Reset prevVisibleBubbles to the new fieldValues
        setPrevVisibleBubbles(fieldValues);
        // are the currently visible bubbles the same as the new fieldValues? loop over each and only reset from the first new one onwards
        const firstDifferentIndex = fieldValues.findIndex((field, index) => {
          return !visibleBubbles[index] || Object.keys(field)[0] !== Object.keys(visibleBubbles[index])[0];
        });
        if (firstDifferentIndex === 0) {
          setVisibleBubbles(fieldValues.slice(0, limitNumberVisible ? limitNumberVisible : fieldValues.length));
        } else if (firstDifferentIndex !== -1) {
          //retain the current visible bubbles up to the first different index
          const x = fieldValues.slice(0, firstDifferentIndex);
          setVisibleBubbles(x);
        }
        if (useCurrentFieldIndex) {
          setCurrentFieldIndex(0);
        } else {
          setAnimationIndex(firstDifferentIndex);
        }
      }
    }
  }, [fieldValues, useCurrentFieldIndex, prevVisibleBubbles, triggerRender]);

  useEffect(() => {
    //debugger;
    if (fieldValues.length === 0) {
      setVisibleBubbles([]);
      setAnimationIndex(0);
      return;
    }
    // limitNumberVisible if set, otherwise show all fieldValues.length
    const visibleCount = limitNumberVisible ?? fieldValues.length;
    //debugger;
    if (useCurrentFieldIndex) {
      // Animate bubbles one by one using currentFieldIndex
      if (currentFieldIndex < visibleCount && currentFieldIndex < fieldValues.length) {
        const timer = setTimeout(() => {
          setVisibleBubbles((prev) => [...prev, fieldValues[currentFieldIndex]]);
          setCurrentFieldIndex((prevIndex) => prevIndex + 1);
        }, 200); // Adjust delay as needed

        return () => clearTimeout(timer);
      }
    } else {
      // Animate bubbles one by one using animationIndex
      if (
        visibleBubbles.length < visibleCount &&
        animationIndex < visibleCount &&
        animationIndex < fieldValues.length &&
        (limitNumberVisible ? animationIndex < limitNumberVisible : true)
      ) {
        const timer = setTimeout(() => {
          setVisibleBubbles((prev) => [...prev, fieldValues[animationIndex]]);
          setAnimationIndex((prevIndex) => prevIndex + 1);
        }, 150); // Adjust delay as needed

        return () => clearTimeout(timer);
      }
    }
  }, [currentFieldIndex, animationIndex, fieldValues, limitNumberVisible, useCurrentFieldIndex, triggerRender]);

  const updateBubblePositions = () => {
    setBubblePositions((prev) => {
      const newPositions = { ...prev };
      fieldValues.forEach((field) => {
        const fieldId = Object.keys(field)[0];
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
          const rect = fieldElement.getBoundingClientRect();
          newPositions[fieldId] = {
            left: rect.left + window.scrollX,
            top: rect.bottom + window.scrollY + 5, // Adjust as needed
          };
        }
      });
      return newPositions;
    });
  };

  return (
    <>
      {/* Render the visible text bubbles */}
      {prevVisibleBubbles.map((field, index) => {
        const fieldId = Object.keys(field)[0];
        const fieldValue = field[fieldId];

        const bubblePosition = bubblePositions[fieldId];
        if (!bubblePosition) return null;

        const bubbleStyle: CSSProperties = {
          position: "absolute",
          left: bubblePosition.left,
          top: bubblePosition.top,
        };

        return (
          <div
            key={fieldId}
            className={cn(
              `absolute z-20 scale-50 transform rounded-bl-xl rounded-br-xl rounded-tl-sm rounded-tr-xl border border-tertiary-dark bg-purple p-2 px-3 text-primary-light opacity-0 transition-all duration-300 ease-in-out`,
              {
                // Show the bubble if it is the current field or if it is one of the visible bubbles
                "scale-100 opacity-100":
                  (useCurrentFieldIndex && index === currentFieldIndex - 1) ||
                  (!useCurrentFieldIndex && currentFieldIndex <= index && index < visibleBubbles.length),
              },
              {}
            )}
            style={bubbleStyle}
          >
            <div className="group flex w-full items-center justify-between gap-x-3">
              <span className="max-h-[50px] max-w-[350px] truncate transition-all duration-240 group-hover:max-h-fit group-hover:whitespace-normal">
                {fieldValue}
              </span>
              <div className="flex gap-x-2">
                {Object.entries(buttonIcons).map(([key, IconComponent]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="flex items-center rounded-full border-none p-1 text-primary-light outline-1 hover:border-none hover:text-primary-dark hover:outline hover:outline-1 hover:outline-offset-0 hover:outline-secondary-dark"
                    onClick={() => handleAction && handleAction(IconComponent.actionType, fieldId, fieldValue)} // Call the common handler with action type
                    tooltip={IconComponent.tooltip}
                  >
                    {IconComponent.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TextFieldBubbles;
