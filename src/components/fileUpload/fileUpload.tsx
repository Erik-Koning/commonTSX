import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/Button";
import { FileUploadAreaAndScroll, FileUploadProgress } from "./fileUploadAreaAndScroll";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  handleFile?: (file: File | Record<string, any>, fileObj?: FileUploadProgress) => Promise<Record<string, any> | undefined>;
  url?: string;
  allowFileEditor?: boolean;
  parseFor?: string[];
  onUploadSuccess?: (data: Record<string, any>) => void;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({ handleFile, onUploadSuccess, url, parseFor, allowFileEditor, className, children, title = "Upload your files", description = "", ...props }, ref) => {
    return (
      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>{children ? children : <Button className="rounded-full shadow">Upload Files</Button>}</DialogTrigger>
          <DialogContent className="flex max-h-[66%] flex-col md:max-w-2xl lg:h-1/2 lg:max-w-3xl xl:max-w-[66%]">
            <DialogHeader>
              <DialogTitle className="whitespace-nowrap">{title}</DialogTitle>
              <DialogDescription className="">{description}</DialogDescription>
            </DialogHeader>
            <div className="gap-4 overflow-scroll py-4">
              <FileUploadAreaAndScroll
                url={url}
                handleFile={handleFile}
                allowFileEditor={allowFileEditor}
                parseFor={parseFor}
                onUploadSuccess={onUploadSuccess}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
