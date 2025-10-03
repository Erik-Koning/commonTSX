import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from "../ui/Button";
import { Loader2 } from "lucide-react";
import { cn } from '../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Label } from "../ui/Label";
import { BaseModal } from "./BaseModal";

export interface JSXAccordionModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: string[];
  labels?: (string | null)[];
  brandHexColour?: string;
  descriptions?: string[];
  sectionOpen: number;
  showAllSections: boolean;
  disableOpeningNextSection: boolean;
  contentComponents: ReactElement[];
  abortButtonText: string;
  onCancelCallback?: () => void;
  allowCloseButton?: boolean;
  allowSelectSections?: boolean;
  setSectionOpenExt: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  accordionTitleSpanClassName?: string;
  accordionContentClassName?: string;
  accordionClassName?: string;
  innerTriggerClassName?: string;
  revealAllSkippedSections?: boolean;
}

const JSXAccordionModal: React.FC<JSXAccordionModalProps> = ({
  isOpen,
  onClose,
  titles,
  labels,
  brandHexColour,
  descriptions,
  sectionOpen,
  showAllSections,
  disableOpeningNextSection,
  contentComponents,
  abortButtonText,
  onCancelCallback,
  allowCloseButton = false,
  allowSelectSections = false,
  setSectionOpenExt,
  className,
  innerTriggerClassName,
  accordionTitleSpanClassName,
  accordionClassName,
  accordionContentClassName,
  revealAllSkippedSections = true,
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  const [accordionOpenValue, setAccordionOpenValue] = useState<string[]>([String(sectionOpen)]); //list of all the accordion sections that are currently open
  const [delayedAccordionOpenValue, setDelayedAccordionOpenValue] = useState<string[]>([String(sectionOpen)]); //list of all the accordion sections that are currently open
  const [accordionJustOpened, setAccordionJustOpened] = useState<boolean>(false); //an accordion has recently been opened
  const [revealedAccordions, setRevealedAccordions] = useState<string[]>([String(sectionOpen)]); //list of all the accordion sections that have been opened at least once

  const numAccordions = titles.length;

  useEffect(() => {
    if (showAllSections) {
      setAccordionOpenValue(Array.from(Array(numAccordions).keys()).map((num) => String(num).toString()));
    } else {
      //show all sections up to the current section open
      setAccordionOpenValue(Array.from(Array(sectionOpen + 1).keys()).map((num) => String(num).toString()));
    }
  }, [showAllSections, sectionOpen]);

  useEffect(() => {
    const newAccordionOpenValue = showAllSections
      ? Array.from(Array(numAccordions).keys()).map((num) => String(num).toString())
      : Array.from(Array(sectionOpen + 1).keys()).map((num) => String(num).toString());
    setAccordionOpenValue(newAccordionOpenValue);

    setRevealedAccordions((prev) => {
      //set to avoid adding duplicates
      const newRevealedAccordions = [...prev];

      //add the current section to the list if it is not already in the list
      if (!newRevealedAccordions.includes(String(newAccordionOpenValue))) {
        newRevealedAccordions.push(String(sectionOpen));
      }

      //loop over all the accordions, and if revealAllSkippedSections is true, add all the skipped accordions to the list
      if (revealAllSkippedSections) {
        for (let i = newAccordionOpenValue.length - 1; i >= 0; i--) {
          if (i >= numAccordions) continue;
          if (!newRevealedAccordions.includes(String(i))) {
            newRevealedAccordions.push(String(i));
          }
        }
      }
      return newRevealedAccordions;
    });
  }, [sectionOpen, showAllSections]);

  //make a delayed version of the accordionOpenValue state
  useEffect(() => {
    setTimeout(() => {
      setDelayedAccordionOpenValue(accordionOpenValue);
    }, 1);
  }, [accordionOpenValue]);

  const allowPointerDownOutside = () => {
    if (allowCloseButton) {
      onClose();
    } else {
      return;
    }
  };

  //update the visibility of each accordion
  const handleAccordionTriggerClick = (index: number) => {
    if (accordionOpenValue.includes(String(index))) {
      // If the accordion is already open, close it, and open the next one
      if (index < numAccordions - 1) {
        if (!disableOpeningNextSection) {
          //open the next one if there is one
          setSectionOpenExt(index + 1);
        } else {
          //else it is the last, open the previous one or the first one if it is the first one
          setSectionOpenExt(Math.max(0, index - 1));
        }
      } else {
        //else it is the last, open the first one
        setSectionOpenExt(0);
      }
    } else {
      // First disable the highlight dependents feature for the accordion that is about to open
      setAccordionJustOpened(true);
      // Open the accordion
      setSectionOpenExt(index);
      // timer to enable the highlight dependents feature again
      setTimeout(() => {
        setAccordionJustOpened(false);
      }, 250);
    }
  };

  //setAccordionOpenValue([String(2)]);

  //a left and right ref for each accordion trigger
  const use2DArrayOfRefs = (length: number) => {
    const refsArray = useRef(Array.from({ length }, () => [React.createRef(), React.createRef()]));
    return refsArray.current;
  };

  const refsArray = use2DArrayOfRefs(titles.length);

  return (
    /*<Dialog open={isOpen} onOpenChange={allowCloseButton ? onClose : undefined} modal>
      <DialogContent
        allowCloseButton={allowCloseButton}
        onPointerDownOutside={allowPointerDownOutside}
        className={cn(
          "max-h-[80vh] overflow-y-auto rounded-md bg-background-light px-4 py-4 shadow-lg transition-all duration-200 ease-in-out",
          className
        )}
        overlayClassName="bg-black/[45%]"
      >*/
    <BaseModal title={undefined} isOpen={isOpen} onClose={onClose} size={"tight"} className={cn("", className)} allowCloseButton={allowCloseButton}>
      <DialogHeader>{/* You can add your header here */}</DialogHeader>
      <div>
        <Accordion type="multiple" value={accordionOpenValue} className={cn("rounded-md", accordionClassName)}>
          {titles.map((title, idx) => {
            const accordionContentClassNameLocal = cn("px-3 xs:px-4 sm:px-6 md:px-8 lg:px-8");
            return (
              <AccordionItem
                hidden={revealedAccordions.includes(String(idx)) ? false : true}
                id={title + "-item-id"}
                key={title + "-item-key"}
                value={String(idx).toString()}
                className={cn(
                  "group mt-0 w-full pt-0 no-underline",
                  idx === 0 && !allowSelectSections ? "rounded-t-md" : idx < titles.length - 1 ? "" : "rounded-b-md",
                  "transition-all duration-200",
                  idx === titles.length - 1 ? "rounded-b-none" : ""
                )}
              >
                <div
                  key={titles[idx] + "-div-key"}
                  className={cn(
                    "flex w-full cursor-pointer items-center outline-2 outline-skyBlue hover:no-underline hover:outline",
                    idx === 0 && !allowSelectSections ? "rounded-t-md" : idx < titles.length - 1 ? "overflow-hidden" : "rounded-b-md",
                    "group-data-[state=open]:outline-none"
                  )}
                >
                  <AccordionTrigger
                    id={title + "-trig-id"}
                    key={title + "-trig-key"}
                    onClick={() => handleAccordionTriggerClick(idx)}
                    className={cn("w-full px-4 py-6 outline-none hover:no-underline data-[state=open]:outline-none", accordionContentClassNameLocal)}
                    chevronRef={refsArray[idx][1] as React.RefObject<HTMLDivElement>}
                  >
                    <div className={cn("flex w-full items-center", innerTriggerClassName)}>
                      <div ref={refsArray[idx][0] as React.RefObject<HTMLDivElement>} className={cn("", accordionTitleSpanClassName)}>
                        {titles[idx]}
                      </div>
                      <Label
                        text={labels ? labels[idx] : undefined}
                        variant={"purple"}
                        bgColour={brandHexColour}
                        className="rounded-md"
                        textScrollIfOverflow={true}
                        restrictSingleLine={true}
                        setMaxWidthBetweenRefs={[
                          refsArray[idx][0] as React.RefObject<HTMLDivElement>,
                          refsArray[idx][1] as React.RefObject<HTMLDivElement>,
                        ]}
                      />
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent
                  id={title + "-content-id"}
                  key={title + "-content-key"}
                  className={cn(
                    "overflow-hidden px-4 transition-opacity duration-500 ease-in-out",
                    accordionOpenValue.includes(String(idx)) ? "overflow-visible opacity-100" : "opacity-0",
                    accordionContentClassNameLocal,
                    accordionContentClassName
                  )}
                >
                  <div
                    className={cn(
                      "overflow-hidden px-[2px] pb-[2px]  transition-all delay-75 duration-300",
                      accordionOpenValue.includes(String(idx)) ? "opacity-100" : "opacity-0",
                      delayedAccordionOpenValue.includes(String(idx)) ? "overflow-visible opacity-100" : "opacity-0"
                    )}
                  >
                    {contentComponents[idx]}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <Button
        key={"AbortButton"}
        onClick={() => {
          setActionLoading(true);
          onCancelCallback && onCancelCallback();
        }}
        variant="ghost"
        size="fullLine"
        className="items-center justify-center border-none outline-none ring-transparent"
      >
        {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <div>{abortButtonText}</div>}
      </Button>
    </BaseModal>
  );
};

export { JSXAccordionModal };
