import { Text, Font, Page, View, Image, Document, StyleSheet, usePDF } from "@react-pdf/renderer";
import ReactPDF from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";
import PDFTemplate0 from "./PDFTemplate0";
import React, { ReactElement, useEffect } from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { toast } from "../ui/sonner";
import { TemplateTabData } from '../../types/formGenerator';
import { cn } from '../../lib/utils';
import { handleDownloadUrlClick } from '../../utils/url';

// Define an interface for the props needed by the render function
export interface PDFDownloadContentProps {
  blob: any;
  url: any;
  loading: boolean;
  error: any;
  index: number;
  fileName: string;
  onUrlProduced?: (index: number, url: string, fileName: string) => void;
  downloadOnClick?: boolean;
  handleDownloadClick?: () => void;
  fileDownloaded?: boolean;
  logoSVG: string
}

// This function returns the JSX ReactNode for the download content
export function renderPDFDownloadContent({
  blob,
  url,
  loading,
  error,
  index,
  fileName,
  onUrlProduced,
  downloadOnClick,
  handleDownloadClick,
  fileDownloaded,
  logoSVG,
}: PDFDownloadContentProps): React.ReactNode {
  if (blob) {
    // Optionally handle the blob (e.g. for debugging)
    // console.log("Blob Produced", blob);
  }

  if (url) {
    onUrlProduced && onUrlProduced(index, url, fileName);
  }

  if (loading) {
    return <h4 className="min-w-max text-primary-dark">Loading Document ...</h4>;
  } else if (error) {
    console.error("Error with Document ...", error);
    return <h4 className="min-w-max text-primary-dark">Error with Document ...</h4>;
  } else {
    return (
      <div
        onClick={(e) => {
          handleDownloadClick && handleDownloadClick();
          // Comment the lines below if you want to use the default download behavior of PDFDownloadLink
          e.stopPropagation();
          e.preventDefault();
        }}
        className=""
      >
        {fileDownloaded ? (
          <div className="flex gap-x-2 text-purple">
            <h4 className="min-w-max">Downloaded</h4>
            <CheckCircleOutlinedIcon className="" />
          </div>
        ) : (
          <h4 className="min-w-max text-green">Ready</h4>
        )}
      </div>
    );
  }
}

interface SinglePDFPreviewProps {
  index: number;
  title: string;
  fileName: string;
  onUrlProduced?: (index: number, url: string, fileName: string) => void;
  hasFileDownloaded?: boolean;
  downloadOnClick?: boolean;
  onDownloadClick?: ((arg0: any, download?: boolean) => void) | null;
  entrySections?: any;
  officeFields?: any;
  ownerFields?: any;
  reportFields?: any;
  reportDetails?: any;
  reportTemplate?: TemplateTabData;
  priorityFields?: any;
  hiddenFields?: any;
  encryptedFormId?: string;
  document?: React.ReactElement;
  logoSVG: string;
}

const SinglePDFDownload: React.FC<SinglePDFPreviewProps> = ({
  index,
  title,
  fileName,
  onUrlProduced,
  hasFileDownloaded = false,
  downloadOnClick = false,
  onDownloadClick,
  officeFields,
  ownerFields,
  entrySections,
  reportFields,
  reportDetails,
  reportTemplate,
  priorityFields,
  hiddenFields,
  encryptedFormId,
  document,
  logoSVG,
}) => {
  const [fileDownloaded, setFileDownloaded] = React.useState<boolean>(hasFileDownloaded);
  const [count, setCount] = React.useState<number>(0);
  let resetCountTimeout: NodeJS.Timeout;
  let countTimeout: NodeJS.Timeout;

  const documentLocal = document ? (
    document
  ) : (
    <PDFTemplate0
      title={title}
      officeFields={officeFields}
      ownerFields={ownerFields}
      entrySections={entrySections}
      reportFields={reportFields}
      reportDetails={reportDetails}
      reportTemplate={reportTemplate}
      priorityFields={priorityFields}
      hiddenFields={hiddenFields}
      logoSVG={logoSVG}
      encryptedFormId={encryptedFormId}
    />
  );

  const [instance, updateInstance] = usePDF({
    document: documentLocal,
  });

  useEffect(() => {
    setFileDownloaded(hasFileDownloaded);
  }, [hasFileDownloaded]);

  const handleDownloadClick = async (download?: boolean) => {
    console.log("\n\n\nhandleDownloadClick****", downloadOnClick, instance.url);
    debugger;
    if (downloadOnClick && instance.url) {
      handleDownloadUrlClick(instance.url, fileName);
    }

    //needs a timeout to allow the download to complete
    setTimeout(() => {
      if (onDownloadClick) onDownloadClick(fileName, download);
      else if (downloadOnClick === undefined) {
        if (instance.url) handleDownloadUrlClick(instance.url, fileName);
      }
      //setFileDownloaded(true);
    }, 1);
  };

  const countClick = async () => {
    countTimeout = setTimeout(() => {
      setCount(count + 1);
      if (count > 4) {
        toast({
          title: "Woah there!",
          message: "I'm not very fond of being clicked so often.",
          type: "default",
        });
        setCount(0);
      }
      clearTimeout(resetCountTimeout);
      //start new timeout over becuase new changes to be saved
      resetCountTimeout = setTimeout(async () => {
        setCount(0);
        clearTimeout(resetCountTimeout);
      }, 10000);
    }, 1000);
  };

  //TODO move to usePDF hook https://react-pdf.org/advanced#on-the-fly-rendering

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  if (instance.url) {
    onUrlProduced && onUrlProduced(index, instance.url, fileName);
  }

  console.log("instance", instance);

  const viewPDF = false;

  return (
    <>
      <a href={instance.url ?? ""} download={fileName} onClick={() => handleDownloadClick(false)}>
        <span className={cn("text-primary-dark", fileDownloaded && "text-green")}>{fileDownloaded ? "Downloaded" : "Download"}</span>
      </a>
      {viewPDF && <PDFViewer>{documentLocal}</PDFViewer>}
    </>
  );
};

export default SinglePDFDownload;
