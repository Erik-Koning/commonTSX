"use client";

import ClipboardJS from "clipboard";
import * as React from "react";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Button, buttonVariants } from "./Button";
import { fontSize } from "@mui/system";
import { TooltipWrapper } from "./TooltipWrapper";
import { cn } from "../../lib/utils";

interface CopyToClipboardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltipText?: string;
  tooltipHoverDelay?: number;
  onClickText?: string;
  onClickTextDuration?: number;
  onClick?: any;
  dataToCopy?: string;
  showSuccessIconOnClicked?: boolean;
  children?: React.ReactNode | undefined;
}

export const CopyToClipboardWrapper = React.forwardRef<HTMLDivElement, CopyToClipboardWrapperProps>(
  (
    {
      tooltipText = "copy the adjacent text to your clipboard",
      tooltipHoverDelay = 700,
      onClick,
      dataToCopy,
      onClickText = "Copied!",
      onClickTextDuration = 2000,
      showSuccessIconOnClicked = true,
      children = undefined,
      ...props
    },
    ref
  ) => {
    const [buttonClicked, setButtonClicked] = React.useState<boolean>(false);
    const textRef = React.useRef(null);

    const handleCopyClick = async () => {
      setButtonClicked(true);
      setTimeout(() => {
        setButtonClicked(false);
      }, 2000);

      console.log("dataToCopy", dataToCopy);
      let clipboard: any = null;

      if (!dataToCopy) {
        return;
      }
      if (textRef.current) {
        clipboard = new ClipboardJS(textRef.current, {
          text: () => {
            return dataToCopy;
          },
        });

        clipboard.on("success", () => {
          //alert("Copied to clipboard!");
          clipboard.destroy();
        });

        clipboard.on("error", (e: any) => {
          console.error("Error copying to clipboard:", e);
          clipboard.destroy();
        });

        clipboard.onClick({ currentTarget: textRef.current });
      }
    };

    return (
      <div onClick={handleCopyClick} {...props}>
        {children !== undefined ? (
          children
        ) : (
          <TooltipWrapper
            tooltipText={tooltipText}
            onClickText={onClickText}
            hoverDelay={tooltipHoverDelay}
            tooltipOnClickTextDuration={onClickTextDuration}
            forceShowOnClickText={buttonClicked}
          >
            <div className={cn(buttonVariants({ variant: "ghost", size: "fit" }), "flex gap-x-2 text-purple hover:text-darkPurple")}>
              <div className="flex items-center gap-x-2">
                {showSuccessIconOnClicked && buttonClicked ? (
                  <CheckRoundedIcon sx={{ fontSize: 22 }} />
                ) : (
                  <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                )}
                <h4>Copy to clipboard</h4>
              </div>
            </div>
          </TooltipWrapper>
        )}
        <div ref={textRef} style={{ display: "none" }} />
      </div>
    );
  }
);

CopyToClipboardWrapper.displayName = "CopyToClipboardWrapper";
