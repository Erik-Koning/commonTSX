import React, { forwardRef, useState, useEffect, useRef, useLayoutEffect } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./DropdownMenu";
import { Button, ButtonProps } from "./Button";
import { Table } from "@tanstack/react-table";
import { useUserUnengaged } from '../../hooks/useUserUnengage';
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import useMousePosition from '../../hooks/useMousePosition';
import useMouseIsClicked from '../../hooks/useMouseIsHeldDown';
import { time } from "console";
import { start } from "repl";
import useMouseIsHeldDown from '../../hooks/useMouseIsHeldDown';
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { cn } from '../../lib/utils';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';

export interface FilterTableColumnsDropdownProps extends ButtonProps {
  table: any; // table instance from react-table
  initiallyHiddenColumns?: string[]; // ids should be lowercase
  className?: string; // className for the button
  classNameButton?: string; // className for the button
}

export const FilterTableColumnsDropdown = forwardRef<HTMLDivElement, FilterTableColumnsDropdownProps>(
  ({ table, initiallyHiddenColumns = ["id"], className, classNameButton, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const [enableGetMousePosition, setEnableGetMousePosition] = useState(false);
    const dropdownDiv = useRef<HTMLDivElement>(null);
    const dropdownMenuContent = useRef<HTMLDivElement>(null);
    const sparkleContainerRef = useRef<HTMLDivElement>(null);

    const { x: mouseX, y: mouseY } = useMousePosition({ enableGetMousePosition });
    const isMouseDown = useMouseIsHeldDown(160, enableGetMousePosition);

    useLayoutEffect(() => {
      //initially hide some columns
      table.getAllColumns().forEach((column: any) => {
        ////console.log("column", column);
        if (initiallyHiddenColumns.includes(column.id)) {
          column.toggleVisibility(!column.getIsVisible());
        }
      });
    }, []);

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      ////console.log("handleUnengaged");
      setOpen(false);
      stopDraggingFuncs();
    };

    useUserUnengaged(dropdownMenuContent, handleClose, 4000, enableGetMousePosition, true, undefined, undefined);

    const startDraggingFuncs = () => {
      //console.log("startDraggingFuncs");
      setIsDragging(true);
    };

    const stopDraggingFuncs = () => {
      //console.log("stopDraggingFuncs");
      const timeout = setTimeout(() => {
        setIsDragging(false);
      }, 40);
    };

    useEffect(() => {
      if (!enableGetMousePosition) return;
      const handleMouseUp = (e: any) => {
        stopDraggingFuncs();
      };

      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging]);

    useEffect(() => {
      if (!enableGetMousePosition) return;
      //console.log("isMouseDown", isMouseDown);
      if (isMouseDown) {
        startDraggingFuncs();
      } else {
        //mouse is not down
        stopDraggingFuncs();
      }
    }, [isMouseDown]);

    useEffect(() => {
      if (open) {
        stopDraggingFuncs();
        //timeout, becuase somehow interfers with click event and open animation delays
        setTimeout(() => {
          setEnableGetMousePosition(true);
        }, 400);
      } else {
        setEnableGetMousePosition(false);
        stopDraggingFuncs();
      }
    }, [open]);

    const handleMouseEnter = (column: any) => {
      //console.log("handleMouseEnter");
      if (isDragging) {
        setHasDragged(true);
        // If dragging, invert visibility of the column the cursor has entered
        column.toggleVisibility(!column.getIsVisible());
      }
    };

    const handleMouseDown = (column: any) => {
      //console.log("handleMouseDown");
      // Start dragging
      column.toggleVisibility(!column.getIsVisible());
    };

    const handleMouseUp = (column: any) => {
      //console.log("handleMouseUp");
      // Stop dragging
      stopDraggingFuncs();
      column.toggleVisibility(!column.getIsVisible());
    };

    const handleMouseClick = (column: any) => {
      //console.log("handleMouseClick");
      // Stop dragging
      stopDraggingFuncs();
      //column.toggleVisibility(!column.getIsVisible());
    };

    return (
      <div ref={dropdownDiv} className={cn(className)}>
        {isDragging && open && (
          <div
            ref={sparkleContainerRef}
            className="pointer-events-none absolute z-[9999] flex cursor-none items-start justify-start"
            style={{
              position: "fixed",
              left: mouseX - 10,
              top: mouseY - 10,
              //transform: "translate(-50%, -50%)",
            }}
          >
            <HeightOutlinedIcon sx={{ fontSize: 20 }} className="-left-4 -top-3" />
          </div>
        )}
        <DropdownMenu
          open={open}
          onOpenChange={() => {
            handleOpen();
          }}
        >
          <DropdownMenuTrigger asChild className="" onClick={handleOpen}>
            <Button className={cn("ml-auto flex h-[42px] gap-x-[6px] text-secondary-dark", classNameButton)} {...props}>
              <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
              <p>Columns</p>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            ref={dropdownMenuContent}
            align="end"
            side="bottom"
            className={cn("mr-1", isDragging ? "custom-cursor-none cursor-none" : "")}
          >
            {table
              .getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => {
                ////console.log("column", column, "all columns", table.getAllColumns());
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onMouseDown={() => handleMouseDown(column)}
                    onMouseEnter={() => handleMouseEnter(column)}
                    onMouseUp={() => handleMouseUp(column)}
                    onClick={() => {
                      handleMouseClick(column);
                    }}
                  >
                    {camelOrSnakeToTitleCase(String(column.id))}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

FilterTableColumnsDropdown.displayName = "FilterTableColumnsDropdown";
