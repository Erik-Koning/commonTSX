import * as React from "react";

import { cn } from '../../lib/utils';
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useItemSizeUL } from '../../hooks/useItemSizeUL';
import { ExpandButton } from "./ExpandButton";
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/inputs/Input';

interface StringNumberObject {
  [key: string]: number;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  value?: string;
  suggestWords?: StringNumberObject[];
  suggestBoxWidth?: number;
}

interface ExpandedBoxSize {
  width: number | null;
  height: number | null;
}

type PositionedDivProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  suggestBoxWidth: number;
  expandedBoxWidth: number | null;
  expandedBoxHeight: number | null;
  children?: React.ReactNode; // Add children prop here
};

//given an input label and suggested words + weightings we provide an input box that recommends each word or phrase to the user.
const RefBox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id = "Refbox", value, className, suggestWords, suggestBoxWidth = 0.5, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showExpandButton, setShowExpandButton] = useState<boolean>(false);
    const [boxExpanded, setBoxExpanded] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(value || "");
    const [selectedWordIdxArr, setSelectedWordIdxArr] = useState<number[]>([]);
    const [expandedBoxSize, setBoxSize] = useState<ExpandedBoxSize>({ width: null, height: null });
    const [inputIsFocused, setInputIsFocused] = useState<boolean>(false);
    const { upperLeftPosition, width, height } = useItemSizeUL(
      // position the input box relative to the inputRef, upadte on window resize
      inputRef
    );

    function sortKeysDescending(arr: { [key: string]: number }[] | undefined | null): string[] {
      if (!arr) return [];

      const sortedArr = arr.sort((a, b) => b[Object.keys(b)[0]] - a[Object.keys(a)[0]]);
      return sortedArr.map((obj) => Object.keys(obj)[0]);
    }

    //      const MakeTopRightPositionedDiv = `bg-background-dark absolute border-2 border-red-500 transform translate-x-1/2 -translate-y-1/2 top-${y-200} left-1/2 ml-10`;
    function SuggestBox({
      x, //input box left
      y, //input box top
      w, //input box width
      h, //input box height
      suggestBoxWidth,
      expandedBoxWidth,
      expandedBoxHeight,
      children,
    }: PositionedDivProps) {
      const inputBoxVh = (h / window.innerHeight) * 100;
      const inputBoxVw = (w / window.innerWidth) * 100;
      const suggestBoxMaxW = inputBoxVw * suggestBoxWidth;
      const vw = (x / window.innerWidth) * 100; //viewport distance from full screen left
      const vh = (y / window.innerHeight) * 100 - inputBoxVh; //viewport distance from full screen top
      const fromLeftRelative = inputBoxVw - suggestBoxMaxW;

      return (
        <div
          //Style because tailwindcss does not allow dynamic styling at the moment
          style={{
            left: `${fromLeftRelative}vw`,
            top: `${inputBoxVh * -2}vh`,
            minWidth: `${suggestBoxMaxW}vw`,
            minHeight: `${inputBoxVh}vh`,
            maxWidth: expandedBoxWidth ? "none" : `${suggestBoxMaxW}vw`,
            maxHeight: expandedBoxHeight ? undefined : undefined,
            width: expandedBoxWidth ? `${expandedBoxWidth}px` : undefined,
            height: expandedBoxHeight ? `${expandedBoxHeight}px` : undefined,
          }}
          ref={containerRef}
          className="align-items-center relative flex h-min w-max -skew-x-12 transform justify-center rounded-md border-gray-500 bg-gray-100 p-1"
        >
          {children}
        </div>
      );
    }

    const sortedWords = sortKeysDescending(suggestWords);
    ////console.log(sortedWords);

    const w = width || 0;
    const h = height || 0;
    ////console.log("ref size",w, h)

    function showAllWords() {
      if (!containerRef.current) return;
      const items = containerRef.current?.querySelectorAll(".word");
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        ////console.log("showing", items[i]);
        const item = items[i] as HTMLElement;
        item.style.display = "block";
      }
    }

    function fitWordsToContainer() {
      if (!containerRef.current) return;
      const items = containerRef.current?.querySelectorAll(".word");
      if (!items) return;

      if (boxExpanded) {
        showAllWords();
        // Calculate the total width and height of all the children
        const items = containerRef.current?.querySelectorAll(".word");
        if (!items) return;
        let totalWidth = 0;
        let totalHeight = 0;
        for (const itemGen of items) {
          const item = itemGen as HTMLElement;
          totalWidth += item.offsetWidth;
          totalHeight += item.offsetHeight;
        }

        // Set the width and height of the suggest box
        setBoxSize({ width: totalWidth, height: totalHeight });
        return;
      }

      const containerWidth = containerRef.current?.clientWidth || 500;
      let totalWidth = 0;
      let numItems = 0;
      let idx = 0;

      // Calculate total width of visible items
      for (const itemGen of items) {
        const item = itemGen as HTMLElement;
        totalWidth += item.offsetWidth;

        // stop if we've exceeded the container width + N px for the expand button (WIP)
        if (totalWidth + 40 > containerWidth) {
          break;
        }

        numItems++;
        idx++;
      }

      // no items or all items in input
      if (items.length === 0 || items.length === selectedWordIdxArr.length) {
        setShowExpandButton(false);
        containerRef.current.style.display = "none";
      }
      // have items but none fit
      else if (idx === 0) {
        setShowExpandButton(true);
        containerRef.current.style.display = "flex";
        containerRef.current.style.justifyContent = "flex-end";
      }
      // have items and all fit
      else if (idx === items.length) {
        setShowExpandButton(false);
        containerRef.current.style.display = "flex";
        containerRef.current.style.justifyContent = "left";
      } else {
        // have items and some fit
        setShowExpandButton(true);
        containerRef.current.style.display = "flex";
        containerRef.current.style.justifyContent = "space-between";
      }
      // Hide overflow items
      ////console.log("new loop");
      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLElement;

        if (selectedWordIdxArr.includes(i)) {
          item.style.display = "none";
          ////console.log("none same val");
        } else if (i < numItems) {
          item.style.display = "block";
          ////console.log("block");
        } else {
          item.style.display = "none";
          ////console.log("none else");
        }
      }
    }

    useLayoutEffect(() => {
      if (boxExpanded) return;
      window.addEventListener("resize", fitWordsToContainer);
      fitWordsToContainer();

      return () => {
        window.removeEventListener("resize", fitWordsToContainer);
      };
    }, [sortedWords]);

    useEffect(() => {
      //input box is empty now
      if (inputValue === "") {
        setSelectedWordIdxArr([]);
      } else {
        //looking for a word previously in the selectedWordIdxArr to remove
        for (let i = 0; i < selectedWordIdxArr.length; i++) {
          if (!inputValue.includes(sortedWords[selectedWordIdxArr[i]])) {
            //A word was selected but it is no longer in the input value
            setSelectedWordIdxArr((prevArray) => prevArray.filter((element) => element !== i));
          }
        }
        //looking for a word in the inputValue to add to the selectedWordIdxArr
        for (let i = 0; i < sortedWords.length; i++) {
          if (inputValue.includes(sortedWords[i]) && !selectedWordIdxArr.includes(i)) {
            //A word was not selected but it is now in the input value
            setSelectedWordIdxArr((prevArray) => [...prevArray, i]);
          }
        }
      }
    }, [inputValue]);

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!inputRef.current?.contains(target) && !containerRef.current?.contains(target)) {
        setInputIsFocused(false);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (
        inputRef.current &&
        !inputRef.current?.contains(event.relatedTarget as HTMLInputElement) &&
        !containerRef.current?.contains(event.relatedTarget as HTMLElement)
      ) {
        // The focus has left the input element and its descendants
        setInputIsFocused(false);
      }
    };

    useEffect(() => {
      document.addEventListener("focusout", handleFocusOut);
      document.addEventListener("mousedown", handleDocumentClick);
      return () => {
        document.removeEventListener("mousedown", handleDocumentClick);
        document.removeEventListener("focusout", handleFocusOut);
      };
    }, []);

    const handleExpandButtonClick = () => {
      setBoxExpanded(true);
      setShowExpandButton(false);
      fitWordsToContainer();
    };

    const handleWordButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      ////console.log("suggested word button clicked");
      ////console.log("e.currentTarget", e.currentTarget);
      const dataKeyAttribute = e.currentTarget.getAttribute("data-key");
      if (dataKeyAttribute !== null) {
        const dataKey = Number(dataKeyAttribute);
        setSelectedWordIdxArr((prevArray) => [...prevArray, dataKey]);
      } else {
        console.error("data-key attribute is null or undefined");
      }

      const selectedWord = e.currentTarget.textContent || "";
      if (inputRef.current) inputRef.current.focus();
      if (inputValue.length > 0 && selectedWord.length > 0) {
        setInputValue((prevInputValue) => prevInputValue + " " + selectedWord);
      } else if (inputValue.length === 0 && selectedWord.length > 0) {
        setInputValue(selectedWord);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.currentTarget.value);
    };

    ////console.log("suggestWords", suggestWords, "w", w, "h", h, "inputIsFocused", inputIsFocused);

    return (
      <div className="min-h-fit w-full pt-2">
        <Input
          ref={inputRef}
          otherType="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setInputIsFocused(true)}
          className={cn("flex h-10 w-full rounded-md text-sm", className)}
          {...(() => {
            // Define props to exclude
            const excludedProps = ["id", "inputRef", "otherType", "value", "onChange", "onFocus", "className", "width"];

            // Create a new object with all props except the excluded ones
            const filteredProps = Object.entries(props).reduce((acc: any, [key, value]) => {
              if (!excludedProps.includes(key)) {
                acc[key] = value;
              }
              return acc;
            }, {});

            return filteredProps;
          })()}
        >
          <div>
            {suggestWords && w > 0 && inputIsFocused && (
              <SuggestBox
                x={upperLeftPosition.x}
                y={upperLeftPosition.y}
                w={w}
                h={h}
                suggestBoxWidth={suggestBoxWidth}
                expandedBoxWidth={expandedBoxSize.width}
                expandedBoxHeight={expandedBoxSize.height}
              >
                {sortedWords.map((word, index) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    key={index}
                    data-key={index}
                    onClick={handleWordButtonClick}
                    className="word m-0.5 justify-center rounded-lg bg-gray-200 text-sm hover:bg-gray-300"
                  >
                    {word}
                  </Button>
                ))}
                {showExpandButton && <ExpandButton onClick={handleExpandButtonClick} />}
              </SuggestBox>
            )}
          </div>
        </Input>
      </div>
    );
  }
);
RefBox.displayName = "Input";

export { RefBox };
