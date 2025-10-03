import React, { useEffect, useLayoutEffect, useState } from "react";
import { cn } from '../../lib/utils';
import { title } from "process";
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
type MenuBarProps = {
  titles: string[];
  titleHasNotification: string[];
  onSelectTitle: (selectedTitle: string, checkValidation?: boolean, returnOnValid?: boolean) => Promise<boolean>;
  value?: string;
  defaultTitle?: string;
  showDefaultTitle?: boolean;
  className?: string;
  onChange?: () => void;
};
const MenuBar: React.FC<MenuBarProps> = ({
  titles,
  titleHasNotification,
  onSelectTitle,
  value,
  className,
  defaultTitle,
  showDefaultTitle = true,
  onChange = () => undefined,
}) => {
  const [selectedTitle, setSelectedTitle] = useState<string | null>((showDefaultTitle && defaultTitle) || (showDefaultTitle && titles[0]) || null);
  useLayoutEffect(() => {
    //console.log("titleHasNotification", titleHasNotification);
  }, [titleHasNotification]);
  useLayoutEffect(() => {
    if (value && titles.includes(value)) {
      setSelectedTitle(value);
    } else {
      showDefaultTitle && defaultTitle && setSelectedTitle(defaultTitle);
    }
  }, [value]);

  const handleTitleClick = async (title: string, checkValidation: boolean) => {
    const allowSelectTitle = await onSelectTitle(title, checkValidation);
    if (allowSelectTitle) {
      setSelectedTitle(title);
    }
    return;
  };
  return (
    <div className={cn("flex cursor-pointer rounded-md", className)}>
      {titles.map((title, index) => (
        <div className="" key={title}>
          <div
            className={cn(
              "relative flex items-center border-secondary px-3 py-2 text-sm font-medium text-primary",
              index === 0
                ? "rounded-l-md border-b border-l border-t" //First
                : index < titles.length - 1
                ? "border-b border-l border-t" //Middle
                : "rounded-r-md border-b border-l border-r border-t", //Last
              selectedTitle === title ? "border border-darkPurple bg-faintPurple dark:bg-purple" : "",
              !(selectedTitle === title) ? "hover:bg-faintPurple/70" : "",
              index === 0 && titles[index] === selectedTitle
                ? "pr-[11px]" //First & Selected
                : index < titles.length - 1 && titles[index] === selectedTitle
                ? "pr-[11px]" //Middle & Selected
                : titles[index] === selectedTitle
                ? "" //Last & Selected
                : "",
              "hover:bg-faintPurple"
            )}
            onClick={() => handleTitleClick(title, true)}
          >
            {camelOrSnakeToTitleCase(title)}
            {titleHasNotification.includes(title) && (
              <div className="absolute right-[5px] top-[5px] h-full w-fit">
                <div className="h-2 w-2 rounded-full border-[1px] bg-darkPurple"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default MenuBar;
