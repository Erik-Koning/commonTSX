import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { cn } from '../../lib/utils';
import { HelpOutlineOutlined } from "@mui/icons-material";
import { forwardRef, useEffect, useRef, useState } from "react";
import { HREFLink } from "./HREFLink";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import RevealHidden from "./RevealHidden";
import { Button } from "./Button";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";

export interface SupportButtonProps {
  open: boolean;
  expanded?: boolean;
  onClose?: () => void;
  menuItemsOutlineClass?: string;
  menuItemsClass?: string;
  handleOpenState: (open: boolean) => void;
  onHandleIssueClick: (type: "bug" | "feature" | "form") => void;
  iconSize?: number;
}

export const SupportButton = forwardRef<HTMLDivElement, SupportButtonProps>(
  ({ open, handleOpenState, expanded = true, onClose, menuItemsOutlineClass, menuItemsClass, iconSize = 26, onHandleIssueClick }, ref) => {
    const popoverDivRef = useRef<HTMLDivElement>(null);
    const [disableUnengage, setDisableUnengage] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
      if (open) {
        setPopoverOpen(true);
      } else {
        setPopoverOpen(false);
      }
    }, [open]);

    const handleUnengaged = () => {
      console.log("unengaged");
      if (disableUnengage) return;
      handleOpenState(false);
    };

    useUserUnengaged(popoverDivRef, handleUnengaged, undefined, open);

    const dispatch = useDispatch();

    const handleIssueClick = (type: "bug" | "feature" | "form") => {
      //close the popover
      handleOpenState(false);
      //open the issue modal

      onHandleIssueClick(type);
    };

    const handlePopoverChange = async (open: boolean) => {
      console.log("popover change", open);
      handleOpenState(open);
      return;
    };
    return (
      <div className={cn({ "w-full": expanded }, "relative")}>
        <Popover open={popoverOpen} onOpenChange={handlePopoverChange}>
          <PopoverTrigger
            className="flex w-full"
            onClick={(e: any) => {
              handleOpenState(true);
              setDisableUnengage(true);
            }}
          >
            <div className={cn("", menuItemsOutlineClass, "w-full")}>
              <HelpOutlineOutlined sx={{ fontSize: iconSize }} />
              {expanded && <div className={menuItemsClass}>Help</div>}
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            className="mx-2 mt-4 h-fit w-[350px] bg-background-light px-2 py-1"
            ref={popoverDivRef}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseOver={() => {
              setDisableUnengage(true);
            }}
            onMouseLeave={() => {
              setDisableUnengage(false);
            }}
          >
            <div className="m-2 flex flex-col gap-y-1.5">
              <h1 className="text-lg font-base">Something not working right?</h1>
              <Button
                className="hover:border-primary-dark border border-border"
                variant="ghostBorder"
                size={"slim"}
                onClick={() => handleIssueClick("bug")}
              >
                <span className="w-full text-left text-primary-dark">Report a bug</span>
              </Button>
              <Button
                className="hover:border-primary-dark border border-border"
                variant="ghostBorder"
                size={"slim"}
                onClick={() => handleIssueClick("feature")}
              >
                <span className="w-full text-left text-primary-dark">Suggest Feature</span>
              </Button>
              {pathname.includes("/entries") && (
                <Button
                  className="hover:border-primary-dark border border-border"
                  variant="ghostBorder"
                  size={"slim"}
                  onClick={() => handleIssueClick("form")}
                >
                  <span className="w-full text-left text-primary-dark">Form Content</span>
                </Button>
              )}
              <HREFLink
                newTab={true}
                url={`https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/faq`}
                className="hover:border-skyBlue"
                hidden={true}
                size="slim"
              >
                Check the FAQ
              </HREFLink>
              <RevealHidden
                buttonclassName="w-full items-center"
                visibleClassName="flex flex-col gap-y-1"
                visibleTitle="Less"
                hiddenTitle="Urgent?"
                enableVisibleTitleClick={true}
                oneTimeHide={true}
                hideIcon={true}
                isOpen={true}
              >
                <div className="flex flex-col gap-y-1.5">
                  <HREFLink newTab={true} url={`mailto:support@${process.env.NEXT_PUBLIC_APP_DOMAIN_NAME}`} className="hover:border-skyBlue" size="slim">
                    Email us
                  </HREFLink>
                  <HREFLink newTab={true} url="tel:+16132420837" className="hover:border-skyBlue" size="slim">
                    Call us
                  </HREFLink>
                </div>
              </RevealHidden>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
SupportButton.displayName = "SupportButton";
