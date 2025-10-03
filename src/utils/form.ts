import { TemplateTabData } from '../types/formGenerator';
import { objectDepthMax } from "./objectManipulation";

// Define the return type as a union of a string or a single key/value pair object.
export type KVPair = { key: string; value: string };
export type RegardingValue = KVPair | string;

export const checkMultiDepthEntryFields = (
  entryFields: Record<string, any>,
  depthOfEntryFields: number,
  regardingField: string,
  regardingSection?: string,
  minLength?: number,
  maxLength?: number
): KVPair | undefined => {
  let kvPair: KVPair | undefined;

  const keyToCheck = regardingSection ? regardingSection + "_" + regardingField : regardingField;
  if (depthOfEntryFields === 1) {
    //The key to check is a top level key
    if (entryFields[keyToCheck] !== undefined && typeof entryFields[keyToCheck] === "string") {
      kvPair = { key: keyToCheck, value: entryFields[keyToCheck] };
    }
  }
  //The key to check is a nested key, we require a section and field
  else if (regardingSection) {
    if (entryFields[regardingSection]?.[regardingField] !== undefined && typeof entryFields[regardingSection][regardingField] === "string") {
      kvPair = { key: keyToCheck, value: entryFields[regardingSection][regardingField] };
    }
  } else {
    //There is no regarding section, try via the keyToCheck
    if (entryFields[keyToCheck] !== undefined && typeof entryFields[keyToCheck] === "string") {
      kvPair = { key: keyToCheck, value: entryFields[keyToCheck] };
    }
  }
  if (minLength && kvPair && kvPair.value.length < minLength) {
    return undefined;
  }
  if (maxLength && kvPair && kvPair.value.length > maxLength) {
    return undefined;
  }
  return kvPair;
};

export const getRegardingValue = (
  reportTemplate?: TemplateTabData,
  entryFields?: Record<string, any>,
  valueLengthLimit: number = 100
): RegardingValue => {
  let keyFound: string | null = null;
  let value: string | null = null;
  let valueFallback: string = "Unspecified";
  let depthOfEntryFields = objectDepthMax(entryFields, 2);

  if (reportTemplate && reportTemplate?.regardingFieldId && entryFields) {
    let regardingSection: string | undefined = reportTemplate.regardingFieldId.split("_")[0];
    let regardingField: string | undefined = reportTemplate.regardingFieldId.split("_")[1];
    if (!regardingField) {
      regardingField = regardingSection; // There was no "_" in the regardingFieldId, default to field name
      //Now lets loop over the entry fields and check for a section that has regardingField as a key
      for (let idx = 0; idx < Object.keys(entryFields).length; idx++) {
        const section = Object.keys(entryFields)[idx];
        if (entryFields[section].hasOwnProperty(regardingField)) {
          regardingSection = section;
          break;
        }
        if (idx === Object.keys(entryFields).length - 1) {
          //No section was found
          regardingSection = undefined;
        }
      }
    }
    const kvPair = checkMultiDepthEntryFields(entryFields, depthOfEntryFields, regardingField, regardingSection);
    if (kvPair) {
      keyFound = kvPair.key;
      value = kvPair.value;
    }
  }
  if (value === null) {
    //Check for a field in this report that has a key "reasonFor", or "regarding", or "subject"
    const alternateFields = [
      "appointmentReason",
      "reasonForAssessment",
      "reasonForVisit",
      "reasonForAdmission",
      "reasonForProcedure",
      "reasonForHospitalization",
      "reasonForAppointment",
      "reasonForConsultation",
      "reasonForDeath",
      "reasonForDisability",
      "plannedTreatmentForThisAppointment",
      "reasonForReferral",
      "reasonForDischarge",
      "reasonForTransfer",
      "regarding",
      "subject",
    ];
    for (const section in entryFields) {
      const maxStringLength = valueLengthLimit * 2;
      // Is entryFields a shallow or deep entry object, check each section
      if (typeof entryFields[section] === "string") {
        // It is a shallow entry object, we can get the field
        if (alternateFields.some((altField) => section.includes(altField))) {
          // section is the fieldName and it includes a regarding field identifier via alternateFields array
          let regardingSection: string | undefined = section.split("_")[0];
          let regardingField: string | undefined = section.split("_")[1];
          if (!regardingField) {
            regardingField = regardingSection;
            regardingSection = undefined;
          }
          const kvPair = checkMultiDepthEntryFields(entryFields, depthOfEntryFields, regardingField, regardingSection, 0, maxStringLength);
          if (kvPair) {
            keyFound = kvPair.key;
            value = kvPair.value;
            break;
          }
        }
      } else {
        //It is a nested entry, we need to check each field
        for (const field in entryFields[section]) {
          if (alternateFields.some((altField) => field.includes(altField)) && typeof entryFields[section][field] === "string") {
            const kvPair = checkMultiDepthEntryFields(entryFields, depthOfEntryFields, field, section, 0, maxStringLength);
            if (kvPair) {
              keyFound = kvPair.key;
              value = kvPair.value;
              break;
            }
          }
        }
        if (value !== null) {
          break;
        }
      }
    }
  }
  if (value === null) {
    value = valueFallback;
  }
  if (value && value.length > valueLengthLimit + 2) {
    //add ellipsis if the value is too long
    value = value.substring(0, valueLengthLimit) + "...";
  }
  return keyFound ? { key: keyFound, value: value } : value;
};
