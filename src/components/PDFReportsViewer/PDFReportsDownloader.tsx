import { Section } from '../../types/formGenerator';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { generatePDFFileName } from '../../utils/stringManipulation';
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { findContacts, populateTemplateWithSavedFields, removeKeySiblings } from "@common/components/formGenerator/formatGeneratorData";
//import SinglePDFDownload from "./SinglePDFDownload";
import {
  findKeyValueByPredicate,
  getObjectKeyNamesThatMatchFilterKeys,
  removeKeysAndFlatten,
  renameObjectKeys,
  retainKeys,
} from '../../utils/objectManipulation';
//@ts-ignore
import { Button } from '../../components/ui/Button';
import { Input } from "../inputs/Input";
import { FieldValues, useForm } from "react-hook-form";
import React, { ReactElement, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Select } from "../ui/select";
import { SelectBox } from "../inputs/SelectBox";
import { cn } from '../../lib/utils';
import { CheckBoxButton } from "../ui/CheckBoxButton";
import { isValidImageUrl } from '../../lib/validations/validations';

import dynamic from "next/dynamic";

/**
 * Tells Next.js to load the SinglePDFDownload component dynamically.
 * Creates a separate JavaScript chunk that is only fetched and executed
 * when the component is rendered, improving initial page load time.
 */
const SinglePDFDownload = dynamic(() => import("./SinglePDFDownload"), {
  //loading: () => <Loader size={30} className="animate-spin" />,
  ssr: false, // Disable server-side rendering for this component, ensures it's only rendered in the browser
});

interface PDFReportsDownloaderProps {
  data: any;
  onUrlProduced: (arg0: any, arg1: any, arg2: any) => void;
  filesDownloadedDefault?: string[] | null;
  onDownloadClick?: ((arg0: any, download?: boolean) => void) | null;
  submitCallback?: ((arg0: any) => void) | null;
  onHasFileToSecureSend?: ((arg0: any) => void) | null;
  onSecureSendDataChange?: ((arg0: any) => void) | null;
  enableSecureSend?: boolean;
  logoSVG: string
}

const PDFReportsDownloader: React.FC<PDFReportsDownloaderProps> = ({
  data,
  onUrlProduced,
  filesDownloadedDefault,
  onDownloadClick,
  submitCallback,
  onHasFileToSecureSend,
  onSecureSendDataChange,
  enableSecureSend,
  logoSVG,
}) => {
  const [hasFileToSecureSend, setHasFileToSecureSend] = useState<boolean>(false);
  const [filesDownloaded, setFilesDownloaded] = useState<string[] | null | undefined>(filesDownloadedDefault);
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

  useEffect(() => {
    console.log("filesDownloadedDefault", filesDownloadedDefault);
    if (filesDownloadedDefault) {
      setFilesDownloaded(filesDownloadedDefault);
    }
  }, [filesDownloadedDefault]);

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
    formState: { errors, isDirty, isSubmitting, isValid, defaultValues },
  } = useForm<FieldValues>({
    //we want to use the updatedDefaultValues if they exist becuase they are the most up to date, they are set when the page tab changes to retain state,
    // updatedDefaultValues is not set / dispatched each change becuase it would cause re-renders of the entire form.
    defaultValues: undefined,
  });

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

  useEffect(() => {
    const subscription = watch((newData) => {
      console.log("newData", newData);
      checkSecureSendIsEnabledWithRecipients(newData);
      onSecureSendDataChange && onSecureSendDataChange(newData);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [watch]);

  //TODO feed doctor coworkers list with a full list of doctors that could be referred to, combine with fields that are in the form. If a form email is equal to one in the db check if the name string is close to the one in the db
  //We have the users base
  const usersContacts = [{ name: "Dr. John Doe", email: "Erik@koning.ca" }];

  //const value = await ReactPDF.renderToStream(<MyDocument />);
  console.log("ReportsDownloader data", data);

  // populate the entry.fields object with the updated values
  const entryResult = populateTemplateWithSavedFields(data.entry.sections, data.updatedDefaultEntryValues);
  const entrySections = removeKeySiblings(entryResult.newTemplate ?? entryResult.template ?? {}, "value", true) as { [key: string]: Section };
  const entryFields = removeKeysAndFlatten(entrySections, ["fields"]);

  // populate the report.fields object with the updated values
  const reportResult = populateTemplateWithSavedFields(data.reports.sections, data.updatedDefaultReportsValues);
  const reportSections = removeKeySiblings(reportResult.newTemplate ?? reportResult.template ?? {}, "value", true) as { [key: string]: Section };
  const reportFieldsPriority = removeKeySiblings(reportResult.newTemplate ?? {}, "priority", true, true, undefined, 4) as { [key: string]: any };

  const reportSectionsForApprovalKeys = getObjectKeyNamesThatMatchFilterKeys(reportSections, data.reportsForApproval, camelOrSnakeToTitleCase);
  const reportSectionsForApproval: Record<string, any> = retainKeys(reportSections, reportSectionsForApprovalKeys);

  const handleDownloadClick = (fileName: string, download?: boolean) => {
    console.log("handleDownloadClick", fileName);
    setFilesDownloaded((prev) => {
      if (prev) {
        return [...prev, fileName];
      }
      return [fileName];
    });
    onDownloadClick && onDownloadClick(fileName, download);
  };

  const memoizedPDFDownloads = useMemo(() => {
    console.log("filesDownloaded", filesDownloaded);
    console.log("reportSectionsForApproval", reportSectionsForApproval);

    console.log("reportSectionsDownloader", reportSections, reportResult);

    const resultJSX: ReactElement[] = [];

    Object.entries(reportSectionsForApproval).map(([report, reportValue], idx, entriesArray) => {
      //Each key in the reports.fields object is a report, value is the main sections from that report
      console.log("Key", report, "reportValue12", reportValue, "idx", idx, "entriesArray", entriesArray);
      const title = camelOrSnakeToTitleCase(report);
      const fileName = generatePDFFileName(title, entryFields, data.versionSuffixs);

      console.log("fileName", fileName);

      resultJSX.push(
        <SinglePDFDownload
          key={"key" + idx}
          index={idx}
          title={title}
          fileName={fileName}
          onUrlProduced={onUrlProduced}
          hasFileDownloaded={filesDownloaded ? filesDownloaded.includes(fileName) : undefined}
          onDownloadClick={handleDownloadClick}
          officeFields={{ ...data.officeFields, logo: logoChecked ? data.officeFields.logo : undefined }}
          entrySections={entrySections}
          ownerFields={data.ownerFields}
          reportFields={reportValue.fields}
          reportDetails={reportResult.newTemplate ? reportResult?.newTemplate[report] ?? undefined : undefined}
          reportTemplate={data.reports}
          priorityFields={reportFieldsPriority[report]?.fields}
          hiddenFields={data.hiddenFields}
          logoSVG={logoSVG}
          encryptedFormId={data.id} //TODO: Change to encryptedFormId
        />
      );
    });
    return resultJSX;
  }, [data, filesDownloaded]);

  return (
    <div className="w-full rounded-lg border-[1px] border-border p-4">
      <h2 className="font-bold">Documents</h2>
      {memoizedPDFDownloads.map((jsx, idx) => {
        //un memoized method: reportSectionsForApproval).map(([report, reportValue], idx, entriesArray) => {

        const report = Object.keys(reportSectionsForApproval)[idx];
        const reportValue = Object.values(reportSectionsForApproval)[idx];

        //Each key in the reports.fields object is a report, value is the main sections from that report
        const title = camelOrSnakeToTitleCase(report);
        const fileName = generatePDFFileName(title, entryFields, data.versionSuffixs);

        const additionalContacts = findContacts({ ...entryFields, ...{ [report]: reportValue?.fields } });
        let allUsersContacts = [...usersContacts, ...additionalContacts];

        allUsersContacts = allUsersContacts.map((obj) => renameObjectKeys(obj, { name: "label", email: "value" }));
        console.log("allUsersContacts", allUsersContacts);

        return (
          <div
            key={`${report}-parent-${idx}`}
            className={cn("my-2 flex flex-col rounded-lg border-[1px] border-border px-3 pb-2.5 pt-2", {
              "border-[1.5px] border-purple": watch(`secureSend-enable-${report}`),
            })}
          >
            <div className="flex h-min items-center justify-between " key={`${report}-${idx}`}>
              <Button
                key={`${report}-${idx}`}
                variant={"link"}
                size={"fit"}
                className="cursor -ml-2 flex max-w-full items-center gap-x-2 whitespace-normal"
                innerClassName="whitespace-normal text-left break-all overflow-ellipsis"
                onClick={() => {
                  handleDownloadClick(fileName);
                }}
                tooltip="Download"
                tooltipDelay={1200}
                tooltipVariant={"subtle"}
                tooltipSize={"fit"}
                tooltipClassName="text-sm"
              >
                <DescriptionOutlinedIcon />
                <p className="font-medium">{fileName}</p>
              </Button>
              <div>{jsx}</div>
            </div>
            {enableSecureSend && (
              <>
                <div className="flex w-full pb-0.5">
                  <CheckBoxButton
                    id={`secureSend-enable-${report}`}
                    variant="outline"
                    label={"Secure Send"}
                    register={register}
                    checked={watch(`secureSend-enable-${report}`)}
                    className="mt-2"
                    tooltip="Sends secure link to document via email"
                    tooltipDelay={1800}
                    tooltipVariant={"subtle"}
                    tooltipSize={"fit"}
                  />
                </div>
                {watch(`secureSend-enable-${report}`) && (
                  <div className="flex w-full">
                    <SelectBox
                      id={`secureSend-recipients-${report}`}
                      labelAbove="Recipients"
                      register={register}
                      className={"w-fit min-w-[360px]"}
                      size={"slim"}
                      isMulti={true}
                      defaultOptions={allUsersContacts}
                      removeMultiInLabel={true}
                      showValueInLabel={true}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PDFReportsDownloader;
