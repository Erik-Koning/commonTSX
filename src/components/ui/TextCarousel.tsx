import { getElemSizeULByRef, useItemSizeUL } from '../../hooks/useItemSizeUL';
import { cn } from '../../lib/utils';
import { IndexRange, isContainedWithinRange, rangesContained, removeIndiciesFromText, removeRangesContained } from '../../utils/numbers';
import { falseOrEmpty, filterArrayByBooleanArray, numElementsTrue } from '../../utils/objectManipulation';
import {
  containsOnlyNewlinesAndSpaces,
  isStringArrayInString,
  removeLeadingAndTrailingWhiteSpace,
  removeLeadingWhitespace,
  removeRangeFromString,
  removeTrailingWhitespace,
  spliceStringArrayShortForm,
} from '../../utils/stringManipulation';
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { containsReferencedFields, spliceReferencedFieldsStringToArray } from "@common/components/formGenerator/formatGeneratorData";
import { BaseModal } from "../modals/BaseModal";
import { Button } from "./Button";
import { CuteWordOrb } from "./CuteWordOrb";

interface TextCarouselProps {
  title?: string;
  options?: string[] | Record<string, any>[];
  textFieldText?: string;
  separateBy?: string;
  maxItemWidthPX?: number;
  handleItemClickExt?: (e: any, item: string) => void;
  handleItemUnClickExt?: (e: any, item: string) => void;
  handleTextChange?: (e: any, text: string) => void;
  processText?: (text: string) => string;
  itemClassName?: string;
  showButtons?: boolean;
  showSelected?: boolean;
  showExpandUpwardsButton?: boolean;
  showExpandSideButton?: boolean;
  expandUpwardsButton?: boolean;
  expandSideButton?: boolean;
  enableScroll?: boolean;
  expandSideButtonWidth?: number;
  paddingBottom?: number;
  marginBottom?: number;
  optionsClassName?: string;
  optionTextClassNameModifier?: (text: string) => string;
  scrollButtonXInset?: number;
  allowWrap?: boolean;
  allowWrapInPopup?: boolean;
  zIndex?: number;
}

const TextCarousel: FC<TextCarouselProps> = ({
  title,
  options = [],
  separateBy = "\n",
  maxItemWidthPX = 80,
  handleItemClickExt,
  handleItemUnClickExt,
  handleTextChange,
  processText,
  textFieldText,
  itemClassName,
  showButtons = true,
  showSelected = true,
  showExpandUpwardsButton = false,
  showExpandSideButton = true,
  expandUpwardsButton = false,
  expandSideButton = true,
  enableScroll = true,
  expandSideButtonWidth = 26,
  paddingBottom = 7,
  marginBottom = -5,
  optionsClassName,
  optionTextClassNameModifier,
  scrollButtonXInset = -5,
  allowWrap = false,
  allowWrapInPopup = false,
  zIndex = 2,
}) => {
  const [textFieldTextPrev, setTextFieldTextPrev] = useState<string>("");
  const [optionShortForms, setOptionShortForm] = useState<(string | null)[]>([]); //short forms is the text that is first in the string with in the "<>" brackets
  const [optionLongForms, setOptionLongForms] = useState<string[]>([]); //long forms is the text that is after the short form in the string, long forms cannot be null
  //const [optionModifiedIndicies, setOptionModifiedIndicies] = useState<({ start: number; end: number }[] | null)[]>([]); //indicies of the options that have been modified, their start and end indicies
  //const [optionModifiedInitialIndicies, setOptionModifiedInitialIndicies] = useState<({ start: number; end: number }[] | null)[]>([]); //indicies of the options that have been modified, their start and end indicies
  const [isOverflowingRight, setIsOverflowingRight] = useState(false);
  const [isOverflowingLeft, setIsOverflowingLeft] = useState(false);
  const [moveInnerOffsetPX, setMoveInnerOffsetPX] = useState<number>(0);
  const [innerContainerHeight, setInnerContainerHeight] = useState<number>(20);
  const [innerContainerWidth, setInnerContainerWidth] = useState<number>(20);
  const [innerContainerXY, setInnerContainerXY] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [triggerAnotherCheck, setTriggerAnotherCheck] = useState<boolean>(false);
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [expandSideButtonWidthPX, setExpandSideButtonWidthPX] = useState<number>(expandSideButtonWidth);
  const [itemsSelected, setItemsSelected] = useState<boolean[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const ParentScrollContainerRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);

  const scrollNavButtonWidthPX = 16;
  const animationDurationMS = 300;

  const { upperLeftPosition: parentDivXY, width: parentWidth, height: parentHeight } = useItemSizeUL(ParentScrollContainerRef, true, [options]);

  const getObjectsOptionTextValue = (option: Record<string, any>, textKey?: string): string => {
    if (typeof option === "string") return option;
    else if (textKey && option[textKey]) return option[textKey];
    else if (option.hasOwnProperty("text")) return option["text"];
    else if (option.hasOwnProperty("title")) return option["value"];
    else if (option.hasOwnProperty("value")) return option["value"];
    else return "";
  };

  useEffect(() => {
    if (!options) return;
    //get the textOptions array since the options array might be an array of objects
    const textOptions = options.map((option) => (typeof option === "string" ? option : getObjectsOptionTextValue(option)));

    //get the short and long forms of the textOptions, shortForms are the first word in the string with in the "<>" brackets, longForms are the rest of the string
    const { shortForms, longForms } = spliceStringArrayShortForm(textOptions); //longForms are always valid, but possibly empty. longForms are what is displayed in the text area

    if (!optionShortForms && !optionLongForms) {
      setOptionShortForm(shortForms);
      setOptionLongForms(longForms);
    } else {
      //merge the new options with the old options that are already in the state
      //only add existing options if they are in the itemsSelected array
      const filteredShortPreviousOptions = filterArrayByBooleanArray(optionShortForms, itemsSelected);
      const filteredLongPreviousOptions = filterArrayByBooleanArray(optionLongForms, itemsSelected);
      const newOptionShortForms = [...filteredShortPreviousOptions, ...shortForms];
      const newOptionLongForms = [...filteredLongPreviousOptions, ...longForms];
      setOptionShortForm(newOptionShortForms);
      setOptionLongForms(newOptionLongForms);

      setItemsSelected([]);
    }
  }, [options]);

  useEffect(() => {
    checkTextForOption();
  }, [optionLongForms, optionShortForms]);

  useLayoutEffect(() => {
    //TODO, check text when it changes, options may be added or no longer exist in the text
    checkTextForOption();

    console.log("textFieldText", textFieldText);
  }, [textFieldText, options]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      //the position and size of the inner container positioned absolutely inside the parent div
      //these values are useful when positioning via absolute positioning and not when scrolling
      let {
        upperLeftPosition: innerContainerXYLocal,
        width: innerContainerWidthLocal,
        height: innerContainerHeightLocal,
      } = getElemSizeULByRef(innerContainerRef);
      if (!innerContainerRef.current) return;
      //the amount that is currently scrolled horizontally
      const horizontalScrollAmount = innerContainerRef.current.scrollLeft;
      //the amount that can be scrolled horizontally
      const horizontalScrollableAmount = innerContainerRef.current.scrollWidth - innerContainerRef.current.clientWidth;
      innerContainerXYLocal.x = innerContainerXYLocal.x - horizontalScrollAmount;
      innerContainerWidthLocal = horizontalScrollableAmount;
      setInnerContainerHeight(innerContainerHeightLocal);
      setInnerContainerXY(innerContainerXYLocal);
      setInnerContainerWidth(innerContainerWidthLocal);
      if (enableScroll) {
        if (horizontalScrollAmount === 0 && horizontalScrollableAmount === 0) {
          setIsOverflowingLeft(false);
          setIsOverflowingRight(false);
        } else {
          if (horizontalScrollAmount > 0) {
            setIsOverflowingLeft(true);
          } else {
            setIsOverflowingLeft(false);
          }
          if (horizontalScrollAmount <= horizontalScrollableAmount - expandSideButtonWidthPX) {
            setIsOverflowingRight(true);
          } else {
            setIsOverflowingRight(false);
          }
        }
      } else {
        if (innerContainerXYLocal.x + innerContainerWidthLocal > parentDivXY.x + parentWidth) {
          setIsOverflowingRight(true);
        } else {
          //console.log("not overflowing right", innerContainerXYLocal.x + innerContainerWidthLocal, parentDivXY.x + parentWidth);
          setIsOverflowingRight(false);
        }
        //console.log("innerContainerXYLocal.x", innerContainerXYLocal.x, parentDivXY.x);
        if (innerContainerXYLocal.x < parentDivXY.x) {
          setIsOverflowingLeft(true);
        } else {
          setIsOverflowingLeft(false);
        }
      }
    };

    if (firstRender) {
      setTimeout(() => {
        checkTextForOption();
        handleScroll();
        setFirstRender(false);
      }, 40);
    } else {
      handleScroll();
    }

    const scrollContainer = innerContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [parentDivXY, parentWidth, parentHeight, moveInnerOffsetPX, triggerAnotherCheck, options]);

  useLayoutEffect(() => {
    if (!isOverflowingLeft && !isOverflowingRight && !showExpandSideButton) {
      setMoveInnerOffsetPX(0);
      setExpandSideButtonWidthPX(0);
    } else {
      setExpandSideButtonWidthPX(expandSideButtonWidth);
    }
  }, [isOverflowingLeft, isOverflowingRight, firstRender]);

  const handleTextClick = (e: any, index: number) => {
    if (itemsSelected[index] === false) {
      if (handleItemClickExt) handleItemClickExt(e, optionLongForms[index]);
      else handleItemClick(e, optionLongForms[index]);
    } else {
      if (handleItemUnClickExt) handleItemUnClickExt(e, optionLongForms[index]);
      else handleItemUnClick && handleItemUnClick(e, optionLongForms[index], index);
    }
  };

  const handleItemClick = (e: any, item: string) => {
    //append the text to the textarea on a new line
    let text = containsOnlyNewlinesAndSpaces(textFieldText)
      ? item
      : textFieldText?.endsWith(separateBy + separateBy)
      ? textFieldText + item
      : textFieldText + separateBy + item;
    handleTextChange && handleTextChange(e, text);
  };

  const handleItemUnClick = (e: any, item: string, index: number) => {
    if (!textFieldText || item === undefined || index === undefined) return;

    if (processText) item = processText(item);

    //if (textFieldText.includes("myocardial infarction") && optionLongForms.length > 0) debugger;

    //remove the text from the textarea
    // does the text have referenced field(s) in it?
    let text = "";
    if (containsReferencedFields(item)) {
      //the item to unclick ie remove, has referenced fields in it (the referenced field may or may not have changed...,)

      //split the item into segments, split on the referenced fields
      const textSegments: string[] = spliceReferencedFieldsStringToArray(item);

      //get the indices of the textSegments in the textFieldText
      const segmentsInTextResult = isStringArrayInString(textSegments, textFieldText);

      //No segments found in the textFieldText
      if (!segmentsInTextResult.found) return;

      //get entire start and end indicies encompassing all textSegments for this item in the textFieldText
      const segmentsInTextIdx = [segmentsInTextResult.indices[0].start, segmentsInTextResult.indices[segmentsInTextResult.indices.length - 1].end];

      text = removeRangeFromString(textFieldText, segmentsInTextIdx[0], segmentsInTextIdx[1]);
    } else if (numElementsTrue(itemsSelected) > 1) {
      //possible we could accidentally remove an string inside another string

      //an array of selection options that are selected
      let itemsSelectedTextArr = filterArrayByBooleanArray(optionLongForms, itemsSelected);

      //an array of indicies from 0 to length of optionLongForms - 1
      const itemIndiciesArr = Array.from({ length: optionLongForms.length }, (_, i) => i);
      //an array of the indicies that are selected
      const itemsSelectedTextArrIdxToRemoveArr = filterArrayByBooleanArray(itemIndiciesArr, itemsSelected);

      //get the relative index of the item to remove in the itemsSelectedTextArr
      const itemsSelectedTextArrIdxToRemove = itemsSelectedTextArrIdxToRemoveArr.findIndex((element) => element === index);

      if (processText) itemsSelectedTextArr = itemsSelectedTextArr.map((item) => processText(item));

      //get all indices of the item to remove in the text field
      const foundSelectedItemsIndicies = getItemIndicesFromStringArrayFoundInString(itemsSelectedTextArr, textFieldText);

      //gets the ranges of the items that are not contained within another item
      const rangesArr = getItemRangesUncontained(foundSelectedItemsIndicies, itemsSelectedTextArrIdxToRemove);

      //Todo are we getting the correct rangesArr? gives undefined in removeIndiciesFromText

      //remove all instances of item that not contained within another found item indices
      text = textFieldText;
      text = removeIndiciesFromText(text, rangesArr);
    } else {
      const itemInFieldIndex = textFieldText.indexOf(item);
      if (itemInFieldIndex > separateBy.length && textFieldText.substring(itemInFieldIndex - separateBy.length, itemInFieldIndex) === separateBy) {
        // Remove separateBy and the item
        text = textFieldText.slice(0, itemInFieldIndex - separateBy.length) + textFieldText.slice(itemInFieldIndex + item.length);
      } else {
        // Remove only the item
        text = textFieldText.replace(item, "");
      }
    }

    //Removing leading and trailing whitespace can cause issues with the text carousel on some text options. since the item may have leading or trailing whitespace. The item would show as unselected and would allow to be clicked again without the whitespace.
    //text = removeLeadingAndTrailingWhiteSpace(text);

    handleTextChange && handleTextChange(e, text);
  };

  //returns an array of objects with start and end indicies of the optionLongForms in the textFieldText
  const getItemIndicesFromStringArrayFoundInString = (optionLongForms: string[], textFieldText?: string): ({ start: number; end: number }[] | null)[] => {
    if (!textFieldText) return optionLongForms.map(() => []);
    const foundSelectedItemsIndicies: ({ start: number; end: number }[] | null)[] = optionLongForms.map(() => []);

    optionLongForms.forEach((option, index) => {
      //split the option into an array of strings, split on the referenced fields

      //This function:
      const optionLongFormText: string[] = spliceReferencedFieldsStringToArray(option);

      //get the indices of the optionLongFormText in the textFieldText, returns an array with null if every element in the array is not found
      const result = isStringArrayInString(optionLongFormText, textFieldText, true, false, true);
      const foundIndicies = result.indices; // could be multiple found if the optionLongFormText is split on referenced fields

      foundSelectedItemsIndicies[index] = result.found ? foundIndicies : null;
    });

    return foundSelectedItemsIndicies;
  };

  const retainItemIndiciesUncontained = (foundSelectedItemsIndicies: ({ start: number; end: number }[] | null)[]): { start: number; end: number }[][] => {
    // Now perform the containment removal
    for (let i = 0; i < foundSelectedItemsIndicies.length; i++) {
      for (let j = 0; j < foundSelectedItemsIndicies.length; j++) {
        if (i === j) continue;
        // Remove ranges contained within another item's ranges
        foundSelectedItemsIndicies[i] = removeRangesContained(foundSelectedItemsIndicies[i], foundSelectedItemsIndicies[j]);
      }
    }

    //map any empty arrays as null
    foundSelectedItemsIndicies = foundSelectedItemsIndicies.map((item) => (item !== null && item.length === 0 ? null : item)) as (
      | { start: number; end: number }[]
      | null
    )[];

    return foundSelectedItemsIndicies as { start: number; end: number }[][]; //return the filtered array
  };

  //given an array of foundSelectedItemsIndicies, remove all indicies in the array element specified by idxOfIndiciesToRemove that are contained within another item
  const getItemRangesUncontained = (
    foundSelectedItemsIndicies: ({ start: number; end: number }[] | null)[],
    idxOfIndiciesToReturn: number
  ): { start: number; end: number }[] => {
    let indiciesUncontained = [...foundSelectedItemsIndicies]; //copy the array
    const otherIndiciesNotBeingRemoved = foundSelectedItemsIndicies.filter((_, index) => index !== idxOfIndiciesToReturn);

    if (!indiciesUncontained) return [];

    //Loop over all indiciesUncontained and compare them to all other foundSelectedItemsIndicies, if the item is contained within another item, remove it
    for (let i = 0; i < indiciesUncontained.length; i++) {
      for (let j = 0; j < otherIndiciesNotBeingRemoved.length; j++) {
        if (i === j) continue;
        // if the item is contained within another item, remove it
        if (rangesContained(indiciesUncontained[i], indiciesUncontained[j])) {
          indiciesUncontained[i] = null;
          break;
        }
      }
    }

    //filter out null elements
    indiciesUncontained = indiciesUncontained.filter((item) => item !== null);

    return indiciesUncontained[idxOfIndiciesToReturn] as { start: number; end: number }[]; //return the filtered array
  };

  const checkTextForOption = () => {
    let initialSelectedItems: boolean[] = options.map(() => false);
    // Set all items to be false initially
    //debugger;
    if (!textFieldText || falseOrEmpty(options)) {
      setTextFieldTextPrev("");
      setItemsSelected(initialSelectedItems);
      return;
    }

    //text has changed, so we need to check the text for the options
    //get the indicies of any of the optionLongForms that are found in the textFieldText, returns an array of objects with start and end indicies, or the elem is null if the option is not found
    let foundSelectedItemsIndicies = getItemIndicesFromStringArrayFoundInString(optionLongForms, textFieldText);

    //loop over all items and set items that have been found in the text field to be true, this loop is probably not needed
    if (foundSelectedItemsIndicies) {
      for (let i = 0; i < foundSelectedItemsIndicies.length; i++) {
        if (falseOrEmpty(foundSelectedItemsIndicies[i])) continue;
        initialSelectedItems[i] = true;
      }
    }

    //debugger;

    // Loop over all items and only keep the indicies of items that are not found within another set of indicies.
    foundSelectedItemsIndicies = retainItemIndiciesUncontained(foundSelectedItemsIndicies);

    //foundSelectedItemsIndicies that still have valid indicies are the ones that are selected
    for (let i = 0; i < foundSelectedItemsIndicies.length; i++) {
      if (foundSelectedItemsIndicies[i] === null) continue;
      if (foundSelectedItemsIndicies && foundSelectedItemsIndicies[i] !== null && Array.isArray(foundSelectedItemsIndicies[i])) {
        initialSelectedItems[i] = true;
      } else {
        initialSelectedItems[i] = false;
      }
    }

    setItemsSelected(initialSelectedItems);
  };

  const handleScrollNav = (e: any, direction: "left" | "right") => {
    e.preventDefault();
    const maxScrollInterval = parentWidth - 90;
    if (direction === "right") {
      let amountToScrollRight = innerContainerXY.x + innerContainerWidth - (parentDivXY.x + parentWidth);
      if (enableScroll) {
        const scrollContainer = innerContainerRef.current;
        if (!scrollContainer) return;
        amountToScrollRight = scrollContainer.scrollWidth - (innerContainerRef.current?.clientWidth ?? 0);
        if (amountToScrollRight > maxScrollInterval) {
          //move it one interval
          scrollContainer.scrollLeft += maxScrollInterval;
        } else {
          //move it to show the rest
          scrollContainer.scrollLeft = scrollContainer.scrollWidth;
        }
      } else {
        if (amountToScrollRight > maxScrollInterval) {
          //move it one interval
          setMoveInnerOffsetPX(moveInnerOffsetPX - maxScrollInterval);
        } else {
          //move it to show the rest
          setMoveInnerOffsetPX(moveInnerOffsetPX - amountToScrollRight - scrollNavButtonWidthPX * 1.75);
        }
      }
    } else {
      // direction === "left"
      const amountToScrollLeft = Math.abs(parentDivXY.x - innerContainerXY.x);
      if (enableScroll) {
        const scrollContainer = innerContainerRef.current;
        if (scrollContainer) {
          scrollContainer.scrollLeft -= amountToScrollLeft;
        }
      } else {
        if (amountToScrollLeft > maxScrollInterval) {
          //move it one interval
          setMoveInnerOffsetPX(moveInnerOffsetPX + maxScrollInterval);
        } else {
          //move it to show the rest
          setMoveInnerOffsetPX(0);
        }
      }
    }
    //check again after animation is done from moving
    setTimeout(() => {
      setTriggerAnotherCheck(!triggerAnotherCheck);
    }, 150);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const toggleDialogOpen = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleProcessText = (text: string): string => {
    //if (textFieldText?.includes("kt")) debugger;
    if (processText) return processText(text);
    return text;
  };

  return (
    <div className="h-fit w-full overflow-y-visible pb-1">
      <div
        id="ExpandButtonDiv"
        className="pointer-events-none justify-between"
        style={{
          zIndex: zIndex,
          position: "absolute",
          display: "flex",
          width: `${parentWidth}px`,
          height: `${innerContainerHeight}px`,
        }}
      >
        {((showButtons && expandUpwardsButton) || showExpandUpwardsButton) && (
          <div
            style={{
              position: "absolute",
              zIndex: zIndex + 1,
              left: `${parentWidth / 2 - 15}px`,
              top: `${0 - parentHeight / 2 - 4}px`,
            }}
            className="hover:-p-2 rounded-md transition-all delay-100 duration-200 ease-in-out hover:-mb-4 hover:-mt-[2px] hover:bg-purple"
          >
            <Button
              size="blank"
              variant="ghost"
              className="hover:bg-purple/80 flex h-full items-center rounded-md text-tertiary-light/40 hover:text-primary-light "
              onClick={(e: any) => handleDialogOpen()}
            >
              <KeyboardArrowUpOutlinedIcon sx={{ fontSize: 20 }} />
            </Button>
          </div>
        )}
      </div>
      <div
        ref={ParentScrollContainerRef}
        className="flex items-center gap-x-1"
        style={{
          position: "relative",
          zIndex: zIndex - 1,
          width: `full`,
          height: `${innerContainerHeight}px`,
          //overflowX: "hidden",
          overflowY: "clip",
          //maxWidth: "100%",
        }}
      >
        <div
          id="ScrollButtonsDiv"
          style={{
            zIndex: zIndex,
            position: "absolute",
            display: "flex",
            left: `${scrollButtonXInset}px`,
            width: `${parentWidth - scrollButtonXInset}px`,
            height: `${innerContainerHeight}px`,
            paddingBottom: `${paddingBottom}px`,
            marginBottom: `${marginBottom}px`,
          }}
          className="pointer-events-none items-center justify-between overflow-y-visible"
        >
          {expandSideButton !== false && ((!isOverflowingLeft && isOverflowingRight) || (!isOverflowingLeft && showExpandSideButton)) && (
            <div className="px-0">
              <Button
                size="blank"
                variant="ghost"
                className="flex h-full items-center rounded-md p-[1px] py-[3px] text-tertiary-light/40 hover:bg-purple hover:text-primary-light"
                onClick={(e: any) => handleDialogOpen()}
              >
                <UnfoldMoreOutlinedIcon sx={{ fontSize: 20 }} />
              </Button>
            </div>
          )}
          <div
            className="-ml-[1px] flex h-full items-center justify-start pl-[1px]"
            style={{
              width: `50px`,
              display: "flex",
              left: `${scrollButtonXInset}px`,
            }}
          >
            {showButtons && isOverflowingLeft && (
              <Button
                onClick={(e: any) => {
                  handleScrollNav(e, "left");
                }}
                size="blank"
                style={{
                  height: `${innerContainerHeight - 9}px`,
                  width: `${innerContainerHeight - 9}px`,
                }}
                variant="ghost"
                className="flex items-center rounded-full bg-tertiary-light/20 p-1 text-secondary-dark hover:bg-purple hover:text-primary-light"
              >
                <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />
              </Button>
            )}
          </div>

          <div
            className="absolute -mr-[1px] flex h-full items-center justify-end pr-[1px]"
            style={{
              right: `${scrollButtonXInset}px`,
              width: `50px`,
            }}
          >
            {showButtons && isOverflowingRight && (
              <Button
                onClick={(e: any) => {
                  handleScrollNav(e, "right");
                }}
                size="blank"
                style={{
                  height: `${innerContainerHeight - 8}px`,
                  width: `${innerContainerHeight - 8}px`,
                }}
                variant="ghost"
                className="flex h-full rotate-180 items-center rounded-full bg-tertiary-light/20 p-1 text-secondary-dark hover:bg-purple hover:text-primary-light"
              >
                <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn("flex h-full gap-x-1 overflow-y-clip overflow-x-scroll", { "transition-all duration-300": !firstRender })}
          ref={innerContainerRef}
          style={{
            zIndex: zIndex - 2,
            position: "absolute",
            left: `${moveInnerOffsetPX}px`,
            width: `${parentWidth}px`,
            height: "fit-content",
            paddingBottom: `${12}px`,
            marginBottom: `${-10}px`,
            maskImage:
              isOverflowingLeft && isOverflowingRight
                ? `linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 80px, rgba(0, 0, 0, 1) calc(100% - 38px), transparent)`
                : isOverflowingLeft
                ? `linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 80px)`
                : isOverflowingRight
                ? `linear-gradient(to right, rgba(0, 0, 0, 1) calc(100% - 80px), transparent)`
                : "",
          }}
        >
          <div
            style={{
              paddingLeft: `${expandSideButton || showExpandSideButton ? expandSideButtonWidthPX : 0}px`,
            }}
            className={cn("flex h-full gap-x-1 ")}
          >
            {optionLongForms.map((item, index) => {
              const text = optionShortForms[index] ?? handleProcessText(optionLongForms[index]);
              return (
                <CuteWordOrb
                  key={index}
                  //ref={refsArray.current[index]}
                  icon={typeof options[index] === "object" ? options[index].icon : undefined}
                  iconClassName={typeof options[index] === "object" ? options[index].iconClassName : undefined}
                  text={optionShortForms[index] ?? handleProcessText(optionLongForms[index])} //The label of the word orb
                  maxWidthPX={maxItemWidthPX}
                  selected={itemsSelected[index]}
                  className={cn(
                    "min-w-fit cursor-pointer whitespace-nowrap ",
                    optionsClassName,
                    optionTextClassNameModifier && optionTextClassNameModifier(text)
                  )}
                  onClick={(e: any) => {
                    handleTextClick(e, index);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <BaseModal
        title={title ?? "Select item(s)"}
        description={undefined}
        isOpen={dialogOpen}
        onOpenChange={toggleDialogOpen}
        allowCloseButton={true}
        overlayClassName="bg-black/40"
        className=""
      >
        <div className="flex h-full flex-col gap-x-2 gap-y-1 overflow-y-scroll">
          {optionLongForms.map((item, index) => (
            <CuteWordOrb
              allowWrap={allowWrapInPopup ?? allowWrap}
              key={index}
              text={
                optionShortForms[index]
                  ? optionShortForms[index] + " - " + handleProcessText(optionLongForms[index])
                  : handleProcessText(optionLongForms[index])
              }
              maxWidthPX={360}
              showFull={true}
              selected={itemsSelected[index]}
              onClick={(e: any) => {
                handleTextClick(e, index);
              }}
              className={cn(itemClassName, "w-full")}
              innerClassName={"justify-start px-[2px]"}
              showPopupOnHover={true}
            />
          ))}
        </div>
      </BaseModal>
    </div>
  );
};

export default TextCarousel;
