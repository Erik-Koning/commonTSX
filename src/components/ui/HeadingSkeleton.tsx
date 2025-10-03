import React from "react";
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from "class-variance-authority";

// Replicate headingVariants for padding - we won't replicate all text styles
const headingSkeletonVariants = cva("", {
  variants: {
    padding: {
      0: "",
      1: "p-0 pt-1.5 sm:py-3 lg:pb-6",
      2: "p-0 pt-1.5 sm:py-3 lg:py-6 xl:pt-12",
    },
    h: {
      // To adjust skeleton sizes based on heading level
      1: "h-8", // text-3xl
      2: "h-7", // text-2xl
      3: "h-6", // text-xl
      4: "h-5", // text-lg
      5: "h-5", // text-base
    },
  },
  defaultVariants: {
    padding: 0,
    h: 4,
  },
});

// Replicate subtextVariants for size approximation
const subtextSkeletonVariants = cva("", {
  variants: {
    subtextSize: {
      1: "h-5", // text-lg
      2: "h-4", // text-base
      3: "h-4", // text-base
      4: "h-4", // text-sm
      5: "h-4", // text-sm
    },
  },
  defaultVariants: {
    subtextSize: 5,
  },
});

export interface HeadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof headingSkeletonVariants> {
  className?: string;
  withSubHeading?: boolean;
  withSubText?: boolean;
  withInfo?: boolean;
  h?: 1 | 2 | 3 | 4 | 5; // Explicitly define h levels for skeleton sizing
  padding?: 0 | 1 | 2; // Explicitly define padding levels
}

export const HeadingSkeleton: React.FC<HeadingSkeletonProps> = ({
  className,
  h = 4,
  padding = 0,
  withSubHeading = true,
  withSubText = true,
  withInfo = true,
  ...props
}) => {
  const titleHeightClass = headingSkeletonVariants({ h });
  // Use h level for subtext size if not specified, mimicking original logic
  const subTextHeightClass = subtextSkeletonVariants({ subtextSize: h });

  return (
    <div className={cn(headingSkeletonVariants({ padding }), "flex flex-col gap-1.5", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {/* Title Skeleton */}
          <Skeleton className={cn("w-1/3 min-w-[120px]", titleHeightClass)} />
          {/* SubHeading Skeleton (optional) */}
          {withSubHeading && <Skeleton className="h-5 w-1/4 min-w-[80px]" />}
        </div>
        {/* Info Skeleton (optional) */}
        {withInfo && <Skeleton className="h-5 w-5 flex-shrink-0" />}
      </div>
      {/* SubText Skeleton (optional) */}
      {withSubText && <Skeleton className={cn("w-3/4", subTextHeightClass)} />}
    </div>
  );
};

HeadingSkeleton.displayName = "HeadingSkeleton";
