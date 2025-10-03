import React, { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from "class-variance-authority";
import { mode } from "crypto-js";
import { ProgressDots } from "../ui/ProgressDots";
import { AnimatePresence, motion, MotionProps } from "framer-motion";

// Define size variants for the modal
export const modalSizeVariants = cva(
  "border w-full max-h-screen overflow-y-scroll rounded-lg sm:rounded-lg bg-background-light text-black shadow dark:text-white mx-auto",
  {
    variants: {
      variant: {
        error: "rounded-md bg-red-100 text-red-800 shadow dark:text-red-200",
        default: "",
      },
      size: {
        lg: "p-2 xs:p-3 pt-3 sm:p-5 md:p-8 xl:p-8 max-w-full sm:max-w-[700px] md:max-w-[75vw] max-h-[80vh] lg:max-w-[1200px]",
        md: "p-2 xs:p-3 pt-3 sm:p-5 px-3 xxs:px-3.5 xs:px-5  sm:pb-3.5 sm:px-7 md:p-5 lg:p-9 lg:py-8 lg:pb-7 max-w-[504px] max-h-[75vh]",
        sm: "p-2 xs:p-3 pt-3 sm:p-4 md:p-4 max-w-full sm:max-w-[460px] max-h-[66vh]",
        full: "p-2 xs:p-3 pt-3 sm:p-3 lg:px-8 lg:py-6 max-h-full",
        error: "p-6 xs:p-3 pt-3 sm:p-3 sm:max-w-lg xl:max-w-lg",
        tight: "p-0.5 xs:p-3 pt-3 sm:p-0.5 max-w-md max-h-[75vh] sm:max-w-md xl:max-w-lg border-none",
        none: "",
      },
      height: {
        default: "",
        nav: "top-navbar-height",
        navWithBanner: "h-full-minus-navbar-banner top-navbar-banner-height",
        blank: "h-full",
        full: "h-full justify-center max-h-full",
        screen: "h-screen overflow-scroll",
        screenScroll: "min-h-screen h-full",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      height: "default",
    },
  }
);

const titleStyleVariants = cva("flex items-baseline justify-between gap-x-3 pb-2 sm:mx-auto text-darkBlue", {
  variants: {
    titleSize: {
      lg: "text-xl font-extrabold pb-1", // Larger and bold for large size
      md: "text-lg font-bold pb-1", // Medium size with medium boldness
      sm: "text-base font-normal pb-0", // Smaller and normal font weight for small size
    },
  },
  defaultVariants: {
    titleSize: "lg",
  },
});

export type ModalSizeVariantProps = VariantProps<typeof modalSizeVariants>;

export interface ModalLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalSizeVariants>,
    VariantProps<typeof titleStyleVariants> {
  className?: string;
  titleClassName?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  logo?: React.ReactNode;
  numSteps?: number;
  currentStep?: number;
  titleNoWrap?: boolean;
  subtitleBelow?: boolean;
  alternateJSX?: React.ReactNode;
  flipped?: boolean;
  animateDuration?: number;
  motionDivProps?: MotionProps;
}

export const ModalLayout = forwardRef<HTMLDivElement, ModalLayoutProps>(
  (
    {
      className,
      titleClassName,
      titleNoWrap = false,
      subtitleBelow = false,
      title,
      subtitle,
      children,
      size,
      height,
      variant,
      titleSize,
      style,
      logo,
      numSteps,
      currentStep,
      alternateJSX,
      flipped = false,
      animateDuration = 0.6,
      motionDivProps,
      ...props
    },
    ref
  ) => {
    const halfDuration = animateDuration / 2;
    const firstRender = useRef(true);
    const [flipContent, setFlipContent] = useState(flipped);
    const [hasAnimated, setHasAnimated] = useState(true);

    const prevCurrentStep = useRef(0);

    useEffect(() => {
      // Skip animation on first render
      if (firstRender.current) {
        setFlipContent(flipped);
        return;
      }

      if (flipped === flipContent) {
        return;
      }

      // Convert halfDuration from seconds to milliseconds for setTimeout
      const timeoutMs = halfDuration * 1000;
      const timerId = setTimeout(() => {
        setFlipContent(flipped);
      }, timeoutMs);

      // Clean up timeout if component unmounts or flipped changes again
      return () => clearTimeout(timerId);
    }, [flipped, halfDuration]);

    useEffect(() => {
      if (currentStep !== undefined) {
        prevCurrentStep.current = currentStep;
      }
    }, [currentStep]);

    useEffect(() => {
      // Mark that we're no longer on first render
      if (firstRender.current) {
        firstRender.current = false;
        // Wait a bit to set hasAnimated to true to avoid any initial animations
        const timer = setTimeout(() => {
          setHasAnimated(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, []);

    // Card flip animation variants
    const flipVariants = {
      front: {
        rotateY: 0,
        transition: {
          duration: animateDuration,
          ease: "easeInOut",
        },
      },
      back: {
        rotateY: 180,
        transition: {
          duration: animateDuration,
          ease: "easeInOut",
        },
      },
    };

    const contentVariants = {
      front: {
        rotateY: 0,
        transition: {
          duration: animateDuration,
          ease: "easeInOut",
        },
      },
      back: {
        rotateY: 180,
        transition: {
          duration: animateDuration,
          ease: "easeInOut",
        },
      },
    };

    // If it's the first render, apply static styles instead of animations
    const staticStyles = firstRender.current
      ? {
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }
      : {};

    const direction = currentStep !== undefined && currentStep > prevCurrentStep.current ? -1 : 1;
    const motionDivVariants = motionDivProps?.variants;

    return (
      <>
        {logo && <div className="mb-[69px] flex items-center justify-center">{logo}</div>}
        <motion.div
          ref={ref}
          className={cn(modalSizeVariants({ size, variant, height }), className, "perspective-1000")}
          style={{
            ...style,
            transformStyle: "preserve-3d",
            ...staticStyles,
          }}
          initial={false}
          animate={hasAnimated ? (flipped ? "back" : "front") : false}
          variants={flipVariants}
          {...(props as Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDrag" | "onDragEnd">)}
        >
          <AnimatePresence mode="wait">
            {!flipContent ? (
              <motion.div
                key="front"
                className="backface-hidden w-full h-full"
                initial={false}
                animate={hasAnimated ? contentVariants.front : undefined}
                exit={hasAnimated ? { opacity: 0 } : undefined}
                style={{
                  backfaceVisibility: "hidden",
                  ...(firstRender.current && !flipped ? { transform: "rotateY(0deg)" } : {}),
                }}
              >
                {(title || subtitle) && (
                  <div
                    className={cn(
                      titleStyleVariants({ titleSize }),
                      numSteps && "pb-0",
                      titleNoWrap && "whitespace-nowrap",
                      subtitleBelow && "flex flex-col",
                      titleClassName
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                      {title && (
                        <motion.div
                          key={title + currentStep}
                          custom={direction}
                          variants={motionDivVariants}
                          initial={motionDivVariants ? "enter" : hasAnimated ? { opacity: 0, x: direction * 20 } : { opacity: 1, x: 0 }}
                          animate={motionDivVariants ? "center" : { opacity: 1, x: 0 }}
                          exit={motionDivVariants ? "exit" : { opacity: 0, x: direction * 20 }}
                          transition={{
                            x: { type: "tween", duration: 0.2 },
                            opacity: { duration: 0.2 },
                          }}
                          className="w-full text-center"
                        >
                          <h2>{title}</h2>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {subtitle && (
                      <p className={cn(" text-sm font-medium text-gray-400", subtitleBelow ? "px-0 pt-3 text-center leading-normal md:px-8" : "truncate")}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
                {numSteps && <ProgressDots quantity={numSteps} current={currentStep} className="mb-1.5 py-5" />}
                {children}
              </motion.div>
            ) : (
              <motion.div
                key="back"
                className="backface-hidden w-full h-full"
                initial={false}
                //animate={hasAnimated ? contentVariants.back : false}
                exit={hasAnimated ? { opacity: 0 } : undefined}
                style={{
                  backfaceVisibility: "visible",
                  transform: "rotateY(180deg)",
                }}
              >
                {alternateJSX}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </>
    );
  }
);

ModalLayout.displayName = "ModalLayout";
