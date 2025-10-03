"use client";

import React, { forwardRef, useCallback, useEffect, useState } from "react";

import { cn } from '../../lib/utils';
import axios, { AxiosProgressEvent, CancelTokenSource } from "axios";
import { File, FileAudio, FileImage, FolderArchive, UploadCloud, Video, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import ProgressBar from "../ui/Progress";
import { ScrollArea } from "../ui/ScrollArea";

import { addQuotesToKeysParseMethod, formatObjectLiteralStringToJSON } from '../../utils/fileParsing';
import { parseNestedFields } from "@common/components/formGenerator/formatGeneratorData";
import { JSONCodeMirror } from "@common/components/jsonCodeMirror/JSONCodeMirror";
import { text } from "stream/consumers";
import RevealHidden from "@common/components/ui/RevealHidden";
import { toast } from "../ui/sonner";

export interface FileUploadProgress {
  id: string;
  progress: number;
  file: File;
  source: CancelTokenSource | null;
  text: string;
}

enum FileTypes {
  Image = "image",
  Pdf = "pdf",
  Audio = "audio",
  Video = "video",
  Other = "other",
}

const ImageColor = {
  bgColor: "bg-purple",
  fillColor: "fill-purple",
};

const PdfColor = {
  bgColor: "bg-blue-400",
  fillColor: "fill-blue",
};

const AudioColor = {
  bgColor: "bg-yellow-400",
  fillColor: "fill-yellow",
};

const VideoColor = {
  bgColor: "bg-green",
  fillColor: "fill-green",
};

const FileColor = {
  bgColor: "bg-green",
  fillColor: "fill-tertiary-dark",
};

const OtherColor = {
  bgColor: "bg-gray-400",
  fillColor: "fill-gray",
};

interface FileUploadAreaAndScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  allowFileEditor?: boolean;
  handleFile?: (file: File | Record<string, any>, fileObj?: FileUploadProgress) => Promise<Record<string, any> | undefined>;
  onUploadSuccess?: (data: Record<string, any>) => void;
  parseFor?: string[];
  url?: string;
}

export const FileUploadAreaAndScroll = forwardRef<HTMLDivElement, FileUploadAreaAndScrollProps>(
  ({ className, allowFileEditor, handleFile, onUploadSuccess, parseFor, url, ...props }, ref) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
    const [uploadedIds, setUploadedIds] = useState<string[]>([]);

    const getFileIconAndColor = (file: File) => {
      if (file.name.includes(".ts") || file.name.includes(".js") || file.name.includes(".json")) {
        return {
          icon: <File size={30} className={FileColor.fillColor} />,
          color: FileColor.bgColor,
        };
      }

      if (file.type.includes(FileTypes.Image)) {
        return {
          icon: <FileImage size={40} className={ImageColor.fillColor} />,
          color: ImageColor.bgColor,
        };
      }

      if (file.type.includes(FileTypes.Pdf)) {
        return {
          icon: <File size={40} className={PdfColor.fillColor} />,
          color: PdfColor.bgColor,
        };
      }

      if (file.type.includes(FileTypes.Audio)) {
        return {
          icon: <FileAudio size={40} className={AudioColor.fillColor} />,
          color: AudioColor.bgColor,
        };
      }

      if (file.type.includes(FileTypes.Video)) {
        return {
          icon: <Video size={40} className={VideoColor.fillColor} />,
          color: VideoColor.bgColor,
        };
      }

      return {
        icon: <FolderArchive size={40} className={OtherColor.fillColor} />,
        color: OtherColor.bgColor,
      };
    };

    // feel free to mode all these functions to separate utils
    // here is just for simplicity
    const onUploadProgress = (progressEvent: AxiosProgressEvent | number, file: File, cancelSource: CancelTokenSource) => {
      let progress: number = 0;
      if (typeof progressEvent === "number") {
        if (progressEvent === -1) {
          progress = -1;
        } else {
          progress = progressEvent;
        }
      } else if (typeof progressEvent === "object") {
        progress = Math.round((progressEvent.loaded / (progressEvent.total ?? 0)) * 100);
      }

      if (progress === 100) {
        setUploadedFiles((prevUploadedFiles) => {
          return [...prevUploadedFiles, file];
        });

        setFilesToUpload((prevUploadProgress) => {
          return prevUploadProgress.filter((item) => item.file !== file);
        });

        return;
      }

      setFilesToUpload((prevUploadProgress) => {
        return prevUploadProgress.map((item) => {
          if (item.file.name === file.name) {
            return {
              ...item,
              progress,
              source: cancelSource,
            };
          } else {
            return item;
          }
        });
      });
    };

    const uploadImageToCloudinary = async (
      formData: FormData,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
      cancelSource: CancelTokenSource
    ) => {
      return axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`, formData, {
        onUploadProgress,
        cancelToken: cancelSource.token,
      });
    };

    const removeFile = (file: File) => {
      setFilesToUpload((prevUploadProgress) => {
        return prevUploadProgress.filter((item) => item.file !== file);
      });

      setUploadedFiles((prevUploadedFiles) => {
        return prevUploadedFiles.filter((item) => item !== file);
      });
    };

    interface ContentToUpload {
      object?: Record<string, any>;
      file: File;
      fileContent: string;
      acceptedFileId?: string;
    }

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        // Initialize files with progress tracking
        const acceptedFilesProgress: FileUploadProgress[] = acceptedFiles.map((file, index) => ({
          id: String(filesToUpload.length + index + 1),
          progress: 5,
          file: file,
          source: null,
          text: "",
        }));

        // Update filesToUpload state immediately for UI feedback
        setFilesToUpload((prev) => [...prev, ...acceptedFilesProgress]);

        // Phase 1: Parse all files and collect objects to upload
        const contentToUpload: ContentToUpload[] = [];

        // Parse phase
        for (const acceptedFile of acceptedFilesProgress) {
          const fileContent = await acceptedFile.file.text();

          //JSON object to be extracted from the file
          if (parseFor?.includes("json")) {
            const matchObjects = parseNestedFields(fileContent, false, false, false, false, true, true, true);
            let templateCount = 0;

            for (const templateObjectString of matchObjects) {
              debugger;
              if (!templateObjectString) continue;

              try {
                let parsedContent: string | undefined = undefined;
                let templateObject: Record<string, any> | undefined = undefined;

                try {
                  parsedContent = addQuotesToKeysParseMethod(templateObjectString, undefined, false);
                  templateObject = JSON.parse(parsedContent) as Record<string, any>;
                } catch {
                  try {
                    templateObject = formatObjectLiteralStringToJSON(templateObjectString);
                    parsedContent = JSON.stringify(templateObject, null, 2);
                  } catch (error) {
                    //ignore garbage objects, they are not valid JSON
                    continue;
                  }
                }

                if (!parsedContent || !templateObject || !templateObject.hasOwnProperty("tabs")) continue;

                templateCount++;
                if (handleFile) {
                  const processedObject = await handleFile(templateObject, acceptedFile);
                  if (processedObject) {
                    contentToUpload.push({
                      object: processedObject,
                      file: acceptedFile.file,
                      fileContent: parsedContent,
                      acceptedFileId: acceptedFile.id + (templateCount > 1 ? `-${templateCount}` : ""),
                    });
                  }
                }
              } catch (error) {
                //This templateObjectString could not be parsed, skip it
                continue;
              }
            }
          }
        }

        //No templates were found, skip the upload
        if (contentToUpload.length === 0) {
          toast({
            title: "File Error",
            message: "No templates were found in the file(s)",
            type: "error",
          });
          return;
        }

        // Phase 2: Upload all parsed content
        const uploadPromises = contentToUpload.map(async ({ object, file, fileContent, acceptedFileId }) => {
          const cancelSource = axios.CancelToken.source();

          if (!url || !object || uploadedIds.includes(object.title)) {
            // if the object is already uploaded or the url is not set, we can skip the upload
            return onUploadProgress(-1, file, cancelSource);
          }

          try {
            const res = await axios.post(url, object, {
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                onUploadProgress(progressEvent, file, cancelSource);
              },
              cancelToken: cancelSource.token,
            });
            if (onUploadSuccess) {
              onUploadSuccess(object);
            }

            setUploadedIds((prev) => [...prev, object.title]);

            if (allowFileEditor) {
              setFilesToUpload((prev) => prev.map((item) => (item.id === acceptedFileId ? { ...item, text: fileContent } : item)));
            }
          } catch (error) {
            console.error("Upload failed:", error);
            onUploadProgress(-1, file, cancelSource);
          }
        });

        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Batch upload failed:", error);
        }
      },
      [uploadedIds, url, parseFor, handleFile, allowFileEditor, filesToUpload.length]
    );

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: {
        "application/json": [".json"],
        "text/plain": [".txt", ".ts"],
        "text/csv": [".csv"],
      },
    });

    useEffect(() => {
      console.log("filesToUpload", filesToUpload);
      console.log("uploadedFiles", uploadedFiles);
    }, [filesToUpload, uploadedFiles]);

    return (
      <div>
        <div>
          <label
            {...getRootProps()}
            className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-6 hover:bg-gray-100 "
          >
            <div className=" text-center">
              <div className=" mx-auto max-w-min rounded-md border p-2">
                <UploadCloud size={20} />
              </div>

              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Drag files</span>
              </p>
              <p className="text-xs text-gray-500">Click to upload files &#40;files should be under 10 MB &#41;</p>
            </div>
          </label>

          <input
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "hidden",
              className
            )}
            {...getInputProps()}
            id="dropzone-file"
            accept=".json,.txt,.csv,.ts, image/png, image/jpeg"
            type="file"
          />
        </div>

        {filesToUpload.length > 0 && (
          <div>
            <div className="">
              <p className="my-2 mt-6 text-sm font-medium text-muted-foreground">Files to upload</p>
              <div className="space-y-2">
                {filesToUpload.map((fileUploadProgress) => {
                  return (
                    <div key={fileUploadProgress.file.lastModified} className="">
                      <div className="rounded-lg border border-slate-100 hover:pr-0">
                        <div className="group flex justify-between gap-2 overflow-hidden ">
                          <div className="flex flex-1 items-center p-2">
                            <div className="text-white">{getFileIconAndColor(fileUploadProgress.file).icon}</div>

                            <div className="ml-2 w-full space-y-1">
                              <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground ">{fileUploadProgress.file.name.slice(0, 25)}</p>
                                {fileUploadProgress.progress < 0 ? <div></div> : <span className="text-xs">{fileUploadProgress.progress}%</span>}
                              </div>
                              <ProgressBar
                                progress={fileUploadProgress.progress < 0 ? 100 : fileUploadProgress.progress}
                                className={fileUploadProgress.progress < 0 ? "bg-red-500" : getFileIconAndColor(fileUploadProgress.file).color}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (fileUploadProgress.source) fileUploadProgress.source.cancel("Upload cancelled");
                              removeFile(fileUploadProgress.file);
                            }}
                            className="hidden cursor-pointer items-center justify-center bg-red-500 px-2 text-white transition-all group-hover:flex"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        {allowFileEditor && (
                          <RevealHidden
                            hiddenTitle="Show JSON"
                            visibleTitle="Hide JSON"
                            enableVisibleTitleClick={true}
                            className="relative max-w-[100%] overflow-x-auto"
                            buttonclassName="w-full justify-center items-center"
                            buttonVariantSize={"tight"}
                            titleClassName="text-sm"
                          >
                            <div style={{ maxWidth: "100%" }}>
                              <JSONCodeMirror json={fileUploadProgress.text} />
                            </div>
                          </RevealHidden>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div>
            <p className="my-2 mt-6 text-sm font-medium text-muted-foreground">Uploaded Files</p>
            <div className="space-y-2 pr-3">
              {uploadedFiles.map((file) => {
                return (
                  <div key={file.lastModified} className="">
                    <div className="group flex justify-between gap-2 overflow-hidden rounded-lg border border-slate-100 pr-2 transition-all hover:border-slate-300 hover:pr-0">
                      <div className="flex flex-1 items-center p-2">
                        <div className="text-white">{getFileIconAndColor(file).icon}</div>
                        <div className="ml-2 w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <p className="text-muted-foreground ">{file.name.slice(0, 25)}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file)}
                        className="hidden items-center justify-center bg-red-500 px-2 text-white transition-all group-hover:flex"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileUploadAreaAndScroll.displayName = "FileUploadAreaAndScroll";
