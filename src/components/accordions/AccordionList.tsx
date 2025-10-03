import React, { useEffect, useState, useRef } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ScrollArea } from "../ui/ScrollArea";
import { Button } from "../ui/Button";

const AccordionListVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface AccordionListObject {
  id: string;
  title: string;
  content: string;
}

interface AccordionListProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof AccordionListVariants> {
  className?: string;
  items: AccordionListObject[];
  sideMenuPosition?: "left" | "right" | "none";
  accordionItemClassName?: string;
  contentClassName?: string;
}

export const AccordionList = forwardRef<HTMLDivElement, AccordionListProps>(
  ({ className, contentClassName, variant, size, items, sideMenuPosition = "none", accordionItemClassName, ...props }, ref) => {
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [autoOpenItems, setAutoOpenItems] = useState<string[]>([]);
    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle URL hash changes
    useEffect(() => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setOpenIds([hash]);
        setTimeout(() => {
          scrollToItem(hash);
        }, 350);
      }
    }, []);

    // Update URL when open items change
    useEffect(() => {
      if (openIds.length > 0) {
        window.history.replaceState(null, "", `#${openIds[0]}`);
      } else {
        window.history.replaceState(null, "", "#");
      }
    }, [openIds]);

    // Check content height and auto-open if needed
    useEffect(() => {
      const checkContentHeights = () => {
        const newAutoOpenItems: string[] = [];
        items.forEach((item) => {
          const content = contentRefs.current[item.id];
          if (content) {
            const lineHeight = parseInt(window.getComputedStyle(content).lineHeight);
            const height = content.scrollHeight;
            if (height <= lineHeight * 2) {
              newAutoOpenItems.push(item.id);
            }
          }
        });
        setAutoOpenItems(newAutoOpenItems);
      };

      checkContentHeights();
      window.addEventListener("resize", checkContentHeights);
      return () => window.removeEventListener("resize", checkContentHeights);
    }, [items]);

    const scrollToItem = (id: string) => {
      const element = contentRefs.current[id];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        // Adjust scroll position by 50px to account for header space
        window.scrollBy(0, -50);
      }
    };

    const handleMenuClick = (id: string) => {
      setOpenIds([id]);
      scrollToItem(id);
    };

    const handleAccordionChange = (values: string[]) => {
      setOpenIds(values);
    };

    const Menu = () => (
      <div ref={menuRef} className="w-48 flex-shrink-0 border-r border-gray-200 pr-4">
        <ScrollArea className="h-full">
          <div className="space-y-0.5">
            {items.map((item) => (
              <Button
                variant="ghost"
                size="tight"
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full text-left py-0.5 text-sm rounded hover:bg-faintGray transition-colors",
                  openIds.includes(item.id) && "bg-faintPurple font-medium"
                )}
                innerClassName="justify-start whitespace-break-spaces"
              >
                {item.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );

    return (
      <div className={cn("flex gap-4", className)} ref={ref} {...props}>
        {sideMenuPosition !== "none" && <Menu />}
        <div className="flex-1">
          <Accordion type="multiple" value={openIds} onValueChange={handleAccordionChange} className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className={cn("border-b", accordionItemClassName)}>
                <AccordionTrigger className="text-left" rotateChevron={openIds.includes(item.id)}>
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className={cn("", contentClassName)}>
                  <div
                    ref={(el) => {
                      contentRefs.current[item.id] = el;
                    }}
                  >
                    {item.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {sideMenuPosition === "right" && <Menu />}
      </div>
    );
  }
);

AccordionList.displayName = "AccordionList";
