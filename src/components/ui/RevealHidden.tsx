import React, { useState, useRef, useEffect } from "react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Button, ButtonProps } from "./Button";
import { cn } from '../../lib/utils';

interface RevealHiddenProps {
  hiddenTitle: string;
  visibleTitle: string;
  enableVisibleTitleClick?: boolean;
  oneTimeHide?: boolean;
  iconSize?: number;
  hideIcon?: boolean;
  titleClassName?: string;
  className?: string;
  buttonclassName?: string;
  buttonVariantSize?: ButtonProps["size"]; //example of typescript importing class-variance-authority ("cva") keys and values exported types
  children: React.ReactNode;
  isOpen?: boolean;
  visibleClassName?: string;
}

const RevealHidden: React.FC<RevealHiddenProps> = ({
  hiddenTitle,
  visibleTitle,
  enableVisibleTitleClick = false,
  oneTimeHide = false,
  iconSize = 14,
  hideIcon = false,
  titleClassName,
  className,
  visibleClassName,
  buttonclassName,
  buttonVariantSize = undefined,
  children,
  isOpen,
}) => {
  const [isHidden, setIsHidden] = useState(isOpen ?? false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsHidden(isOpen ?? false);
  }, [isOpen]);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
    // Focus the button to make it accessible via keyboard
    toggleButtonRef.current?.focus();
  };

  const handleVisibleTitleClick = (e: React.MouseEvent) => {
    if (!enableVisibleTitleClick) {
      e.stopPropagation(); // Prevent click event from propagating
    }
  };

  return oneTimeHide && !isHidden ? (
    <div className={cn("", className)}>{children}</div>
  ) : (
    <div>
      <Button
        className={cn("h-auto items-center", buttonclassName)}
        variant="ghost"
        size={buttonVariantSize ?? "tight"}
        ref={toggleButtonRef}
        onClick={toggleVisibility}
      >
        <div className="flex h-fit items-center justify-center gap-x-2">
          {!hideIcon && (isHidden ? <VisibilityOffOutlinedIcon sx={{ fontSize: iconSize }} /> : <VisibilityOutlinedIcon sx={{ fontSize: iconSize }} />)}
          {isHidden ? (
            <p className={cn("flex items-center", titleClassName)}>{hiddenTitle}</p>
          ) : (
            <p
              className={cn("flex items-center", {
                "cursor-pointer": enableVisibleTitleClick,
                "": !enableVisibleTitleClick,
              })}
              onClick={handleVisibleTitleClick}
            >
              {visibleTitle}
            </p>
          )}
        </div>
      </Button>
      <div className={cn("", visibleClassName)}>{!isHidden && children}</div>
    </div>
  );
};
RevealHidden.displayName = "RevealHidden";

export default RevealHidden;
