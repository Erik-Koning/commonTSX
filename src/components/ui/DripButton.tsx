/* tool to play with svg paths: https://yqnn.github.io/svg-path-editor/ */

import { cn } from '../../lib/utils';
import { colourToHex } from '../../utils/colour';
import { getCSSVariable } from '../../utils/styles';
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useItemSizeUL } from '../../hooks/useItemSizeUL';
import useMutationAndResizeStyle from '../../hooks/useMutationAndResizeStyle';

interface DripButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  takeoff?: number; //ratio for distance to middle until drip curve significantly starts
  takeoffHov?: number; //ratio for distance to middle until drip curve significantly starts
  slope?: number; //slope of the drip curve
  slopeHov?: number; //slope of the drip curve
  inflectionPX?: number; //x ratio value of the inflection point
  inflectionPXHov?: number; //x ratio value of the inflection point
  inflectionPY?: number; //x ratio value of the inflection point
  inflectionPYHov?: number; //x ratio value of the inflection point
  SXLength?: number; //x length value of the climax point handle
  SXLengthHov?: number; //x length value of the climax point handle
  height?: number;
  heightHov?: number;
  minWidth?: number;
  middleContentWidth?: number;
  middleContentWidthHov?: number;
  middleContenRadiusPercent?: number;
  onClick?: () => void;
  visible?: boolean;
  dripColor?: string;
  dripColorHov?: string;
  dripOpacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  transitionDuration?: number;
  forceIsHovered?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const DripButton = forwardRef<HTMLDivElement, DripButtonProps>(
  (
    {
      icon,
      title,
      className,
      takeoff = 0.8,
      takeoffHov = 0.85,
      slope = 0.8,
      slopeHov = 1.2,
      inflectionPX = 0.9,
      inflectionPXHov = 0.85,
      inflectionPY = 0.55,
      inflectionPYHov = 0.7,
      SXLength = 3,
      SXLengthHov = 5,
      height = 18,
      heightHov = 30,
      minWidth = 400,
      middleContentWidth = 0,
      middleContentWidthHov = undefined,
      middleContenRadiusPercent = 0,
      onClick,
      visible = true,
      dripColor = "--background",
      dripColorHov = "--secondary-light",
      dripOpacity = 1,
      strokeWidth = 0,
      strokeColor = "--darkPurple",
      transitionDuration = 0.2,
      forceIsHovered,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [limitMiddleContentWidth, setLimitMiddleContentWidth] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(forceIsHovered ?? false);
    const [containerVisible, setContainerVisible] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const middleContentRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const innerContentRef = useRef<HTMLDivElement>(null);

    const iconWidth = useItemSizeUL(iconRef).width;

    const prevInnerContentWidth = useRef(0);
    const prevMiddleContentWidth = useRef(0);

    const innerContentStyles = useMutationAndResizeStyle(innerContentRef, ["height"], ["width", "height"], 100, true, undefined, undefined, false);

    const textStyles = useMutationAndResizeStyle(
      textRef,
      ["height"],
      ["width", "scrollWidth", "clientWidth"],
      undefined,
      true,
      undefined,
      undefined,
      false
    );

    const middleContentStyles = useMutationAndResizeStyle(middleContentRef, ["height"], ["width", "height"], 100, true, undefined, undefined, false);

    const containerStyles = useMutationAndResizeStyle(
      containerRef,
      ["height"],
      ["border-radius", "height", "width"],
      100,
      true,
      undefined,
      undefined,
      false
    );

    const getMaxControlPointForCurve = (C2X: number, C2Y: number, slope: number, height: number): [number, number] => {
      //start with rule #2 and then increase C1X until rule #1 is also satisfied
      let C1Y = 0; //This is the minimum value for C1Y and max for its sibling handle which points towards the max height
      let C1X = (C1Y - C2Y) / slope + C2X;
      let found = false;

      while (!found) {
        C1X = (C1Y - C2Y) / slope + C2X;
        let diff = C2X - C1X;
        let Y = slope * diff + C2Y;
        if (Y <= height) {
          found = true;
          break;
        } else {
          C1Y++;
        }
        if (C1Y > height) {
          break;
        }
      }
      if (found) {
        return [C1X, C1Y];
      } else {
        C1Y = 2;
        C1X = (C1Y - C2Y) / slope + C2X;
        return [C1X, C1Y];
      }
    };

    if (limitMiddleContentWidth !== null) {
      middleContentWidthHov = limitMiddleContentWidth;
    }

    strokeColor = colourToHex(getCSSVariable(strokeColor));

    let currentMiddleContentWidth: number | undefined = parseFloat(middleContentStyles.width);
    if (isNaN(currentMiddleContentWidth)) currentMiddleContentWidth = undefined;

    //width of each side
    const containerWidth = parseFloat(containerStyles?.width ?? "0");

    const sideWidth = (containerWidth - middleContentWidth) / 2;
    const C0X = sideWidth * takeoff;

    //The end of the curve
    const C2X = sideWidth * inflectionPX;
    const C2Y = height * inflectionPY;

    // y=mx+b
    // Rule 1. Y must be less than or equal to var height at position y=m*(C2X + (C2X - C1X)) + C2Y , only C1X is unknown and Y is unknown
    // Rule 2. C1X = (Y-C2Y)/m + C2X, only C1X is unknown, Y must be positive
    //

    //The control point for end of the curve, finds the max control point magnitude for the curve without overflowing max height and y=0
    const [C1X, C1Y] = getMaxControlPointForCurve(C2X, C2Y, slope, height);

    const pathData = `M0-1C${C0X} 0 ${C1X} ${C1Y} ${C2X} ${C2Y}S${sideWidth - SXLength} ${height} ${sideWidth} ${height}L${sideWidth} 0 0-1`;

    /* The hover curve */
    const sideWidthHov = (containerWidth - (middleContentWidthHov ?? (currentMiddleContentWidth ? currentMiddleContentWidth : middleContentWidth))) / 2;
    const C0XHov = sideWidthHov * takeoffHov;
    const C2XHov = sideWidthHov * inflectionPXHov;
    const C2YHov = heightHov * inflectionPYHov;
    const [C1XHov, C1YHov] = getMaxControlPointForCurve(C2XHov, C2YHov, slopeHov, heightHov);

    const pathDataHover = `M0-1C${C0XHov} 0 ${C1XHov} ${C1YHov} ${C2XHov} ${C2YHov}S${
      sideWidthHov - SXLengthHov
    } ${heightHov} ${sideWidthHov} ${heightHov}L${sideWidthHov} 0 0-1`;

    const innerContent = (
      <div ref={innerContentRef} className="flex max-w-full items-baseline justify-center gap-x-1">
        <div className="flex">
          <span ref={iconRef}>{icon}</span>
        </div>
        {parseFloat(middleContentStyles.width) > iconWidth && title && (
          <span ref={textRef} className="flex-auto overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {title}
          </span>
        )}
      </div>
    );

    useEffect(() => {
      if (limitMiddleContentWidth) return;

      //measure the the inner content width and the middle content width, limit the middle content width to the inner content width once it stops growing
      let textWidth = parseFloat(textStyles.width) ?? 0;
      if (isNaN(textWidth)) textWidth = 0;
      let innerContentWidth = parseFloat(innerContentStyles.width) ?? 0;
      if (isNaN(innerContentWidth)) innerContentWidth = 0;
      const middleContainerWidth = parseFloat(middleContentStyles.width);

      if (textWidth <= 0) return;

      if (middleContainerWidth > prevMiddleContentWidth.current) {
        //the container has grown, did the inner content grow?
        if (innerContentWidth > prevInnerContentWidth.current) {
          //the inner content grew, limit the middle content width to the inner content width
        } else {
          // it did not grow, limit the middle content width to the inner content width
          setLimitMiddleContentWidth(middleContainerWidth);
        }
      } else if (middleContainerWidth <= innerContentWidth) {
        //the container has shrunk
        setLimitMiddleContentWidth(null);
      }
      prevInnerContentWidth.current = innerContentWidth;
      prevMiddleContentWidth.current = middleContainerWidth;
    }, [textStyles, middleContentStyles]);

    useEffect(() => {
      setLimitMiddleContentWidth(null);
    }, [title]);

    const handleButtonClick = () => {
      onClick && onClick();
    };

    if (!containerVisible && containerRef.current) {
      setTimeout(() => {
        setContainerVisible(true);
      }, 100);
    }

    return (
      <div
        style={{
          height: `${heightHov}px`,
          minWidth: `${minWidth}px`,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          transition: "opacity 0.18s",
          opacity: containerVisible ? 1 : 0,
        }}
        ref={containerRef}
        onMouseEnter={() => {
          if (forceIsHovered !== undefined) return;
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (forceIsHovered !== undefined) return;
          setIsHovered(false);
        }}
        {...props}
      >
        <div
          //Div to contain the drip curve should elements be transitioned at different speeds
          style={{
            top: 0,
            height: isHovered ? `${heightHov}px` : `${height}px`,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            transition: `height ${transitionDuration}s`,
            transitionTimingFunction: "",
            overflow: "visible", //overflow hidden to hide the curve when it overflows the container
            position: "absolute",
          }}
          className="cursor-pointer"
          onClick={() => {
            handleButtonClick();
          }}
        >
          <div
            //Middle content
            ref={middleContentRef}
            style={{
              position: "absolute",
              zIndex: 1,
              width:
                isHovered && !limitMiddleContentWidth && !middleContentWidthHov
                  ? `100%`
                  : `${(isHovered ? limitMiddleContentWidth ?? middleContentWidthHov ?? middleContentWidth : middleContentWidth) + strokeWidth + 1}px`,
              height: isHovered
                ? `${heightHov + (middleContenRadiusPercent / 3 / 100) * (middleContentWidthHov ?? middleContentWidth)}px`
                : `${height + (middleContenRadiusPercent / 3 / 100) * middleContentWidth}px`,
              backgroundColor: isHovered ? colourToHex(getCSSVariable(dripColorHov)) : colourToHex(getCSSVariable(dripColor)),
              //backgroundColor: "red",
              //transition the height and width 0.5 ease
              transitionProperty: "width, height, radius",
              transitionDuration: transitionDuration + "s",
              borderRadius: `0% 0% 50% 50% / 0% 0% ${middleContenRadiusPercent}% ${middleContenRadiusPercent}%`,
              //border only on bottom
              borderBottom: `${strokeWidth}px solid ${strokeColor}`,
            }}
            className="flex cursor-pointer items-center justify-center"
          >
            {isHovered && children
              ? children
              : /*
              <div className={cn("flex max-w-full items-baseline justify-center gap-x-1 bg-slate-600")}>
                <div ref={iconRef}>{icon}</div>
                {parseFloat(middleContentStyles.width) > iconWidth && (
                  <div style={{ width: parseFloat(middleContentStyles.width) - iconWidth * 2 }} className="bg-green">
                    <Label
                      variant={"blank"}
                      text={title}
                      className="border-none bg-none"
                      textScrollIfOverflow={false}
                      //defaultMaxWidthBetweenRefsWidth={parseFloat(middleContentStyles.width)}
                    />
                  </div>
                )}
            </div>
            */
                innerContent}
          </div>
          <div style={{ display: "flex", height: "100%", width: "100%" }} className="">
            <div
              style={{
                position: "relative",
                width: true ? "100%" : `${containerWidth}px`,
                height: "100%",
                overflow: "hidden",
              }}
              className=""
            >
              <svg
                className="svgCurve"
                style={{
                  position: "absolute",
                  top: 0 - strokeWidth / 2,
                  left: 0,
                  width: true ? "100%" : `${containerWidth}px`,
                  height: isHovered ? heightHov + strokeWidth : height + strokeWidth,
                  //backgroundColor: "red",
                  transition: `all ${transitionDuration}s`,
                }}
                preserveAspectRatio="none"
                //viewBox={`0 0 ${containerWidth} ${height}`} // Define the coordinate system
              >
                <path
                  d={isHovered ? pathDataHover : pathData}
                  fill={isHovered ? colourToHex(getCSSVariable(dripColorHov)) : colourToHex(getCSSVariable(dripColor))}
                  fillOpacity={dripOpacity}
                  strokeWidth={strokeWidth}
                  stroke={strokeColor}
                  style={{
                    transitionDuration: transitionDuration + "s",
                    transitionProperty: "d, fill, stroke, fill-opacity",
                  }}
                  className="cursor-pointer"
                />
                <path
                  d={isHovered ? pathDataHover : pathData}
                  fill={isHovered ? colourToHex(getCSSVariable(dripColorHov)) : colourToHex(getCSSVariable(dripColor))}
                  fillOpacity={dripOpacity}
                  transform={`scale(-1, 1) translate(-${containerWidth}, 0)`}
                  strokeWidth={strokeWidth}
                  stroke={strokeColor}
                  style={{
                    transitionDuration: transitionDuration + "s",
                    transitionProperty: "d, fill, stroke, fill-opacity",
                  }}
                  className="cursor-pointer"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DripButton.displayName = "DripButton";
