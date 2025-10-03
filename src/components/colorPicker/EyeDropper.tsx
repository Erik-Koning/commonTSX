import { FC, useState } from "react";
import { Button } from "../ui/Button";

import ColorizeOutlinedIcon from "@mui/icons-material/ColorizeOutlined";
import { cn } from '../../lib/utils';

interface EyeDropperProps {
  showPickedColor?: boolean;
  className?: string;
  buttonClassNames?: string;
  iconSize?: number;
  onColorPick?: (color: string) => void;
}

declare global {
  interface Window {
    EyeDropper: any;
  }
}

const EyeDropper: FC<EyeDropperProps> = ({ showPickedColor = true, className, buttonClassNames, iconSize = 18, onColorPick }) => {
  const [color, setColor] = useState<string | null>(null); // Default color

  const handleColorPick = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result) {
          setColor(result.sRGBHex);
          onColorPick && onColorPick(result.sRGBHex);
        }
      } catch (error) {
        console.error("EyeDropper API failed", error);
        //toast.error("Your Browsers EyeDropper API Failed");
      }
    } else {
      console.error("EyeDropper API is not supported in your browser.");
    }
  };

  return (
    <div
      style={{
        outline: showPickedColor ? "1px solid" : undefined,
        outlineColor: color ? "hsl(var(--border))" : "transparent",
      }}
      className={cn("flex w-full items-center justify-center gap-x-2 rounded-md", className)}
    >
      {showPickedColor && color !== null && (
        <div className="w-full">
          <div className="text-center">
            <span className="" style={{ color }}>
              {color}
            </span>
          </div>
        </div>
      )}
      <Button variant="ghost" className={cn("rounded-md p-1.5", buttonClassNames)} onClick={handleColorPick}>
        <ColorizeOutlinedIcon sx={{ fontSize: iconSize }} />
      </Button>
    </div>
  );
};

export default EyeDropper;
