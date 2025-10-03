import { getElemSizeULByRef, getMaxElemWidthByRef, useItemSizeUL } from '../../hooks/useItemSizeUL';
import { cn } from '../../lib/utils';
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, ButtonProps } from "./Button";
import { getObjectKeysValue } from '../../utils/objectManipulation';
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { numWords } from '../../utils/stringManipulation';

interface CuteWordOrbProps extends React.HTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
  maxChars?: number;
  maxWidthPX?: number;
  showFull?: boolean;
  selected?: boolean;
  clickToRemove?: boolean;
  iconsMap?: Record<string, any>;
  parseText?: (text: string) => string;
  allowWrap?: boolean;
  allowWrapOnHover?: boolean;
  allowBannerScroll?: boolean;
  bannerScrollDurationPerWord?: number;
  showPopupOnHover?: boolean;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonProps["variant"];
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, text?: string) => void;
  onHoverFeatures?: boolean;

  children?: React.ReactNode;
  containerClassName?: string;
  iconContainerClassName?: string;
  className?: string;
  innerClassName?: string;
}

const CuteWordOrb = forwardRef<HTMLDivElement, CuteWordOrbProps>(
  (
    {
      id,
      text,
      icon: IconComponent,
      iconStyle,
      maxChars = 10,
      maxWidthPX = 95,
      showFull = false,
      selected = false,
      clickToRemove = false,
      allowWrap = false,
      allowWrapOnHover = false,
      allowBannerScroll = false,
      bannerScrollDurationPerWord = 1.1,
      showPopupOnHover = false,
      buttonSize = "blank",
      buttonVariant = "blank",
      parseText,
      iconsMap,
      onClick,
      onHoverFeatures = true,
      children,
      containerClassName,
      className,
      iconClassName,
      iconContainerClassName,
      innerClassName,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [bannerScroll, setBannerScroll] = useState(false);

    const containerRef = useRef(null);
    const orbRef = useRef(null);
    const wordRef = useRef(null);

    const containerULSize = useItemSizeUL(orbRef, showPopupOnHover);
    const containerMaxWidth = getMaxElemWidthByRef(orbRef);
    //console.log("containerMaxWidth", containerMaxWidth);

    useLayoutEffect(() => {
      if (bannerScroll) return;
      const { upperLeftPosition: XY, width, height } = getElemSizeULByRef(orbRef);
      const { upperLeftPosition: wordXY, width: wordWidth, height: wordHeight } = getElemSizeULByRef(wordRef);
      //console.log("Words positions");
      //if ((maxWidthPX && (wordXY.x + wordWidth + 5 >= XY.x + width)) || (!showFull && (wordWidth + 10 >= maxWidthPX))) {
      if (wordWidth >= maxWidthPX || (allowBannerScroll && wordXY.x + wordWidth >= XY.x + width)) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }, [text, children]);

    /*
    const contentJSX = IconComponent ? (
      <div className="flex items-center gap-x-2">
        <div className={cn("flex items-center justify-center", iconClassName)}>
          <IconComponent />
        </div>
        <div className="">{text && parseText ? parseText(text) : text}</div>
      </div>
    ) : text && parseText ? (
      parseText(text)
    ) : (
      text
    );
    */

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      typeof onClick === "function" && onClick(e, text);
    };

    const contentJSX = (
      <>
        {/* Icon Component */}
        {IconComponent && <IconComponent className={cn("flex-shrink-0", iconClassName)} style={{ minWidth: "20px", minHeight: "20px" }} />}
        {/* The Text Content */}
        <span className={cn("transition-all duration-240", !((isHovered && allowWrapOnHover) || allowWrap) && "truncate")}>
          {text && parseText ? parseText(text) : text}
        </span>
      </>
    );

    const showCloseButton = clickToRemove && isHovered;

    return (
      <div
        className={cn("relative flex w-full flex-1", containerClassName)}
        ref={containerRef}
        onClick={() => console.log("clicked cutewordorb container")}
      >
        {true && showPopupOnHover && (
          <div
            className="pointer-events-none absolute h-full w-full overflow-visible"
            style={{
              bottom: 0,
              left: 0,
              //transform: "translateX(-50%)",
              zIndex: 50,
            }}
          >
            <CuteWordOrb
              key={"popup"}
              maxWidthPX={containerMaxWidth ?? containerULSize.width ?? maxWidthPX}
              allowWrap={true}
              text={text}
              containerClassName="pointer-events-none absolute"
              className={cn("pointer-events-none bg-secondary-light bg-opacity-80", className)}
            />
          </div>
        )}
        <Button
          id={id}
          ref={orbRef}
          onMouseEnter={() => {
            if (isOverflowing && allowBannerScroll) setBannerScroll(true);
            if (onHoverFeatures) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (isOverflowing && allowBannerScroll) setBannerScroll(false);
            if (onHoverFeatures && isHovered) setIsHovered(false);
          }}
          variant={buttonVariant}
          size={buttonSize}
          className={cn(
            "border-1 flex min-h-fit overflow-x-hidden rounded-md border border-input py-0.5 text-sm font-normal",
            {
              "-pr-0.5": isOverflowing,
              "border-purple bg-faintPurple": selected,
              "w-full justify-start": !isOverflowing,
            },
            className
          )}
          onClick={(e: any) => {
            handleButtonClick(e);
            console.log("clicked cutewordorb button");
          }}
          innerClassName={innerClassName}
          {...props}
        >
          {children ?? (
            <div className={cn("flex", showCloseButton && "relative")}>
              {showCloseButton && (
                <div className="absolute flex h-full w-full items-center justify-center bg-secondary-light">
                  <CloseOutlinedIcon style={{ fontSize: 15 }} />
                </div>
              )}
              {text && iconsMap && iconsMap.default && (
                <div className={cn("z-10 h-full rounded-md bg-background-light pl-1.5 pr-0.5 text-secondary-dark", iconContainerClassName)}>
                  {(() => {
                    //TODO is this function necessary? what is it doing? Find the appropriate icon component
                    let IconComponent = getObjectKeysValue(iconsMap, text, true, true);
                    return <IconComponent style={{ fontSize: 15, ...iconStyle }} />;
                  })()}
                </div>
              )}
              <div
                //the sliding container
                className={cn("flex h-min w-fit gap-x-0.5 pl-1", {
                  "animate-slideLeftSlow transition-all": bannerScroll,
                  "pr-0": isOverflowing,
                  "pr-1": !isOverflowing,
                })}
                style={{
                  animationDuration: bannerScrollDurationPerWord && text ? `${numWords(text) * bannerScrollDurationPerWord}s` : "9s",
                }}
              >
                <div
                  //The original text
                  ref={wordRef}
                  style={{
                    maxWidth: showFull || bannerScroll ? undefined : `${maxWidthPX}px`,
                    overflow: bannerScroll || (isHovered && allowWrapOnHover) ? "visible" : "hidden",
                    textOverflow: bannerScroll || (isHovered && allowWrapOnHover) ? "" : "ellipsis",
                    whiteSpace: allowWrap || (isHovered && allowWrapOnHover) ? "normal" : "nowrap",
                    textAlign: "start",
                  }}
                  className={cn("flex w-full items-center justify-start gap-2", { "": bannerScroll })}
                >
                  {contentJSX}
                </div>
                {allowBannerScroll && bannerScroll && (
                  //duplicate text for banner scroll
                  <>
                    <div className="mx-2 w-[1px] bg-secondary-dark" />
                    <div
                      style={{
                        whiteSpace: allowWrap ? "normal" : "nowrap",
                      }}
                    >
                      {contentJSX}
                    </div>
                    <div className="mx-2 w-[1px] bg-secondary-dark"></div>
                  </>
                )}
              </div>
            </div>
          )}
        </Button>
      </div>
    );
  }
);
CuteWordOrb.displayName = "CuteWordOrb";
export { CuteWordOrb };
