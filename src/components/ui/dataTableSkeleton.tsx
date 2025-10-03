//Skeleton for FormUIGenerator

import React from "react";
import { Skeleton } from '../../components/ui/skeleton'; // Import your Skeleton component
import useWindowSize from '../../hooks/useWindowSize';
import { cn } from '../../lib/utils';

interface DataTableSkeletonProps {
  manualRowCount?: number; // Optional prop for manually setting the number of rows
  className?: string; // Optional prop for adding a class name
}

export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({ manualRowCount, className, ...props }) => {
  const enableWindowSize = manualRowCount === undefined; // Enable window size hook if manualRowCount is undefined
  const windowSize = useWindowSize(enableWindowSize);
  const innerHeight = windowSize?.innerHeight;

  // Determine the number of rows based on window height
  const rowHeight = 200; // Example height for each row
  const numberOfRows = innerHeight ? Math.floor(innerHeight / rowHeight) : 4;

  return (
    <div className={cn("flex w-full flex-col gap-4 p-4", className)}>
      {Array.from({ length: enableWindowSize ? numberOfRows : manualRowCount }, (_, rowIndex) => (
        <div className="flex h-[100px] gap-10" key={rowIndex}>
          {[0, 1].map((colIndex) => (
            <div className="flex w-1/2 flex-col gap-2" key={colIndex}>
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-full rounded-md" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
