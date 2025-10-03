"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, forwardRef, FC } from "react";
import QRCodeStyling, { FileExtension, Options as QRCodeStylingOptions } from "qr-code-styling";
import { Input } from "../inputs/Input";
import { Button } from "../ui/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { LineSpacer } from "../ui/LineSpacer";
import { replaceString } from '../../utils/stringManipulation';
import { wait } from '../../utils/timers';

interface StyledQRDownloaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

//Example image source: https://lh3.googleusercontent.com/drive-viewer/AKGpihaliV403LdZDxJ0SPsJKMJ4l_mKdklxBOSM2JzZ4tNScr0kOTGDyiUhHWbMzfAZ2Ttyp8v3JdppkNxgEeJkQbIOjSvHQg=w2880-h1508
// url to keep small: wleb.ca/v/XXXXXX?a=r

interface StyledQRDownloaderProps {}

const StyledQRDownloader: FC<StyledQRDownloaderProps> = ({ className, ...props }) => {
  const [url, setUrl] = useState("https://qr-code-styling.com");
  const [fileExt, setFileExt] = useState<FileExtension>("png");
  const [qRCodeImageSquare, setQRCodeImageSquare] = useState<boolean>(true);
  const [canvasHeight, setCanvasHeight] = useState<number>(700);
  const [canvasWidth, setCanvasWidth] = useState<number>(700);
  const [textHeight, setTextHeight] = useState<number>(40);
  //const [textHeightPx, setTextHeightPx] = useState<number>(0);
  const [textPadding, setTextPadding] = useState<number>(6);
  const [qRCodeSize, setQRCodeSize] = useState<number>(700);
  const [vNPrefix, setVNPrefx] = useState<string>("WL");
  const [vNNumber, setVNNumber] = useState<number>(0);
  const [showCanvas, setShowCanvas] = useState(true);
  const [downloadRange, setDownloadRange] = useState(false);
  const [prefix, setPrefix] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(0);
  const [exampleRange, setExampleRange] = useState<string>("");
  const [codeReplaces, setCodeReplaces] = useState<string>("XXXXXX");
  const [exampleInsert, setExampleInsert] = useState<string>("");
  const [codeLength, setCodeLength] = useState<number>(6);
  const [showCodeBelow, setShowCodeBelow] = useState<boolean>(true);
  const [showImage, setShowImage] = useState<boolean>(true);
  const [imageURL, setImageURL] = useState(
    "https://lh3.googleusercontent.com/drive-viewer/AKGpihaliV403LdZDxJ0SPsJKMJ4l_mKdklxBOSM2JzZ4tNScr0kOTGDyiUhHWbMzfAZ2Ttyp8v3JdppkNxgEeJkQbIOjSvHQg=w2880-h1508"
  );

  const qrOptions: QRCodeStylingOptions = {
    height: 700,
    width: 700,
    image: showImage ? imageURL : "",
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
      imageSize: 0.5,
    },
    dotsOptions: {
      color: "#000000",
      type: "rounded",
    },
    cornersSquareOptions: {
      type: "extra-rounded",
    },
    cornersDotOptions: {
      type: "dot",
    },
  };

  const useQRCodeStyling = (options: QRCodeStylingOptions): QRCodeStyling | null => {
    //Only do this on the client
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCodeStylingLib = require("qr-code-styling");
      const qrCodeStyling: QRCodeStyling = new QRCodeStylingLib(options);
      return qrCodeStyling;
    }
    return null;
  };

  const qRCodeDivRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const qrCode = useQRCodeStyling(qrOptions);

  const getFormattedVCode = (number: number = vNNumber): string => {
    return `${prefix}${number.toString().padStart(codeLength - prefix.length, "0")}`;
  };

  const getFormattedURL = (number: number): string => {
    return replaceString(url, codeReplaces, getFormattedVCode(number));
  };

  //useEffect(() => {}, [vNPrefix]);

  useLayoutEffect(() => {
    if (qRCodeDivRef.current) {
      qrCode?.append(qRCodeDivRef.current);
    }
  }, [qrCode]);

  const drawOnCanvas = async (customURL?: string, code?: string, showCodeBelow = true) => {
    if (!canvasRef.current || typeof window === "undefined" || !qrCode) return;

    let newQRCodeSize = qRCodeSize;
    const textHeightPx = showCodeBelow ? (textHeight / canvasHeight) * canvasHeight : 0;

    if (qRCodeImageSquare) {
      newQRCodeSize = canvasHeight - textHeightPx;
    }

    if (qrCode && qRCodeDivRef.current) {
      qrCode.update({
        data: customURL !== undefined ? customURL : url,
        width: newQRCodeSize,
        height: newQRCodeSize,
      });
    }

    console.log("Attempting to draw on canvas with QR Code data");
    let qrCodeData: Blob | null = null;
    try {
      qrCodeData = (await qrCode.getRawData(fileExt)) as Blob;
      if (!qrCodeData) {
        console.error("QR Code data is empty");
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        console.error("Unable to get canvas context");
        return;
      }

      // Proceed with canvas drawing logic
      // ...
    } catch (error) {
      console.error("Error occurred in drawOnCanvas:", error);
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    console.log("here");
    canvasRef.current.height = canvasHeight;
    canvasRef.current.width = canvasWidth;

    // Set the background color to white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Create an image and draw it on the canvas
    const image = new Image();
    image.src = URL.createObjectURL(qrCodeData);
    console.log("here2");
    await new Promise<void>((resolve) => {
      image.onload = async () => {
        ctx.drawImage(image, (canvasWidth - newQRCodeSize) / 2, 0);
        if ("fonts" in document) {
          try {
            //Load the Inter font for the canvas text
            await document.fonts.load("10pt Inter");
          } catch (error) {
            console.error("Font loading failed", error);
          }
        }

        if (showCodeBelow) {
          // Add centered text below the QR code
          const text = `VN: ${code ?? "UNKNOWN"}`;
          ctx.font = `${textHeightPx}px Inter, sans-serif`;
          ctx.fillStyle = "black";
          const textWidth = ctx.measureText(text).width;
          const textX = (canvasWidth - textWidth) / 2; // Calculate center position
          ctx.fillText(text, textX, canvasHeight - textPadding); // Adjust text positioning as needed
        }

        resolve();
      };
    });
  };

  useLayoutEffect(() => {
    const updateQrCode = async () => {
      if (showCanvas) {
        await drawOnCanvas(getFormattedURL(rangeStart), getFormattedVCode(rangeStart), showCodeBelow);
      } else {
        if (qrCode && qRCodeDivRef.current) {
          qrCode.update({
            data: url,
            width: 500,
            height: 500,
          });
        }
      }
    };
    updateQrCode();
  }, [url, rangeStart, qRCodeImageSquare, textHeight, canvasHeight, qRCodeSize, qrCode, showCodeBelow]);

  useEffect(() => {
    if (downloadRange) {
      setExampleRange(
        `${prefix}${rangeStart.toString().padStart(codeLength - prefix.length, "0")} - ${prefix}${rangeEnd
          .toString()
          .padStart(codeLength - prefix.length, "0")}`
      );
    } else {
      setExampleRange("");
    }
  }, [prefix, rangeStart, rangeEnd, downloadRange]);

  useEffect(() => {
    setExampleInsert(getFormattedURL(rangeStart));
  }, [codeReplaces, url, prefix, rangeStart]);

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //event.preventDefault();
    setUrl(event.target.value);
  };

  const onExtensionChange = (value: any) => {
    setFileExt(value);
  };

  const onDownloadClick = async () => {
    if (typeof window === "undefined" || !canvasRef.current) return; // Add this check
    if (downloadRange) {
      onDownloadRangeClick();
      return;
    }

    // Convert canvas to Blob
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      // Download the file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `qr-code.${fileExt}`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(link.href);
    }, `image/${fileExt}`);
  };

  const onDownloadRangeClick = async () => {
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const currentUrl = getFormattedURL(i);
      const currentCode = getFormattedVCode(i);
      await drawOnCanvas(currentUrl, currentCode);

      await wait(5);

      if (canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${currentCode}.${fileExt}`;
          link.click();
        }, `image/${fileExt}`);
      }
    }
  };

  const handleSelectDownloadRange = (event: any) => {
    setDownloadRange(event.target.checked);
  };

  return (
    <div {...props} className="flex flex-col gap-y-3">
      <div className="mx-20px flex w-full items-end justify-between gap-x-3 pt-2">
        <Input id="qrCodeURL" labelAbove="Code URL" size="slim" value={url} onChange={onUrlChange} className="mr-5 w-[120px] flex-1" />
        <Select defaultValue={fileExt} onValueChange={onExtensionChange}>
          <SelectTrigger className="w-fit text-base">
            <SelectValue placeholder="Select a file extension" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>File Extension</SelectLabel>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="webp">WEBP</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" size="slim" onClick={onDownloadClick}>
          {downloadRange ? <h1>Download Several</h1> : <h1>Download QR-Code</h1>}
        </Button>
      </div>
      <div className="flex items-end gap-x-2">
        <Input
          id="ShowImage"
          otherType="checkbox"
          checked={showCodeBelow}
          onClick={(e: any) => {
            setShowImage(e.target.checked);
          }}
          className="self-auto whitespace-nowrap"
        >
          <h1>Show Image</h1>
        </Input>
        {showImage && (
          <Input
            id="ImageURL"
            labelAbove="Image URL"
            size="slim"
            value={imageURL}
            onChange={(e: any) => {
              setImageURL(e.target.value);
            }}
            className="w-full"
          />
        )}
      </div>
      <Input
        id="showCode"
        otherType="checkbox"
        checked={showCodeBelow}
        onClick={(e: any) => {
          setShowCodeBelow(e.target.checked);
        }}
        className="self-auto"
      >
        <h1>Show Code Below</h1>
      </Input>
      <Input id="downloadRange" otherType="checkbox" onClick={handleSelectDownloadRange} className="self-auto">
        <h1>Download Range</h1>
      </Input>
      {downloadRange && (
        <div>
          <Input
            id="prefix"
            labelAbove="Prefix"
            size="slim"
            className="w-[120px]"
            onChange={(e: any) => {
              setPrefix(e.target.value);
            }}
          ></Input>
          <div className="flex items-center gap-x-2">
            <Input
              id="rangeStart"
              labelAbove="Range Start"
              size="slim"
              className="w-[120px]"
              onChange={(e: any) => {
                setRangeStart(Number(e.target.value));
              }}
            />
            <div className="pt-5">-</div>
            <Input
              id="rangeEnd"
              labelAbove="Range End"
              size="slim"
              className="w-[120px]"
              onChange={(e: any) => {
                setRangeEnd(Number(e.target.value));
              }}
            />

            <p>{exampleRange}</p>
          </div>
          <div className="flex items-center gap-x-2">
            <Input
              id="InsertAt"
              labelAbove="Insert At"
              size="slim"
              className="w-[120px]"
              value={codeReplaces}
              onChange={(e: any) => {
                setCodeReplaces(e.target.value);
              }}
              placeholder="XXXXXX"
            />
            <p>{exampleInsert}</p>
          </div>
        </div>
      )}
      <div className="w-fit rounded-md border border-border p-1 shadow-md">
        <canvas hidden={!showCanvas} ref={canvasRef} width={canvasWidth} height={canvasHeight} />
        <div hidden={showCanvas} ref={qRCodeDivRef} />
      </div>
    </div>
  );
};

StyledQRDownloader.displayName = "StyledQRDownloader";
export default StyledQRDownloader;
