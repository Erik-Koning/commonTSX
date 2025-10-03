"use client";

import { Text, Font, Page, View, Image, Document, StyleSheet } from "@react-pdf/renderer";
import ReactPDF from "@react-pdf/renderer";
//import { PDFViewer } from "@react-pdf/renderer";
import Header from "./Header";
import Greeting from "./Greeting";
import Preamble from "./Preamble";
import ReportSection from "./ReportSection";
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import Closing from "./Closing";
import EntryFields from "./EntryFields";
import Signature from "./Signature";
import PDFTemplate0 from "./PDFTemplate0";
import { TemplateTabData } from '../../types/formGenerator';
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

export interface SinglePDFPreviewProps {
  title: string;
  fileName?: string;
  entrySections?: any;
  officeFields?: any;
  ownerFields?: any;
  reportFields?: any;
  reportDetails?: any;
  reportTemplate?: TemplateTabData;
  priorityFields?: any;
  supplementalFields?: any;
  hiddenFields?: any;
  logoSVG: string;
  encryptedFormId: string;
  document?: React.ReactElement;
}

const PDFViewer = dynamic(() => import("./PDFViewer"), {
  //loading: () => <Loader fullscreen={true} />,
  ssr: false,
});

const SinglePDFPreview: React.FC<SinglePDFPreviewProps> = ({
  title,
  fileName,
  officeFields,
  ownerFields,
  entrySections,
  reportFields,
  reportDetails,
  reportTemplate,
  priorityFields,
  supplementalFields,
  hiddenFields,
  logoSVG,
  encryptedFormId,
  document,
}) => {
  // Create styles
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#FFFFFF",
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: "100%",
      height: "100%",
    },
    section: {
      margin: 20,
      padding: 10,
      flexGrow: 1,
    },
    row: {
      flexDirection: "row",
    },
    reportSection: {
      margin: 20,
      padding: 10,
      flexGrow: 1,
    },
  });

  // Memoize the last valid document
  const [documentToRender, setDocumentToRender] = useState(document);

  useEffect(() => {
    //We only want to re-render if the document has changed and has a new key
    if (document && document.key !== documentToRender?.key) {
      setDocumentToRender(document);
    }
  }, [document]);

  console.info("document", document);
  console.info("documentToRender", documentToRender);

  console.info("SinglePDFPreview content", ownerFields, entrySections, reportFields, priorityFields);

  if (!documentToRender) {
    //If the document is not valid, we don't want to render anything
    return null;
  }

  return (
    <>
      {/*If "XX is not a function" errors still occur, might be fixed by adding a unique key to the parent div around our re-render problem causing component */}
      <PDFViewer style={styles.page} className="" showToolbar={false} key={documentToRender?.key ?? encryptedFormId}>
        {documentToRender ? (
          documentToRender
        ) : (
          <PDFTemplate0
            title={title}
            officeFields={officeFields}
            ownerFields={ownerFields}
            entrySections={entrySections}
            reportFields={reportFields}
            reportDetails={reportDetails}
            reportTemplate={reportTemplate}
            supplementalFields={supplementalFields}
            priorityFields={priorityFields}
            hiddenFields={hiddenFields}
            logoSVG={logoSVG}
            encryptedFormId={encryptedFormId}
          />
        )}
      </PDFViewer>
    </>
  );
};

export default SinglePDFPreview;
