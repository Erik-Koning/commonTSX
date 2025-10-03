import { CustomDialogContentProps, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import React, { useEffect, useRef, useState } from "react";
import { ModalLayout, ModalSizeVariantProps, modalSizeVariants } from "./ModalLayout";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BaseModal, BaseModalProps } from "./BaseModal";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";

export interface ModalSteppedProps extends BaseModalProps {
  baseModalProps?: BaseModalProps;
  steps: string[];
  currentStep: number;
  finalStepNextText?: string;
  onFinalStepNext?: () => void;
  onNavPrev: () => void;
  onNavNext: () => void;
  jsxSteps: React.ReactNode[];
  disableNextButton?: boolean;
  children?: React.ReactNode;
}

const variants = {
  enter: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
};

const ModalStepped: React.FC<ModalSteppedProps> = ({
  baseModalProps,
  steps,
  jsxSteps,
  currentStep,
  onNavPrev,
  onNavNext,
  disableNextButton,
  children,
  finalStepNextText,
  onFinalStepNext,
  isLoading,
  ...props
}) => {
  const prevCurrentStep = useRef(currentStep);

  useEffect(() => {
    prevCurrentStep.current = currentStep;
  }, [currentStep]);

  //If direction is right, animate out to the left
  const direction = currentStep > prevCurrentStep.current ? -1 : 1;

  return (
    <BaseModal {...baseModalProps} className={cn("!p-0", baseModalProps?.className)}>
      <ModalLayout
        motionDivProps={{ variants: variants }}
        title={steps[currentStep]}
        numSteps={steps.length}
        currentStep={currentStep + 1}
        className="transition-all"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.2 },
              opacity: { duration: 0.2 },
            }}
          >
            {jsxSteps[currentStep]}
            {children}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col justify-between mt-4">
          <Button
            className={cn(currentStep === 0 && "mb-4")}
            onClick={onFinalStepNext && currentStep === steps.length - 1 ? onFinalStepNext : onNavNext}
            variant={"purple"}
            size={"full"}
            isLoading={isLoading}
            disabled={disableNextButton}
          >
            {finalStepNextText && currentStep === steps.length - 1 ? finalStepNextText : "Next"}
          </Button>

          <AnimatePresence mode="sync" initial={false}>
            {currentStep > 0 && (
              <motion.div
                key={"back button"}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.2 },
                  opacity: { duration: 0.2 },
                }}
                className="flex justify-center"
              >
                <Button onClick={onNavPrev} variant={"blueLink"} size={undefined}>
                  Back
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ModalLayout>
    </BaseModal>
  );
};

ModalStepped.displayName = "ModalStepped";

export { ModalStepped };
