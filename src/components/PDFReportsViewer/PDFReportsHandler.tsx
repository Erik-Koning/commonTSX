import React, { ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FieldValues, useForm } from "react-hook-form";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Section } from '../../types/formGenerator';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { generatePDFFileName } from '../../utils/stringManipulation';
import { findContacts, populateTemplateWithSavedFields, removeKeySiblings } from "@common/components/formGenerator/formatGeneratorData";
import { getObjectKeyNamesThatMatchFilterKeys, removeKeysAndFlatten, renameObjectKeys, retainKeys } from '../../utils/objectManipulation';
import { cn } from '../../lib/utils';
import { isValidImageUrl } from '../../lib/validations/validations';
import { dateToFriendlyString } from "../../utils/dateManipulation";
import { handleDownloadUrlClick } from "../../utils/url";
import { Button } from '../../components/ui/Button';
import { CheckBoxButton } from "../ui/CheckBoxButton";
import { SentVsRead } from "../ui/SentVsRead";
import { SelectBox } from "../inputs/SelectBox";
import { HoverCardClickable } from "../inputs/HoverCardClickable";
import PDFTemplate0 from "./PDFTemplate0";
//@ts-ignore

/**
 * Tells Next.js to load the SinglePDFDownload component dynamically.
 * Creates a separate JavaScript chunk that is only fetched and executed
 * when the component is rendered, improving initial page load time.
 */
const SinglePDFDownload = dynamic(
  () => import("./SinglePDFDownload"),
  // Disable server-side rendering for this component, ensures it's only rendered in the browser
  { ssr: false }
);
const SinglePDFPreview = dynamic(
  () => import("./SinglePDFPreview"),
  // Disable server-side rendering for this component, ensures it's only rendered in the browser
  { ssr: false }
);

interface PDFReportsHandlerProps {
  mode: "download" | "preview";
  data: Record<string, any>;
  onUrlProduced?: (index: number, url: string, fileName: string) => void;
  filesDownloadedDefault?: string[] | null;
  onDownloadClick?: ((arg0: any, download?: boolean) => void) | null;
  downloadOnClick?: boolean;
  submitCallback?: ((arg0: any) => void) | null;
  onHasFileToSecureSend?: ((arg0: any) => void) | null;
  onSecureSendDataChange?: ((arg0: any) => void) | null;
  enableSecureSend?: boolean;
  documentSentStatus?: Record<
    string,
    {
      reportFile?: string;
      recipients: { email: string; firstName?: string; lastName?: string; id?: string }[];
      sentAt?: string;
      readAt?: Record<string, any>;
    }
  >;
  onlyShowReportsForApproval?: boolean;
  reportFileNamesExt?: string[];
  lastEdited?: Date;
  className?: string;
  logoSVG: string;
}

const PDFReportsHandler: React.FC<PDFReportsHandlerProps> = ({
  mode,
  data,
  onUrlProduced,
  filesDownloadedDefault,
  onDownloadClick,
  downloadOnClick,
  submitCallback,
  onHasFileToSecureSend,
  onSecureSendDataChange,
  enableSecureSend,
  documentSentStatus,
  onlyShowReportsForApproval = false,
  reportFileNamesExt,
  lastEdited,
  className,
  logoSVG,
}) => {
  const [hasFileToSecureSend, setHasFileToSecureSend] = useState<boolean>(false);
  const [filesDownloaded, setFilesDownloaded] = useState<string[] | null | undefined>(filesDownloadedDefault);
  const [logoChecked, setLogoChecked] = useState<boolean>(false);

  // --- Data Processing and Memoization ---

  useLayoutEffect(() => {
    async function validateLogo() {
      if (data?.officeFields?.logo && (await isValidImageUrl(data.officeFields.logo))) {
        setLogoChecked(true);
      } else {
        setLogoChecked(false);
      }
    }
    validateLogo();
  }, [data?.officeFields?.logo]);

  useEffect(() => {
    if (filesDownloadedDefault) {
      setFilesDownloaded(filesDownloadedDefault);
    }
  }, [filesDownloadedDefault]);

  const checkSecureSendIsEnabledWithRecipients = (newData: any) => {
    //Atleast one secureSend-enable- field is true & there is atleast one recipient for that report TODO
    for (const [key, value] of Object.entries(newData)) {
      const report = key.split("-").slice(2).join("-");
      if (
        key.startsWith("secureSend-enable-") &&
        value === true &&
        newData.hasOwnProperty(`secureSend-recipients-${report}`) &&
        Array.isArray(newData[`secureSend-recipients-${report}`]) &&
        newData[`secureSend-recipients-${report}`].length > 0
      ) {
        setHasFileToSecureSend(true);
        return;
      }
    }
    setHasFileToSecureSend(false);
  };

  useEffect(() => {
    onHasFileToSecureSend && onHasFileToSecureSend(hasFileToSecureSend);
  }, [hasFileToSecureSend]);

  // populate the entry.fields object with the updated values
  // data.entry.sections is the sections of the entry form template, to be filled with the saved values
  const entryFields = useMemo(() => {
    const entryResult = populateTemplateWithSavedFields(data.entry.sections, data.updatedDefaultEntryValues);
    // removeKeySiblings removes the siblings of the value field, so that the value field is the only one that is filled with the saved values
    const entrySections = removeKeySiblings(entryResult.newTemplate ?? entryResult.template ?? {}, "value", true) as { [key: string]: Section };
    // removes the fields object from the entrySections object, so that the fields object is the only one that is filled with the saved values
    return removeKeysAndFlatten(entrySections, ["fields"]);
  }, [data.entry.sections, data.updatedDefaultEntryValues]);

  const { reportSections, reportFieldsPriority } = useMemo(() => {
    const reportResult = populateTemplateWithSavedFields(data.reports.sections, data.updatedDefaultReportsValues);
    const sections = removeKeySiblings(reportResult.newTemplate ?? reportResult.template ?? {}, "value", true) as { [key: string]: Section };
    const priority = removeKeySiblings(reportResult.newTemplate ?? {}, "priority", true, true, undefined, 4) as { [key: string]: any };
    return { reportSections: sections, reportFieldsPriority: priority };
  }, [data.reports.sections, data.updatedDefaultReportsValues]);

  const { reportSectionsToShow, reportFileNameMap } = useMemo(() => {
    const sectionsForApprovalKeys = getObjectKeyNamesThatMatchFilterKeys(reportSections, data?.reportsForApproval, camelOrSnakeToTitleCase);
    const sectionsToShow: Record<string, any> = onlyShowReportsForApproval ? retainKeys(reportSections, sectionsForApprovalKeys) : reportSections;

    const fileNameMap = Object.keys(sectionsToShow).reduce((acc, report, idx) => {
      if (reportFileNamesExt?.[idx]) {
        acc[report] = reportFileNamesExt[idx];
      } else {
        const title = camelOrSnakeToTitleCase(report);
        acc[report] = generatePDFFileName(title, entryFields, data.versionSuffixs);
      }
      return acc;
    }, {} as Record<string, string>);

    return { reportSectionsToShow: sectionsToShow, reportFileNameMap: fileNameMap };
  }, [reportSections, onlyShowReportsForApproval, data?.reportsForApproval, reportFileNamesExt, entryFields, data.versionSuffixs]);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setFocus,
    resetField,
    getFieldState,
    getValues,
    reset,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm<FieldValues>({
    defaultValues: { reportFileNameMapping: reportFileNameMap },
  });

  // --- Callbacks and Side Effects ---

  useEffect(() => {
    const checkSecureSendIsEnabled = (currentData: any) => {
      for (const key in currentData) {
        if (key.startsWith("secureSend-enable-") && currentData[key]) {
          const report = key.split("-").slice(2).join("-");
          const recipients = currentData[`secureSend-recipients-${report}`];
          if (Array.isArray(recipients) && recipients.length > 0) {
            setHasFileToSecureSend(true);
            return;
          }
        }
      }
      setHasFileToSecureSend(false);
    };

    const subscription = watch((newData) => {
      checkSecureSendIsEnabled(newData);
      onSecureSendDataChange?.(newData);
    });

    return () => subscription.unsubscribe();
  }, [watch, onSecureSendDataChange]);

  useEffect(() => {
    onHasFileToSecureSend?.(hasFileToSecureSend);
  }, [hasFileToSecureSend]);

  const pdfDownloadLinkUrlsRef = useRef<Record<string, string>>({});

  const handleUrlProduced = (index: number, downloadUrl: string, fileName: string) => {
    pdfDownloadLinkUrlsRef.current[fileName] = downloadUrl;
    onUrlProduced?.(index, downloadUrl, fileName);
  };

  const handleDownloadClick = (fileName: string, download?: boolean) => {
    setFilesDownloaded((prev) => [...(prev ?? []), fileName]);
    if (onDownloadClick) {
      onDownloadClick(fileName, download);
    } else if (download) {
      handleDownloadUrlClick(pdfDownloadLinkUrlsRef.current[fileName], fileName);
    }
  };

  const usersContacts = useMemo(() => [{ name: "Dr. John Doe", email: "Erik@koning.ca" }], []);

  const memoizedPDFDocuments = useMemo(() => {
    return Object.entries(reportSectionsToShow).reduce((acc, [report, reportValue]) => {
      acc[report] = (
        <PDFTemplate0
          key={report}
          title={camelOrSnakeToTitleCase(report)}
          officeFields={{ ...data.officeFields, logo: logoChecked ? data.officeFields.logo : undefined }}
          entrySections={removeKeySiblings(
            populateTemplateWithSavedFields(data.entry.sections, data.updatedDefaultEntryValues).newTemplate ?? {},
            "value",
            true
          )}
          ownerFields={data.ownerFields}
          reportFields={reportValue.fields}
          reportDetails={data.reports.sections[report]}
          reportTemplate={data.reports}
          priorityFields={reportFieldsPriority[report]?.fields}
          hiddenFields={data.hiddenFields}
          logoSVG={logoSVG}
          lastEdited={lastEdited}
          encryptedFormId={data.id}
        />
      );
      return acc;
    }, {} as Record<string, ReactElement>);
  }, [reportSectionsToShow, data, logoChecked, lastEdited, reportFieldsPriority, reportSections]);

  // --- Render Logic ---

  if (mode === "download") {
    return (
      <div className={cn("w-full rounded-lg border-[1px] border-border p-4", className)}>
        <h2 className="font-bold">Documents</h2>
        {Object.entries(reportSectionsToShow).map(([report, reportValue], idx) => {
          const fileName = reportFileNameMap[report];
          const numSent = documentSentStatus?.[fileName]?.recipients.length;
          const numRead = Object.keys(documentSentStatus?.[fileName]?.readAt ?? {}).length;
          const additionalContacts = findContacts({ ...entryFields, ...{ [report]: reportValue?.fields } }).map((obj) =>
            renameObjectKeys(obj, { name: "label", email: "value" })
          );
          const allUsersContacts = [...usersContacts, ...additionalContacts];

          return (
            <div
              key={report}
              className={cn("my-2 flex flex-col rounded-lg border-[1px] border-border px-3 pb-2.5 pt-2", {
                "border-[1.5px] border-purple": watch(`secureSend-enable-${report}`),
              })}
            >
              <div className="flex h-min items-center justify-between">
                <Button
                  variant={"link"}
                  size={"fit"}
                  className="cursor -ml-2 flex max-w-full items-center gap-x-2 whitespace-normal"
                  innerClassName="whitespace-normal text-left break-all overflow-ellipsis"
                  onClick={() => handleDownloadClick(fileName, downloadOnClick)}
                  tooltip="Download"
                  tooltipDelay={1200}
                >
                  <DescriptionOutlinedIcon />
                  <p className="font-medium">{fileName}</p>
                </Button>
                <div>
                  <SinglePDFDownload
                    key={report}
                    index={idx}
                    fileName={fileName}
                    title={camelOrSnakeToTitleCase(report)}
                    onUrlProduced={handleUrlProduced}
                    hasFileDownloaded={filesDownloaded?.includes(fileName)}
                    //downloadOnClick={downloadOnClick}
                    onDownloadClick={(fileName, download) => handleDownloadClick(fileName, true)}
                    document={memoizedPDFDocuments[report]}
                    logoSVG={logoSVG}
                  />
                </div>
              </div>
              <div className="flex items-end justify-between">
                {enableSecureSend && (
                  <div className="flex flex-col">
                    <CheckBoxButton
                      id={`secureSend-enable-${report}`}
                      variant="outline"
                      label={"Send Securely"}
                      register={register}
                      checked={watch(`secureSend-enable-${report}`)}
                      className="mt-2"
                      tooltip="Sends secure link to document via email"
                    />
                    {watch(`secureSend-enable-${report}`) && (
                      <SelectBox
                        id={`secureSend-recipients-${report}`}
                        labelAbove="Recipients"
                        register={register}
                        className={"w-fit min-w-[360px]"}
                        size={"slim"}
                        isMulti
                        isCreatable
                        defaultOptions={allUsersContacts}
                        removeMultiInLabel
                        showValueInLabel
                      />
                    )}
                  </div>
                )}
                <div>
                  {documentSentStatus?.[fileName] && (
                    <HoverCardClickable triggerJSX={<SentVsRead allowTooltip={false} sentClassName="text-green" numSent={numSent} numRead={numRead} />}>
                      <div className="flex flex-col p-2.5">
                        <p>Sent to {numSent} recipients</p>
                        <p>Date sent: {documentSentStatus[fileName].sentAt}</p>
                        {documentSentStatus[fileName].readAt && (
                          <p>
                            Read at:{" "}
                            {Object.entries(documentSentStatus[fileName].readAt ?? {})
                              .map(([email, date]) => `${email} (${dateToFriendlyString(date as Date)})`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </HoverCardClickable>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <div className={cn("w-full", className)}>
        {Object.entries(reportSectionsToShow).map(([report, reportValue]) => (
          <div className="my-4 h-[80vh]" key={report}>
            <SinglePDFPreview title={camelOrSnakeToTitleCase(report)} document={memoizedPDFDocuments[report]} encryptedFormId={data.id} logoSVG={logoSVG} />
          </div>
        ))}
      </div>
    );
  }

  return <div>Invalid mode</div>;
};

export default PDFReportsHandler;
