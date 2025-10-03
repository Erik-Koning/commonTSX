"use client";

// PDFTemplate0.tsx
import React, { useEffect, useRef, useState } from "react";
import { Font, StyleSheet, View, Text, Document, Page } from "@react-pdf/renderer";
import Header from "./Header";
import Greeting from "./Greeting";
import Preamble from "./Preamble";
import ReportSection from "./ReportSection";
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import Closing from "./Closing";
import EntryFields from "./EntryFields";
import Signature from "./Signature";
import { buildAuthor, mostLikelyFirstName, mostLikelyLastName, splitOnString, startsWithGreetings } from '../../utils/stringManipulation';
import Footer from "./Footer";
import Recipient from "./Recipient";
import { falseOrEmpty, objHasKey, removeKeysAndFlatten, retainKeys, retainKeysWithValues } from '../../utils/objectManipulation';
import { Field, TemplateTabData } from '../../types/formGenerator';
import { getRegardingValue, RegardingValue } from '../../utils/form';

//pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
//pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
//import { decryptData, encryptData } from '../../../../utils/crypto';

//FYI text can be in line when rendering https://github.com/diegomura/react-pdf/issues/164

Font.register({
  family: "Open Sans",
  src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf`,
});

Font.register({
  family: "Lato",
  src: `https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf`,
});

Font.register({
  family: "Lato Italic",
  src: `https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf`,
});

Font.register({
  family: "Lato Bold",
  src: `https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf`,
});

//Inter font from google cached fonts.gstatic.com
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
      fontWeight: "thin",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
      fontWeight: "ultralight",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
      fontWeight: "light",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
      fontWeight: "medium",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
      fontWeight: "semibold",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
      fontWeight: "bold",
    },
    {
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
      fontWeight: "ultrabold",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
      fontWeight: "heavy",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontWeight: "medium",
    fontSize: 11,
    backgroundColor: "#FFFFFF",
    paddingVertical: "28px",
    paddingHorizontal: "28px",
    margin: "",
    flexDirection: "column", // Stack children vertically
    height: "100%", // Ensure it takes the full height
  },
  title: {
    fontSize: 12,
    paddingBottom: 0,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
  contentContainer: {
    flexGrow: 0, // should grow to fill the available space?
    flexShrink: 0, // should shrink?
    flexBasis: "auto", // Base size is auto
  },
  spacer: {
    minHeight: 30,
    height: 30,
    flexGrow: 1,
  },
  smallSpacer: {
    minHeight: 2,
    height: 2,
    flexGrow: 0,
  },
  footerContainer: {
    marginTop: "auto",
  },
  section: {
    //backgroundColor: "#FF0000",
    margin: 40,
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
  upperSection: {},
  lowerSection: {
    flexDirection: "column",
    alignSelf: "flex-end",
    flexGrow: 1,
  },
});

interface SinglePDFPreviewProps {
  title: string;
  removeTitleBrackets?: boolean;
  entrySections?: any;
  officeFields?: any;
  ownerFields?: any;
  reportFields?: any;
  reportDetails?: any;
  reportTemplate?: TemplateTabData;
  priorityFields?: any;
  supplementalFields?: any;
  hiddenFields?: any;
  lastEdited?: Date;
  logoSVG?: string;
  encryptedFormId?: string;
  appendixFieldsPageBreak?: boolean;
  appendixFieldsPageBreakTitle?: string;
  debug?: boolean;
  footerOnSignaturePage?: boolean;
  footerOnLastPage?: boolean;
}

// A string that should not be in the content object
const renderAllOtherContent: string = "_*{{ALL_OTHER_CONTENT}}*_";
// Define an array of keys to skip
const sectionsOrder = ["preamble", "exportAllEntryFields", renderAllOtherContent, "thankYou"];

const PDFTemplate0: React.FC<SinglePDFPreviewProps> = ({
  title,
  officeFields,
  ownerFields,
  entrySections,
  reportFields,
  reportDetails,
  reportTemplate,
  priorityFields,
  supplementalFields,
  hiddenFields,
  removeTitleBrackets = true,
  lastEdited,
  logoSVG,
  encryptedFormId,
  appendixFieldsPageBreak = true,
  appendixFieldsPageBreakTitle = "Supplemental Information:",
  debug = false,
  footerOnSignaturePage = true,
  footerOnLastPage = false,
}) => {
  //remove the fields key but keep sub-fields
  const entryFields = removeKeysAndFlatten(entrySections, ["fields"]);
  console.log("entryFields99", entryFields);

  if (removeTitleBrackets) title = title.replace(/ *\([^)]*\) */g, "");
  console.log("title", title);

  let hideFarewell = false;
  let greetingFirstName = "";
  let greetingLastName = "";
  let greetingFullName = "";

  //Special logic on a per report basis
  switch (title) {
    case "Assessment Report":
      greetingFullName = entryFields.appointmentDetails.referringDentist;
      break;
    case "Clinical Note":
      hideFarewell = true;
      break;
  }

  console.log("reportFields09", reportFields, priorityFields);
  console.log("reportDetails", reportDetails);

  //priorityFields will be shown in the main report, and appendixFields will be shown after
  const priorityFieldEntries = priorityFields && retainKeysWithValues(priorityFields, [true]);
  if (priorityFieldEntries && !falseOrEmpty(priorityFieldEntries)) {
    //reportFields will be all the fields that are priority fields or in the sectionsOrder
    const allMainReportKeys = [...Object.keys(priorityFieldEntries), ...sectionsOrder];
    //supplementalFields will be all the fields that are not in the main report
    supplementalFields = retainKeys(
      reportFields,
      Object.keys(reportFields).filter((key) => !allMainReportKeys.includes(key)),
      undefined,
      true
    );
    if (falseOrEmpty(supplementalFields)) supplementalFields = undefined;
    //reportFields will be all the fields that are priority fields or in the sectionsOrder
    reportFields = retainKeys(reportFields, allMainReportKeys, undefined, true);
  }

  console.log("reportFields", reportFields, "supplementalFields", supplementalFields);

  const isHiddenField = (key: string, hiddenFields: any | undefined): boolean => {
    if (
      hiddenFields &&
      Array.isArray(hiddenFields) &&
      objHasKey(
        (hiddenFields as string[]).map((report) => {
          // Call your modification function here
          return splitOnString(report, "_");
        }),
        splitOnString(key, "_")
      )
    ) {
      return true;
    }
    return false;
  };

  const SafeReportSection = (key: string, title: string, content?: any) => {
    try {
      console.log("SafeReportSection", key, title, content);
      if (!content || typeof content !== "string") return null;
      return <ReportSection key={key} id={key} title={title} content={String(content)} />;
    } catch (error) {
      console.error(`Error rendering ReportSection for ${title}:`, error);
      return <Text key={key + "error"}>Error rendering section</Text>;
    }
  };

  const [supplementalFieldsLoc, setSupplementalFieldsLoc] = useState({ ...supplementalFields });
  const prevSupplementalFieldsRef = useRef(supplementalFields);
  const prevSizeRef = useRef(Object.keys(supplementalFields || {}).length);

  useEffect(() => {
    const prevSize = prevSizeRef.current;
    const newSize = Object.keys(supplementalFields || {}).length;

    console.log("supplementalFields!!!", supplementalFields, prevSupplementalFieldsRef.current, prevSize, newSize);

    if (supplementalFields !== prevSupplementalFieldsRef.current && newSize > prevSize) {
      setSupplementalFieldsLoc({ ...supplementalFields });
      prevSizeRef.current = newSize;
    }

    prevSupplementalFieldsRef.current = supplementalFields;
  }, [supplementalFields]);

  const haveSupplementalFields = !falseOrEmpty(supplementalFieldsLoc);

  const regardingObject = getRegardingValue(reportTemplate, entryFields);
  const regardingValue = typeof regardingObject === "string" ? regardingObject : regardingObject.value;

  const patientName = `${entryFields.patient.firstName} ${entryFields.patient.lastName}`;
  const author = buildAuthor(ownerFields);

  const doc = (
    <Document
      style={undefined}
      title={title + (patientName ? ` - ${patientName}` : "")}
      author={author}
      subject={`${entryFields.appointmentDetails.reasonForAssessment}`}
    >
      <Page size="LETTER" style={styles.page} wrap debug={debug}>
        <Header
          color={officeFields.color}
          titleLeft={officeFields.name}
          logoLeft={officeFields.logo}
          titleRight={title}
          patientName={`${entryFields.patient.firstName} ${entryFields.patient.lastName}`}
          patientDOB={entryFields.patient.dateOfBirth}
          subject={entryFields.appointmentDetails.reasonForAssessment}
          officeFields={officeFields}
          ownerFields={ownerFields}
        />
        <View key={title + "contentContainer"} style={[styles.contentContainer, { flexGrow: appendixFieldsPageBreak ? 0 : 1 }]} wrap debug={debug}>
          <Recipient
            lastEdited={lastEdited}
            patientName={`${entryFields.patient.firstName} ${entryFields.patient.lastName}`}
            patientDOB={entryFields.patient.dateOfBirth}
            regardingValue={regardingValue}
            officeFields={officeFields}
            ownerFields={ownerFields}
            content={reportFields}
          />
          {(!reportFields.preamble || !startsWithGreetings(reportFields.preamble)) && (!reportFields.body || !startsWithGreetings(reportFields.body)) && (
            <Greeting
              fullName={greetingFullName}
              firstName={mostLikelyFirstName(reportFields, ["physicianName", "newDentistName", "recipientName"])}
              lastName={mostLikelyLastName(reportFields, ["physicianName", "newDentistName", "recipientName"])}
            />
          )}
          {reportFields.hasOwnProperty("preamble") && <Preamble key={`preamble`} content={reportFields.preamble} />}
          {reportFields.hasOwnProperty("exportAllEntryFields") && (
            <EntryFields key={`exportAllEntryFields`} title="All Entry Fields:" content={entryFields} hiddenFields={hiddenFields?.tabs?.entry ?? null} />
          )}
          {reportFields &&
            Object.keys(reportFields).map((key, index) => {
              // check if key is a hidden field
              if (isHiddenField(key, hiddenFields?.tabs?.report)) {
                return null;
              }
              const fieldDetails: Field = reportDetails?.fields?.[key];

              if (key.toLowerCase().includes("body")) debugger;

              // Check if the key is not in the keysToSkip array
              if (!sectionsOrder.includes(key)) {
                // Render the tag tag for this key
                return (
                  <ReportSection
                    key={title + `renderAllOtherContentKey+${key}`}
                    id={title + `renderAllOtherContent+${key}`}
                    title={camelOrSnakeToTitleCase(key)}
                    content={reportFields[key]}
                    settings={fieldDetails}
                  />
                );
              }
              return null; // Make sure to return null if the key is skipped
            })}
          {reportFields.hasOwnProperty("thankYou") && <Closing key={`thankYou`} content={reportFields.thankYou} />}
          <View style={styles.smallSpacer} />
          <Signature
            paddingBottom={haveSupplementalFields && appendixFieldsPageBreak ? 0 : undefined}
            paddingLeft={0}
            fareWell={hideFarewell ? "" : undefined}
            prefix={ownerFields.prefix}
            firstName={ownerFields.firstName}
            lastName={ownerFields.lastName}
            phoneNumber={ownerFields.phone}
            signature={ownerFields.signature}
            email={ownerFields.email}
            extraNote={""}
            debug={debug}
          />
        </View>
        {footerOnSignaturePage && (
          <View style={styles.footerContainer} wrap={false}>
            <Footer
              logoSVG={logoSVG}
              name={officeFields.name}
              address={`${officeFields.addressL1}\n${officeFields.addressL2 ? officeFields.addressL2 + "\n" : ""}${officeFields.addressCity ?? ""}, ${
                officeFields.addressState ?? ""
              } ${officeFields.addressPostal ?? ""}`}
              phone={officeFields.phone}
              fax={officeFields.fax}
              email={officeFields.email}
              color={officeFields.color}
              encryptedFormId={encryptedFormId}
            />
          </View>
        )}
        {haveSupplementalFields && (
          <View key={title + "supplementalFieldsView"} break={appendixFieldsPageBreak ? true : false}>
            <Text key={title + "supplementalFieldsTitle"} style={styles.title}>
              {appendixFieldsPageBreakTitle}
            </Text>{" "}
            {/* Adding a break on text causes page render issue (no given error) and crash*/}
            {Object.keys(supplementalFieldsLoc).map((key, index) => {
              const content = supplementalFieldsLoc[key];

              // Ensure content exists and is an object or string that can be rendered
              if (!content || typeof content !== "string") {
                console.warn(`Skipping invalid supplemental field: ${key}`, content, supplementalFieldsLoc);
                return null;
              }

              if (isHiddenField(key, hiddenFields?.tabs?.report)) {
                return null;
              }
              return SafeReportSection(title + `supplementalFields+${key}`, camelOrSnakeToTitleCase(key), content);
              //return <SafeReportSection key={`supplementalFields+${index}`} title={camelOrSnakeToTitleCase(key)} content={content} />;
            })}
          </View>
        )}
        {footerOnLastPage && !footerOnSignaturePage && haveSupplementalFields && (
          <View style={styles.footerContainer} wrap={false}>
            <Footer
              logoSVG={logoSVG}
              name={officeFields.name}
              address={`${officeFields.addressL1}\n${officeFields.addressL2 ? officeFields.addressL2 + "\n" : ""}${officeFields.addressCity ?? ""}, ${
                officeFields.addressState ?? ""
              } ${officeFields.addressPostal ?? ""}`}
              phone={officeFields.phone}
              fax={officeFields.fax}
              email={officeFields.email}
              color={officeFields.color}
              encryptedFormId={encryptedFormId}
            />
          </View>
        )}
      </Page>
    </Document>
  );

  return doc;
};

export default PDFTemplate0;
