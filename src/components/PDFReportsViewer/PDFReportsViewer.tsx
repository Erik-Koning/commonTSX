"use client";

import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
//import SinglePDFPreview from "./SinglePDFPreview";
import { populateTemplateWithSavedFields, removeKeySiblings } from "@common/components/formGenerator/formatGeneratorData";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { renderToString } from "react-dom/server";
import axios from "axios";
import dynamic from "next/dynamic";

/**
 * Tells Next.js to load the SinglePDFPreview component dynamically.
 * Creates a separate JavaScript chunk that is only fetched and executed
 * when the component is rendered, improving initial page load time.
 */
const SinglePDFPreview = dynamic(() => import("./SinglePDFPreview"), {
  //loading: () => <Loader size={30} className="animate-spin" />,
  ssr: false, // Disable server-side rendering for this component, ensures it's only rendered in the browser
});

interface PDFReportsViewerProps {
  data?: any;
  submitCallback?: ((arg0: any) => void) | null;
  logoSVG: string
}
import { falseOrEmpty, removeKeysAndFlatten, retainKeys, retainKeysWithValues } from '../../utils/objectManipulation';
import { fetchSvgAsString, getFileExtension } from '../../utils/fileParsing';
import { isUrl } from '../../utils/url';
import { isValidImageUrl } from '../../lib/validations/validations';
import { Loader } from "lucide-react";
import { generatePDFFileName } from '../../utils/stringManipulation';

const PDFReportsViewer: React.FC<PDFReportsViewerProps> = React.memo(
  ({ data, submitCallback, logoSVG }) => {
    const [logoChecked, setLogoChecked] = useState<boolean>(false);

    //const value = await ReactPDF.renderToStream(<MyDocument />);

    useLayoutEffect(() => {
      async function validateLogo() {
        if (data?.officeFields?.logo && (await isValidImageUrl(data.officeFields.logo))) {
          setLogoChecked(true);
        } else {
          // Either set a fallback logo or leave as null so the image is not rendered.
          setLogoChecked(false);
        }
      }
      validateLogo();
    }, [data]);

    //const svgString = renderToString(<QRCodeSVG value={"Hello"} />);
    //console.log("svgString", svgString);

    console.log("PDFReportsViewer", data);

    let rawSvgString = "";
    const officeLogo = data.officeFields.logo;
    //const signature = data.
    /*if (officeLogo && isUrl(officeLogo) && getFileExtension(officeLogo) === "svg") {
      debugger;
      try {
        rawSvgString = await fetchSvgAsString(officeLogo);
        console.log("SVG content as string:", rawSvgString);
        // Now you can store it, manipulate it, or render it in some way.
      } catch (error) {
        console.error("Error fetching SVG:", error);
      }
    }
    */

    //TODO - Optimize by only populating the reports are in the reportsForApproval array
    // populate the entry.fields object with the updated values

    const entryResult = populateTemplateWithSavedFields(data.entry.sections, data.updatedDefaultEntryValues);
    let entrySections = removeKeySiblings(entryResult.newTemplate ?? entryResult.template ?? {}, "value", true) as { [key: string]: any };
    const entryFields = removeKeysAndFlatten(entrySections, ["fields"]);

    // populate the report.fields object with the updated values
    const reportResult = populateTemplateWithSavedFields(data.reports.sections, data.updatedDefaultReportsValues);
    let reportSections = removeKeySiblings(reportResult.newTemplate ?? {}, "value", true) as { [key: string]: any }; //TODO change back to section after testing

    const reportFieldsPriority = removeKeySiblings(reportResult.newTemplate ?? {}, "priority", true, true, undefined, 4) as { [key: string]: any };

    let writableData = { ...data };

    if (!reportResult.newTemplate) {
      return <div>Failed to populate the template with saved fields</div>;
    }

    return (
      <div className="w-full">
        {Object.entries(reportSections).map(([report, reportValue], idx, entriesArray) => {
          //Each key in the reports.fields object is a report, value is the main sections from that report
          // Show if the report is in the reportsForApproval array
          if (writableData.reportsForApproval.includes(camelOrSnakeToTitleCase(report))) {
            let title = camelOrSnakeToTitleCase(report);
            const fileName = generatePDFFileName(title, entryFields, data.versionSuffixs);
            //Set true to use example test data for filling reports
            let testReportData = false;
            if (testReportData) {
            }

            ////console.log("Report is in entry.fields", report);
            return (
              <div className="my-4 h-[80vh]" key={report}>
                <SinglePDFPreview
                  key={`${report}-PDF-Preview`}
                  title={title}
                  fileName={fileName}
                  officeFields={{ ...writableData.officeFields, logo: logoChecked ? writableData.officeFields.logo : undefined }}
                  entrySections={entrySections}
                  ownerFields={writableData.ownerFields}
                  reportFields={reportValue.fields}
                  reportDetails={reportResult.newTemplate ? reportResult?.newTemplate[report] ?? undefined : undefined}
                  reportTemplate={data.reports}
                  supplementalFields={undefined}
                  priorityFields={reportFieldsPriority[report]?.fields}
                  hiddenFields={writableData.hiddenFields}
                  logoSVG={logoSVG}
                  encryptedFormId={writableData.id} //TODO, not actually encrypted yet, will have to do encryption on server when fetching the form
                />
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.data === nextProps.data; //does not re-render if the data is the same
  }
);

PDFReportsViewer.displayName = "PDFReportsViewer";

export default PDFReportsViewer;
