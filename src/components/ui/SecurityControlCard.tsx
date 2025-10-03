import React, { useState } from "react";
import { Card } from "@common/components/ui/card";
import { Heading } from "@common/components/ui/Heading";
import { FlattenedControl } from "@common/utils/securityControlsHelper";
import { Button } from "./Button";
import { cn } from "../../lib/utils";
import { CheckCircleRounded } from "@mui/icons-material";

interface SecurityControlCardProps {
  control: FlattenedControl;
  index: number;
  className?: string;
  initiallyActive?: boolean;
  checkMark?: boolean;
}

export const SecurityControlCard: React.FC<SecurityControlCardProps> = ({
  control,
  index,
  className = "",
  initiallyActive = false,
  checkMark = false,
}) => {
  // Initialize with the first standard
  const standardKeys = Object.keys(control.standards);
  const [activeStandard, setActiveStandard] = useState<string>(initiallyActive ? standardKeys[0] : "");

  //use the active standard to get the current standard, or default to the first standard
  const currentStandard = activeStandard ? control.standards[activeStandard] : control.standards[standardKeys[0]];

  return (
    <Card key={`${control.id}-card-${index}`} className={cn("shadow-none relative overflow-clip", className)}>
      {false && <div className="absolute right-0 top-0 h-full w-[4px] bg-greenEnergetic" />}
      <Heading
        subHeading={
          <div className="flex items-center gap-2 pr-2">
            {standardKeys.map((stdKey) => (
              <Button
                size={"xs"}
                variant={"ghost"}
                key={stdKey}
                onClick={() => {
                  if (standardKeys.length <= 1 || activeStandard === stdKey) {
                    setActiveStandard("");
                  } else {
                    setActiveStandard(stdKey);
                  }
                }}
                className={`px-2 py-1 rounded text-sm ${activeStandard === stdKey ? "bg-faintPurple text-primary-dark" : "bg-faintGray text-gray-500"}`}
              >
                {stdKey.replace("_", " ")}
              </Button>
            ))}
          </div>
        }
        headingContainerClassName="w-full justify-between flex-nowrap"
        headingClassName="whitespace-normal shrink"
        subHeadingClassName="text-md"
        subText={currentStandard?.description}
        subTextClassName="text-secondary-dark font-medium text-left leading-normal"
      >
        {control?.title}
      </Heading>
      {checkMark && (
        <div className="absolute flex items-start bottom-0 right-0 border-b border-l border-border/0 pl-0.5 pr-0.5 py-0.5 rounded-bl-[8px]">
          <CheckCircleRounded className="text-green opacity-100" sx={{ fontSize: 14 }} />
        </div>
      )}
    </Card>
  );
};
