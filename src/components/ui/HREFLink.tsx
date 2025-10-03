import React, { forwardRef, useEffect, useRef, useState } from "react";
import { HoverCardSimple } from "./HoverCardSimple";
import { Link } from '../../components/ui/Link';
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const linkVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
      slim: "h-[36px] flex items-center justify-start m-0",
    },
  },
});

export interface HREFLinkProps extends VariantProps<typeof linkVariants> {
  newTab?: boolean;
  url: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: any) => void;
  hidden?: boolean;
}
export const HREFLink = forwardRef<HTMLDivElement, HREFLinkProps>(({ newTab, url = "", className, children, onClick, hidden, variant, size }, ref) => {
  return (
    <Link href={url} target={newTab ? "_blank" : "_self"} rel={newTab ? "noopener noreferrer" : ""} onClick={onClick} hidden={hidden}>
      <HoverCardSimple className={cn(linkVariants({ variant, size }), className)}>{children ?? "Link"}</HoverCardSimple>
    </Link>
  );
});
HREFLink.displayName = "HREFLink";
