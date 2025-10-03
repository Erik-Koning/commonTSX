"use client";

import { DoneAll, FormatListBulletedOutlined, MoodOutlined, ShortText, NotesOutlined as Text, SendOutlined } from "@mui/icons-material";
import React, { forwardRef, useState, ReactNode, useEffect } from "react";
import TextCarousel from "../ui/TextCarousel";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";

export const AITEXT_VALUES = ["Expand", "Proofread", "Improve Tone", "Shorten", "Formatted List", "Custom Prompt"] as const; // Use `as const` for a readonly tuple

export type AITextString = (typeof AITEXT_VALUES)[number];
export interface AITextItem {
  text: AITextString;
  shortText?: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>; // Type for Material-UI icons
  prompt: string;
  iconClassName: string;
  containerClassName: string;
  sendWithUserEditedFields?: boolean;
  forceSingleAction?: boolean;
}

export const AITextActionItems: AITextItem[] = [
  {
    text: "Expand",
    icon: Text,
    prompt: "Expand on the content without making up new facts",
    iconClassName: "text-orange-600",
    containerClassName: "bg-orange-100 border-orange-500",
  },
  {
    text: "Proofread",
    icon: DoneAll,
    prompt: "Fix spelling and grammar",
    iconClassName: "text-emerald-600",
    containerClassName: "bg-emerald-100 border-emerald-500",
  },
  {
    text: "Improve Tone",
    icon: MoodOutlined,
    prompt: "Improve the tone of the text to be more professional and friendly",
    iconClassName: "text-rose-600 text-2xl",
    containerClassName: "bg-rose-100 border-rose-500",
  },
  {
    text: "Shorten",
    icon: ShortText,
    prompt: "Make the text shorter without losing important information",
    iconClassName: "text-indigo-600",
    containerClassName: "bg-indigo-100 border-indigo-500",
  },
  {
    text: "Formatted List",
    icon: FormatListBulletedOutlined,
    prompt: "Convert the text into a formatted and hyphenated list",
    iconClassName: "text-blue-600",
    containerClassName: "bg-blue-100 border-blue-500",
  },
  {
    text: "Custom Prompt",
    shortText: "Prompt",
    icon: SendOutlined,
    prompt:
      "Fill this field based on the following instructions, only return back the resulting text, do not quote it or give any other response beyond the resulting text:\n",
    sendWithUserEditedFields: true,
    iconClassName: "text-sky-600",
    containerClassName: "bg-sky-100 border-sky-500",
    forceSingleAction: true,
  },
];

interface AITextActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textBoxRef?: React.RefObject<HTMLElement | null>;
  handleItemClick?: (item: any) => void;
  aiActions?: AITextString[];
  hideAiActions?: AITextString[];
}

export const AITextActions = forwardRef<HTMLDivElement, AITextActionsProps>(
  ({ className, textBoxRef, aiActions, hideAiActions, handleItemClick, ...props }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [availableItems, setAvailableItems] = useState<AITextItem[]>(AITextActionItems);
    const [selectedItem, setSelectedItem] = useState<string | null>("Make shorter");
    /*const { textBoxRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: 200,
  });
  */

    const toggleItem = (itemText: string) => {
      setSelectedItem((prev) => (prev === itemText ? null : itemText));
    };

    const currentItem = selectedItem ? AITextActionItems.find((item) => item.text === selectedItem) : null;

    const handleSubmit = () => {
      setInputValue("");
      setSelectedItem(null);
      //adjustHeight(true);
    };

    const MIN_HEIGHT = 96;

    //Titles for the carousel

    const handleTitleClick = (e: any, title: string) => {
      //get the object from the array that was clicked
      const item = AITextActionItems.find((item) => item.text === title);
      //call the parent function
      handleItemClick && handleItemClick(item);
    };

    useEffect(() => {
      let newAvailableItems = AITextActionItems;
      if (aiActions) {
        //only show those items that are in the aiActions array
        newAvailableItems = AITextActionItems.filter((item) => aiActions.includes(item.text));
      }
      if (hideAiActions) {
        newAvailableItems = newAvailableItems.filter((item) => !hideAiActions.includes(item.text));
      }
      setAvailableItems(newAvailableItems);
    }, [aiActions, hideAiActions]);

    return (
      <>
        <TextCarousel
          handleItemClickExt={handleTitleClick}
          options={availableItems}
          maxItemWidthPX={140}
          enableScroll={true}
          expandSideButton={false}
          showExpandSideButton={false}
          optionsClassName="p-1.5 rounded-lg bg-background"
          allowWrap={true}
        />
      </>
    );
  }
);

AITextActions.displayName = "AITextActions";
