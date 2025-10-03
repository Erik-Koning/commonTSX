import { useItemSizeUL } from '../../../hooks/useItemSizeUL';
import { cn } from '../../../lib/utils';
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./InnerOuterAnimatedGlow.module.css";
import useComputedStyles from '../../../hooks/useComputedStyle';
import useSetCSSProperty from '../../../hooks/useSetCSSProperty';
import { isDef } from "../../../utils/types";
import useElementStyles from '../../../hooks/useElementStyles';
import { mergeKeepNonNullOrUndefined } from '../../../utils/objectManipulation';

interface InnerOuterAnimatedGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  elementRef?: React.RefObject<HTMLElement | null>;
  insetPX?: number;
  borderWidthPX?: number;
  featherInnerPX?: number;
  backgroundBlurPX?: number;
  animateSpeed?: number;
  outerGlowEnabled?: boolean;
  innerGlowEnabled?: boolean;
  borderGlowEnabled?: boolean;
  visible: boolean;
  style?: React.CSSProperties;
}

export const InnerOuterAnimatedGlow = forwardRef<HTMLDivElement, InnerOuterAnimatedGlowProps>(
  (
    {
      className,
      elementRef,
      insetPX = 2,
      borderWidthPX = 2.5,
      featherInnerPX = 4,
      animateSpeed = 1.8,
      backgroundBlurPX = 26,
      outerGlowEnabled = undefined,
      innerGlowEnabled = undefined,
      borderGlowEnabled = undefined,
      visible = false,
      style,
      ...props
    },
    ref
  ) => {
    const [innerGlowOpacity, setInnerGlowOpacity] = useState(1);
    const [outerGlowOpacity, setOuterGlowOpacity] = useState(1);
    const [borderWidthState, setBorderWidthState] = useState(borderWidthPX);

    const innerGlowRef = useRef<HTMLDivElement>(null);
    const outerGlowRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
      upperLeftPosition,
      width: widthRef,
      height: heightRef,
    } = useItemSizeUL(
      // position the input box relative to the inputRef, upadte on window resize
      elementRef
    );

    /*useEffect(() => {
      console.log("InnerOuterAnimatedGlow: upperLeftPosition", heightRef);
    }, [heightRef]);
    */

    const styleProperties = ["border-radius", "height", "width"];
    const stylesss = useElementStyles(true, elementRef, ["height"], 160); //this creates a re-render when the height changes

    const computedStyles = useComputedStyles((isDef(visible) ?? false) && visible, elementRef, styleProperties, [visible], undefined, undefined);
    //console.log("stylesss", stylesss);
    //console.log("computedStyles", computedStyles);

    const mergedStyles = mergeKeepNonNullOrUndefined(mergeKeepNonNullOrUndefined(computedStyles, stylesss), style);

    // Parse height and width from computedStyles
    const height = parseFloat(mergedStyles["height"] ?? "0");
    const width = parseFloat(mergedStyles["width"] ?? "0");
    const borderRadius = parseFloat(mergedStyles["border-radius"] ?? "0");
    //console.log("height", height, "width", width, "borderRadius", borderRadius);

    useSetCSSProperty(containerRef, "--animation-speed", `${animateSpeed}s`, [animateSpeed]);
    useSetCSSProperty(containerRef, "--background-blur", `${backgroundBlurPX}px`, [backgroundBlurPX]);
    useSetCSSProperty(containerRef, "--border-width", `-${borderWidthState}px`, [borderWidthState]);
    useSetCSSProperty(containerRef, "--background-opacity", outerGlowOpacity, [outerGlowOpacity]);
    useSetCSSProperty(containerRef, "--border-opacity", borderGlowEnabled ? "1" : "0", [borderGlowEnabled]);

    useLayoutEffect(() => {
      if (isDef(borderWidthPX)) setBorderWidthState(borderWidthPX);
    }, [borderWidthPX]);

    useLayoutEffect(() => {
      if (isDef(innerGlowEnabled)) setInnerGlowOpacity(innerGlowEnabled ? 1 : 0);
    }, [innerGlowEnabled]);

    useLayoutEffect(() => {
      if (isDef(borderGlowEnabled)) setBorderWidthState(borderGlowEnabled ? borderWidthPX : 0);
    }, [borderGlowEnabled]);

    useLayoutEffect(() => {
      if (isDef(outerGlowEnabled)) setOuterGlowOpacity(outerGlowEnabled ? 1 : 0);
    }, [outerGlowEnabled]);

    return (
      <div
        ref={containerRef}
        className={cn("transition-all duration-500", styles.container)}
        style={{
          mixBlendMode: "multiply", //allows content to shown through the background
          opacity: !isDef(visible) || visible ? 1 : 0,
        }}
      >
        <div
          id="innerAnimatedGlow"
          style={{
            mixBlendMode: "multiply", //allows content to shown through the background
            visibility: "visible", // hide the element temporarily for testing
            pointerEvents: "none",
            position: "absolute",
            display: "grid",
            overflow: "hidden",
            zIndex: 10,
            height: elementRef ? `${height}px` : "100%",
            width: elementRef ? `${width}px` : "100%",
            opacity: elementRef ? (height < 40 ? height / (40 + (40 - height)) : 1) : 1,
            ...mergedStyles,
          }}
        >
          <div
            ref={innerGlowRef}
            style={{ opacity: innerGlowOpacity }}
            className={cn("pointer-events-none ", styles.innerCard, styles.gradientAnimation, {})}
          >
            <div style={{ padding: elementRef ? `${insetPX}px` : undefined }} className={cn("", styles.innerParent)}>
              <div
                style={{
                  height: elementRef ? `${height - insetPX * 2}px` : "100%",
                  width: elementRef ? `${width - insetPX * 2}px` : "100%",
                  filter: `blur(${featherInnerPX}px)`,
                }}
                className={cn("", styles.innerBg)}
              />
            </div>
          </div>
        </div>
        <div
          ref={outerGlowRef}
          id="outerAnimatedGlow"
          style={{
            mixBlendMode: "multiply", //allows content to shown through the background
            pointerEvents: "none",
            position: "absolute",
            opacity: height < 40 ? height / (40 + (40 - height)) : 1,
            borderRadius: `${borderRadius + 0.1}px`,
            zIndex: 5,
            ...mergedStyles,
          }}
        >
          <div
            style={{
              visibility: "visible", // hide the element temporarily for testing
              width: "100%",
              height: "100%",
            }}
            className={cn("", styles.card)}
          />
        </div>
      </div>
    );
  }
);

InnerOuterAnimatedGlow.displayName = "InnerOuterAnimatedGlow";
