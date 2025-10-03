import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { hexColorValidation } from '../../lib/validations/reactHookFormValidations';
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { Input } from "../inputs/Input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import "./styles.css";
import EyeDropper from "./EyeDropper";
import { cn } from '../../lib/utils';
import { SwatchBlock } from "./SwatchBlock";
import { ensureStringHasSubstringAtIndex } from '../../utils/stringManipulation';
import { FieldValues, UseFormRegister } from "react-hook-form";
import throttle from "lodash/throttle";
import { LabelAbove } from "../ui/LabelAbove";
import { colourToHex, generateRandomHexColor } from '../../utils/colour';
import { getCSSVariable } from '../../utils/styles';

interface ColorPickerProps {
  id: string;
  colorLabels?: Record<string, any>;
  processBeforeOnChangeCall?: (color: string) => string;
  labelAbove?: string;
  defaultColor?: string;
  presetColors?: string[];
  numberOfSamples?: number;
  register?: UseFormRegister<FieldValues>;
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ id, labelAbove, processBeforeOnChangeCall, register, colorLabels, defaultColor, presetColors = [], numberOfSamples = 11, ...props }, ref) => {
    const popover = useRef<HTMLDivElement>(null);
    const [isOpen, toggle] = useState(false);
    const [enableUnengage, setEnableUnengage] = useState(false);
    const [color, setColor] = useState(defaultColor ?? colourToHex(getCSSVariable("--purple")));
    const [presetColorsProcessed, setPresetColorsProcessed] = useState<string[]>(presetColors);

    useEffect(() => {
      const colorLabelValues = Object.values(colorLabels || {});
      const uniquePresetColors = [...new Set(presetColors)]; // Remove duplicates
      const filteredPresetColors = uniquePresetColors.filter((presetColor) => !colorLabelValues.includes(presetColor));

      // Fill the rest with random colors if needed
      const processedColors =
        filteredPresetColors.length >= numberOfSamples
          ? filteredPresetColors.slice(0, numberOfSamples)
          : [...filteredPresetColors, ...Array.from({ length: numberOfSamples - filteredPresetColors.length }, generateRandomHexColor)];
      throttle((processedColors: string[]) => {
        setPresetColorsProcessed(processedColors);
      }, 100);
    }, [presetColors, colorLabels, numberOfSamples]);

    const regenerateMutedColors = () => {
      const newColors = Array.from({ length: numberOfSamples }, () => generateRandomHexColor("muted"));
      setPresetColorsProcessed(newColors);
    };

    //console.log("colorLabels", colorLabels);

    const close = useCallback(() => {
      //console.log("close");
      toggle(false);
    }, []);

    useUserUnengaged(popover, close, 5000, enableUnengage);

    const handleOpenPicker = (open: boolean = true) => {
      if (!isOpen && open) {
        regenerateMutedColors();
      }
      toggle(open);
      setTimeout(() => {
        setEnableUnengage(open);
      }, 200);
    };

    const swatchSize = 30; // Height and width of each swatch
    const gap = 8; // Gap between swatches
    const swatchesPerRow = 4;

    // Calculate the maximum width for 4 swatches including the gap
    const maxSwatchContainerWidth = swatchSize * swatchesPerRow + gap * swatchesPerRow;

    const orderedSwatches = [...presetColorsProcessed].reverse(); // Reverse the array for bottom-up display

    // Calculate the number of rows needed
    const numRows = Math.ceil(presetColorsProcessed.length / swatchesPerRow);

    // Function to calculate grid row and column for each swatch
    const getGridPosition = (index: number) => {
      const row = numRows - Math.floor(index / swatchesPerRow);
      const col = swatchesPerRow - (index % swatchesPerRow);
      return { row, col };
    };

    const handleOnChange = (newColor: string) => {
      //console.log("newColor", newColor);
      newColor = newColor.toUpperCase();
      newColor = ensureStringHasSubstringAtIndex(newColor, "#", 0);
      setColor(newColor);
    };

    return (
      <Popover open={isOpen} onOpenChange={() => {}}>
        <PopoverTrigger
          onClick={(e: any) => {
            handleOpenPicker(!isOpen);
          }}
          className="w-full"
        >
          <LabelAbove label={labelAbove} />
          <div className="flex items-start gap-x-3 text-secondary-dark w-full">
            <SwatchBlock color={color} className="h-[30px] min-w-[30px]" />
            <Input
              id={id}
              processBeforeOnChangeCall={processBeforeOnChangeCall}
              register={register}
              size="slim"
              //width="full"
              className="w-full"
              value={color}
              onClick={(e: any) => {
                handleOpenPicker(true);
              }}
              onChange={(e: any) => {
                handleOnChange(e.target.value);
              }}
              maxLength={7}
              makeUpperCase={true}
              validationSchema={hexColorValidation}
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent sideOffset={6} className="h-fit w-fit overflow-visible rounded-xl bg-none pb-4 shadow-lg">
          <div ref={popover} className="flex gap-x-4 bg-transparent">
            <HexColorPicker className="custom-layout min-h-[200px] min-w-[250px]" color={color} onChange={handleOnChange} />
            <div className="flex flex-col justify-between">
              <div className="flex flex-col gap-y-[2px]">
                {/* colorLabels is an object so get entries and map through each key,value */}
                {colorLabels &&
                  Object.entries(colorLabels).map(([key, value], index) => {
                    return (
                      <div className="flex gap-x-2" key={index}>
                        <SwatchBlock
                          color={value}
                          onClick={() => setColor(value)}
                          className="m-0 h-[30px] w-[30px] cursor-pointer rounded-md outline-0 hover:outline-1"
                          style={{ backgroundColor: value }}
                        />
                        <p className="flex items-center text-secondary-dark">{key}</p>
                      </div>
                    );
                  })}
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${swatchesPerRow}, 30px)`, gap: "4px" }}>
                {/* Place the EyeDropper in the first position */}
                <SwatchBlock
                  color="#FFFFFF"
                  key="eyedropper-0"
                  className="m-0 flex h-fit w-fit cursor-pointer rounded-md p-0"
                  style={{ gridColumnStart: swatchesPerRow, gridRowStart: numRows }} // Place it in the bottom right position
                >
                  <EyeDropper
                    onColorPick={(pickedColor) => {
                      setColor(pickedColor);
                    }}
                    iconSize={24}
                    showPickedColor={false}
                    className="justify-start"
                    buttonClassNames="h-[30px] w-[30px] text-secondary-dark"
                  />
                </SwatchBlock>

                {/* Iterate through the swatches starting from index 0 */}
                {orderedSwatches.map((presetColor, index) => {
                  // Adjust the grid position, considering the EyeDropper has taken the first spot
                  const { row, col } = getGridPosition(index + 1);

                  return (
                    <SwatchBlock
                      color={presetColor}
                      key={`${presetColor}-${index + 1}`}
                      onClick={() => setColor(presetColor)}
                      className="m-0 h-[30px] w-[30px] cursor-pointer rounded-md outline-0 hover:outline-1"
                      style={{
                        backgroundColor: presetColor,
                        gridColumnStart: col,
                        gridRowStart: row,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

ColorPicker.displayName = "ColorPicker";
