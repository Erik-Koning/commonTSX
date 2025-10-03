import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { cva, VariantProps } from "class-variance-authority";
import Image, { StaticImageData } from "next/image";
import { Link } from "../ui/Link";
import { Heading } from "../ui/Heading";

const SubProcessorVariants = cva("", {
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

interface SubProcessorProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof SubProcessorVariants> {
  className?: string;
  imageClassName?: string;
  logo: StaticImageData;
  heading: string;
  subHeading: string;
  description: string;
  link: string;
}

export const SubProcessor = forwardRef<HTMLDivElement, SubProcessorProps>(
  ({ className, variant, size, logo, heading, subHeading, description, link = "", imageClassName, ...props }, ref) => {
    return (
      <div {...props} className={cn("", SubProcessorVariants({ variant, size }), className)} ref={ref}>
        <div className="flex items-center gap-x-4">
          <Link href={link} className="appearance-none flex-shrink-0">
            <Image src={logo} alt={heading} width={40} height={40} className={cn("", imageClassName)} />
          </Link>
          <div>
            <Link href={link}>
              <Heading subHeading={subHeading}>{heading}</Heading>
            </Link>
            <p>{description}</p>
          </div>
        </div>
      </div>
    );
  }
);

SubProcessor.displayName = "SubProcessor";
