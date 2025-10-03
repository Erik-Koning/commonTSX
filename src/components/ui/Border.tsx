import React, { forwardRef, useState, useEffect } from "react";
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from "class-variance-authority";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const BorderVariants = cva("", {
  variants: {
    h: {
      1: "text-3xl text-darkBlue pt-12 pb-6 font-medium",
      2: "py-4",
      3: "py-6",
      4: "",
      5: "text-base font-medium",
    },
  },
  defaultVariants: {
    h: 5,
  },
});

export interface BorderProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof BorderVariants> {
  key?: string;
  className?: string;
  hideBorder?: boolean;
  onToggleHandler?: (toggled: boolean) => void;
  markSelected?: boolean;
}

export const Border = forwardRef<HTMLDivElement, BorderProps>(({ key, onToggleHandler, markSelected, className, hideBorder = false, ...props }, ref) => {
  const [selected, setSelected] = useState(false);

  const handleBorderClick = (e: any) => {
    onToggleHandler && onToggleHandler(!selected);
    setSelected(!selected);
  };

  return (
    <div
      key={key}
      onClick={handleBorderClick}
      className={cn(
        "border-1 relative w-fit rounded-md border border-border hover:border-tertiary-dark",
        { "border-none p-[1px]": hideBorder },
        { "hover:cursor-pointer hover:shadow-lg": onToggleHandler },
        { "outline outline-[3px] outline-purple ": selected },
        className
      )}
      {...props}
    >
      {props.children}
      {markSelected && selected && (
        <div className="absolute right-[-16px] top-[-18px] rounded-full bg-white p-[1px] opacity-100 outline outline-[2px] outline-purple">
          <CheckRoundedIcon className="p-[1px] text-purple opacity-100" />
        </div>
      )}
    </div>
  );
});

Border.displayName = "Border";
