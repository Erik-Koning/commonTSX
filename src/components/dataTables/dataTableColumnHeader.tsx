import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";

import { Column } from "@tanstack/react-table";

import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import React, { useEffect, useLayoutEffect, useRef } from "react";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
  clickOpensMenuFirst?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  clickOpensMenuFirst = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  const contentBoxRef = React.useRef<HTMLDivElement>(null);
  const triggerBoxRef = React.useRef<HTMLButtonElement>(null);

  /*
	useUserUnengaged(
		[contentBoxRef, triggerBoxRef],
		() => {
			setOpen(false);
		},
		500
	);
	*/

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  let closeMenuTimeout: NodeJS.Timeout | undefined;

  const handleMouseLeave = () => {
    if (closeMenuTimeout) {
      clearTimeout(closeMenuTimeout);
    }
    closeMenuTimeout = setTimeout(() => {
      setOpen(false);
    }, 700);
  };

  const handleMouseEnter = () => {
    if (closeMenuTimeout) {
      clearTimeout(closeMenuTimeout);
    }
  };

  return (
    <div
      className={cn("flex items-center space-x-2 font-medium text-secondary-dark transition-all duration-240", className)}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <DropdownMenu modal={false} open={open}>
        <DropdownMenuTrigger asChild ref={triggerBoxRef}>
          <Button
            className={cn("m-0 self-center px-2 py-1.5", className)}
            variant="ghost"
            size="fit"
            onClick={(e: any) => {
              e.stopPropagation();
              if (!open) {
                setOpen(true);
                if (clickOpensMenuFirst) return;
              }
              console.log("column.getIsSorted()", column.getIsSorted());
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
                setOpen(false);
                return;
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            <span>{title}</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUpwardOutlinedIcon sx={{ fontSize: 14 }} />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDownwardOutlinedIcon sx={{ fontSize: 14 }} />
            ) : (
              <UnfoldMoreOutlinedIcon sx={{ fontSize: 14 }} className="opacity-[55%]" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" ref={contentBoxRef} onMouseOver={() => {}}>
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
