import React, { useEffect, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { CloudOffOutlined, FilterDramaOutlined, CloudDoneOutlined, AutorenewOutlined } from "@mui/icons-material";
import { Loader2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { useDispatch } from "react-redux";
import { getHumanFriendlyDateDifference } from '../../utils/getHumanFriendlyDateDifference';
import { Button } from "./Button";
import { cn } from '../../lib/utils';

export const CloudStateIndicator = () => {
  const dispatch = useDispatch(); // Get the dispatch function
  const globCloudState = useSelector((state: { cloud: any }) => state.cloud, shallowEqual); // Access loading state

  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Shake effect every 5 seconds when cloudState is -2
    if (globCloudState.cloudState === -2) {
      const interval = setInterval(() => {
        setIsShaking((prevIsShaking) => !prevIsShaking);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsShaking(false);
    }
  }, [globCloudState.cloudState]);

  const renderIcon = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <FilterDramaOutlined className={`text-red-500 ${isShaking ? "animate-shake" : ""}`} fontSize="inherit" />;
      case -1:
        return <CloudOffOutlined className="text-red-500" fontSize="inherit" />;
      case 0:
        return <FilterDramaOutlined sx={{ fontSize: 25 }} className="text-[20px] text-secondary-dark" fontSize="inherit" />;
      case 1:
        return (
          <div className="relative text-secondary-dark">
            <FilterDramaOutlined sx={{ fontSize: 25 }} className="" fontSize="inherit" />
            <div className="absolute right-[6px] top-[22px] h-[14px] w-[14px] items-center justify-center rounded-full bg-background text-[14px]">
              <AutorenewOutlined className="absolute animate-spin rounded-full" fontSize="inherit" />
            </div>
          </div>
        );
      case 2:
        return <CloudDoneOutlined sx={{ fontSize: 25 }} className="mb-[2px] text-green" fontSize="inherit" />;
    }
  };

  const getStatusBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return (
          <div className="text-red-500">
            <p>Server Error</p>
          </div>
        );
      case -1:
        return <div className="text-red-500">No Internet Connection</div>;
      case 0:
        return undefined;
      case 1:
        return (
          <div className="text-green">
            <p>Auto-Saving...</p>
          </div>
        );
      case 2:
        return (
          <div className="text-purple">
            <p>Autosaved</p>
          </div>
        );
    }
  };

  const getTitleBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <span className="text-red-500">Server Error</span>;
      case -1:
        return <span className="text-red-500">No Internet Connection</span>;
      case 0:
        return <span className="text-gray-400">Autosave is active</span>;
      case 1:
        return <span>Autosaving...</span>;
      case 2:
        return <span className="text-green">Autosaved</span>;
    }
  };

  const getSubTitleBasedOnCloudState = () => {
    switch (globCloudState.cloudState) {
      case -2:
        return <span className="">Something went wrong</span>;
      case -1:
        return <span className="">Please ask your internet admin</span>;
      case 0:
        return (
          <div>
            <div className="">
              {globCloudState.lastSaved ? getHumanFriendlyDateDifference(globCloudState.lastSaved) + "ago" : "Ready to make changes"}{" "}
            </div>
          </div>
        );
      case 1:
        return <span>{process.env.NEXT_PUBLIC_APP_TITLE} automatically saves as you type and stays synced across devices.</span>;
      case 2:
        return <span className="">{process.env.NEXT_PUBLIC_APP_TITLE} automatically saves as you type and stays synced across devices.</span>;
    }
  };

  return (
    <HoverCard openDelay={800}>
      <HoverCardTrigger asChild>
        <div className="flex items-center justify-center p-[10px]">
          <div
            className={cn(
              { "mr-3 pt-1": getStatusBasedOnCloudState() !== undefined },
              "h-fit w-fit whitespace-nowrap text-center text-base font-normal md:block [@media(min-width:560px)]:block"
            )}
          >
            {getStatusBasedOnCloudState()}
          </div>
          <div className="w-fit text-[27px]">{renderIcon()}</div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit max-w-[350px]">
        <div className="space-y-1">
          <h4 className="text-md font-medium">{getTitleBasedOnCloudState()}</h4>
          <div className="text-sm font-normal">{getSubTitleBasedOnCloudState()}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
