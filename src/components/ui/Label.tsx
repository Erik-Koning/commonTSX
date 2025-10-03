"use client";

import { useMaxWidthBetween } from '../../hooks/useMaxWidthBetween';
import useOverflowing from '../../hooks/useOverflowing';
import { cn } from '../../lib/utils';
import { colourIsDark, lightenHex } from '../../utils/colour';
import { setRefs } from '../../utils/ref';
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, useEffect, useRef, useState } from "react";

const labelVariants = cva("outline outline-1 rounded-xl w-fit h-fit outline-border", {
  variants: {
    size: {
      default: "text-sm font-normal",
      xs: "text-xs font-normal",
      sm: "text-sm font-normal rounded-md",
      blank: "",
    },
    variant: {
      default: "bg-secondary-light px-[5px] py-0",
      purple: "bg-purple text-white outline-darkPurple px-[5px] py-0",
      blank: "bg-transparent outline-none rounded-none outline-0 px-0 py-0",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

interface LabelProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof labelVariants> {
  className?: string;
  blank?: boolean;
  children?: React.ReactNode;
  text?: string | null;
  icon?: React.ReactNode;
  bgColour?: string;
  textScrollIfOverflow?: boolean;
  restrictSingleLine?: boolean;
  setMaxWidthBetweenRefs?: React.RefObject<HTMLElement | null>[];
  defaultMaxWidthBetweenRefsWidth?: number;
  maxWidthBetweenRefsAdjustment?: number;
  showFull?: boolean;
  scrollCloseDuration?: number;
  scrollOpenDuration?: number;
}

export const Label = forwardRef<HTMLDivElement, LabelProps>(
  (
    {
      className,
      blank = false,
      textScrollIfOverflow = true,
      restrictSingleLine = true,
      children,
      bgColour,
      text,
      icon,
      size,
      variant,
      showFull,
      setMaxWidthBetweenRefs,
      defaultMaxWidthBetweenRefsWidth = 20,
      maxWidthBetweenRefsAdjustment = -28,
      scrollCloseDuration = 0.3,
      scrollOpenDuration = 3.4,
      ...props
    },
    ref
  ) => {
    const parentDivRef = useRef<HTMLDivElement>(null);
    const textDivRef = useRef<HTMLDivElement>(null);

    const [scrollDistance, setScrollDistance] = useState(0);
    const [animationDuration, setAnimationDuration] = useState("4s");
    const [isHovered, setIsHovered] = useState(false);
    const [translateLeft, setTranslateLeft] = useState(false);
    const [isOverflowingWord, setIsOverflowingWord] = useState(false);

    //otpionally get max width between two refs to set max size of the label. (HACK becuase) It is unknown how to set label to take max width without pushing neighbouring elements out of the way)
    const maxWidthEnabled = setMaxWidthBetweenRefs && setMaxWidthBetweenRefs.length > 0;
    const maxWidth = useMaxWidthBetween(setMaxWidthBetweenRefs);

    //only check if overflowing if max width is known and set
    const isOverflowing = useOverflowing(parentDivRef, textDivRef, undefined, maxWidthEnabled && maxWidth !== 0, [text]);

    useEffect(() => {
      //Not using this for now
      if (animationDuration) return;
      if (textScrollIfOverflow && parentDivRef.current && textDivRef.current) {
        const parentWidth = parentDivRef.current.offsetWidth;
        const textWidth = textDivRef.current.scrollWidth;

        if (textWidth > parentWidth) {
          const distance = textWidth - parentWidth;
          setScrollDistance(distance);

          const scrollSpeed = 50; // pixels per second, adjust as needed
          const duration = (distance / scrollSpeed).toFixed(2);
          setAnimationDuration(`${duration}s`);
        }
      }
    }, [textScrollIfOverflow, text]);

    useEffect(() => {
      setIsOverflowingWord(false);
    }, [text]);

    useEffect(() => {
      if (isOverflowing) {
        setIsOverflowingWord(true);
      }
    }, [isOverflowing]);

    const [scroll, setScroll] = useState(false);

    useEffect(() => {
      if (!textScrollIfOverflow) return;
      if (!isOverflowingWord) return;
      if (isHovered) {
        setScroll(true);
        setAnimationDuration(`${scrollOpenDuration}s`);
        setTranslateLeft(true);
      } else {
        setAnimationDuration(`${scrollCloseDuration}s`);
        setTranslateLeft(false);
        setTimeout(() => {
          setScroll(false);
        }, scrollCloseDuration * 1000);
      }
    }, [isHovered, textScrollIfOverflow]);

    const useIsEllipsisActive = (ref: React.RefObject<HTMLElement | null>) => {
      const [isEllipsisActive, setIsEllipsisActive] = useState(false);

      useEffect(() => {
        const checkEllipsis = () => {
          if (ref.current) {
            const hasEllipsis = ref.current.scrollWidth > ref.current.clientWidth;
            setIsEllipsisActive(hasEllipsis);
          }
        };

        checkEllipsis();
        window.addEventListener("resize", checkEllipsis);

        return () => {
          window.removeEventListener("resize", checkEllipsis);
        };
      }, [ref]);

      return isEllipsisActive;
    };
    const isEllipsisActive = useIsEllipsisActive(textDivRef);
    console.log("for text" + text, isEllipsisActive, isOverflowing);

    return (
      <div
        ref={(node) => {
          setRefs(node, ref, parentDivRef);
        }}
        className={
          blank
            ? ""
            : cn(
                "group",
                labelVariants({ size, variant }),
                { "text-primary-light": bgColour && colourIsDark(bgColour), "overflow-hidden": scroll },
                className
              )
        }
        style={{
          maxWidth: maxWidthEnabled ? (maxWidth ? maxWidth + maxWidthBetweenRefsAdjustment : defaultMaxWidthBetweenRefsWidth) : undefined,
          backgroundColor: bgColour ? lightenHex(bgColour, 1.15) : undefined,
          outlineColor: bgColour ?? undefined,
        }}
        hidden={!text && !children}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children ? (
          children
        ) : (
          <div
            className={cn("flex items-center")} // Wrapper to handle overflow
          >
            {icon && <div className="mr-1">{icon}</div>}
            <div
              ref={textDivRef}
              className={cn(
                "",
                { "whitespace-nowrap": !scroll && restrictSingleLine, "overflow-hidden text-ellipsis": isOverflowingWord && !scroll },
                "duration-[6000ms] transition-all ease-linear"
              )}
              style={{
                transitionDuration: animationDuration,
                transform: translateLeft ? "translateX(-80%)" : "",
                marginLeft: undefined,
                //overflow: textScrollIfOverflow ? "visible" : "hidden",
                textOverflow: !scroll && textScrollIfOverflow ? "" : "",
                whiteSpace: restrictSingleLine ? "nowrap" : "normal",
                textAlign: "start",
              }}
            >
              {text}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Label.displayName = "Label";
