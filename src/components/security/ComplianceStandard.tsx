import React from "react";
import { cn } from '../../lib/utils';
import Image, { StaticImageData } from "next/image";

interface ComplianceStandardProps {
  standard: string;
  className?: string;
  logo?: StaticImageData;
}

export const ComplianceStandard: React.FC<ComplianceStandardProps> = ({ standard, className, logo }) => {
  return (
    <div className={cn("flex items-center gap-2 mt-3", className)}>
      {logo ? (
        <div className="w-9 h-9 flex-shrink-0 rounded-full">
          <Image src={logo} alt={standard} width={36} height={36} />
        </div>
      ) : (
        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-secondary-dark"></div>
      )}
      <span className="text-secondary-dark truncate">{standard}</span>
    </div>
  );
};

export default ComplianceStandard;
