"use client";

import { NotesOutlined as Text, DoneAll, ShortText, ShortcutOutlined } from "@mui/icons-material";
import { Ref, useState } from "react";
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';
import { Button } from "../ui/Button";

const MIN_HEIGHT = 96;

const ITEMS = [
  {
    text: "Summary",
    icon: Text,
    colors: {
      icon: "text-orange-600",
      border: "border-orange-500",
      bg: "bg-orange-100",
    },
  },
  {
    text: "Fix Spelling and Grammar",
    icon: DoneAll,
    colors: {
      icon: "text-emerald-600",
      border: "border-emerald-500",
      bg: "bg-emerald-100",
    },
  },
  {
    text: "Make shorter",
    icon: ShortText,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-100",
    },
  },
];

export default function AIActions() {
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>("Make shorter");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: 200,
  });

  const toggleItem = (itemText: string) => {
    setSelectedItem((prev) => (prev === itemText ? null : itemText));
  };

  const currentItem = selectedItem ? ITEMS.find((item) => item.text === selectedItem) : null;

  const handleSubmit = () => {
    setInputValue("");
    setSelectedItem(null);
    adjustHeight(true);
  };

  return (
    <div className="w-full bg-primary-light py-4">
      <div className="relative mx-auto w-full max-w-xl">
        <div className="relative rounded-2xl border border-black/10 focus-within:border-black/20 dark:border-white/10 dark:bg-white/[0.03] dark:focus-within:border-white/20">
          <Textarea
            ref={textareaRef as Ref<HTMLTextAreaElement>}
            id="ai-input-03"
            placeholder="Enter your text here..."
            className={cn("")}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button className="absolute right-3 top-3" variant="ghost">
            <ShortcutOutlined
              className={cn(
                " h-4 w-4 rotate-90 transition-all duration-200 dark:text-white",
                inputValue ? "scale-100 opacity-100" : "scale-95 opacity-30"
              )}
            />
          </Button>
          {currentItem && (
            <div className="absolute bottom-3 left-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  "rounded-md border px-2 py-0.5 text-xs font-medium shadow-sm",
                  "animate-fadeIn transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5",
                  currentItem.colors.bg,
                  currentItem.colors.border
                )}
              >
                <currentItem.icon className={`h-3.5 w-3.5 ${currentItem.colors.icon}`} />
                <span className={currentItem.colors.icon}>{selectedItem}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-2 flex max-w-xl flex-wrap justify-start gap-1.5 px-4">
        {ITEMS.filter((item) => item.text !== selectedItem).map(({ text, icon: Icon, colors }) => (
          <button
            type="button"
            key={text}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              "border transition-all duration-200",
              "border-black/10 bg-white hover:bg-black/5 dark:border-white/10 dark:bg-gray-900 dark:hover:bg-white/5",
              "flex-shrink-0"
            )}
            onClick={() => toggleItem(text)}
          >
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-4 w-4", colors.icon)} />
              <span className="whitespace-nowrap text-black/70 dark:text-white/70">{text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
