import { AITextString } from '../components/inputs/AITextActions';
import { ButtonProps } from '../components/ui/Button';

export interface TemplateData {
  id: string;
  isLocalTemplate?: boolean;
  title?: string;
  tabs: {
    [key: string]: TemplateTabData;
  };
  office?: number;
  forceAccordionsOpen?: boolean | string[];
  hideAccordionStyle?: boolean;
  lastAccordionButtonText?: string;
  runAIFillOnFirstLoadTabs?: string[];
}

export type TemplateDataObject = Record<keyof TemplateData, undefined>;

export interface TemplateTabData {
  regardingFieldId?: string; //for specifying the subject in the reports output
  defaultChecked?: string[];
  makeDependentFunctionsForAllDynamicFields?: boolean;
  sections: {
    [key: string]: Section;
  };
}

export interface GeneratorData {
  id?: string;
  office?: number;
  title?: string;
  forceAccordionsOpen?: boolean | string[];
  hideAccordionStyle?: boolean;
  lastAccordionButtonText?: string;
  lastAccordionButtonProps?: Partial<ButtonProps>;
  makeDependentFunctionsForAllDynamicFields?: boolean;
  sections: {
    [key: string]: Section;
  };
}

export interface Section {
  fields: {
    [key: string]: Field;
  };
  defaultChecked?: boolean;
  aiActions?: AITextString[];
  aiSkip?: boolean;
}

export type Field = BaseField | FieldWithOptions;
export type FieldObject = Record<keyof Field, undefined>; //a type that has all the keys of TemplateData with undefined values

export type OptionalField = Partial<Field>;

export type behaviourType = "replace" | "appendAfter" | "appendWith";

export interface BaseField {
  type: "textarea" | "checkbox" | "string" | "dropdown" | "date" | "number" | "input" | "command";
  value?: string | boolean; //The initial value of the field
  className?: string; //The class name for the input
  labelAbove?: string; //If the label should be above the field
  required?: boolean | undefined;
  description?: string; //The description of the field, useful for sending to ai
  width?: string | number; //max width columns 12 or "full"
  itemLines?: number;
  placeholder?: string;
  dropdownCreatable?: boolean;
  dropdownMulti?: boolean;
  helpText?: string;
  label?: string;
  disabled?: boolean;
  interimHidden?: boolean;
  hidden?: string | boolean;
  exportExcluded?: boolean;
  exportHideLabel?: boolean;
  priority?: boolean;
  separate?: string;
  populateByRelation?: string;
  options?: any[];
  aiActions?: AITextString[];
  aiSkip?: boolean;
  aiFillFromPreviousEntry?: boolean | { prompt: string }; //fill the current field with the value of the previous entry field. Prompt can be used to specify the field(s)
  allowCreateOption?: boolean;
  hasDependents?: Record<string, any> & {
    behaviour?:
      | {
          appendAfter?: string;
          appendWith?: string;
        }
      | "replace"
      | {
          type: behaviourType;
          startMatch?: string | (string | RegExp)[];
          endMatch?: string | (string | RegExp)[];
        };
    dependentsMap?: Record<string, any>;
  };
  mostRecentForm?: any;
  makeDependentFunctionsForThisField?: boolean;
}

interface AllowAnyField {
  [key: string]: any;
}

export interface FieldWithOptions extends BaseField {
  options: string[];
}

export const TemplateDataKeysObject: TemplateDataObject = {
  id: undefined,
  isLocalTemplate: undefined,
  title: undefined,
  tabs: undefined,
  office: undefined,
  forceAccordionsOpen: undefined,
  hideAccordionStyle: undefined,
  lastAccordionButtonText: undefined,
  runAIFillOnFirstLoadTabs: undefined,
};

export const FieldKeysObject: FieldObject = {
  //the object which can be used with auto-completion in the code editor
  type: undefined,
  value: undefined,
  className: undefined,
  labelAbove: undefined,
  required: undefined,
  description: undefined,
  width: undefined,
  itemLines: undefined,
  placeholder: undefined,
  dropdownCreatable: undefined,
  dropdownMulti: undefined,
  helpText: undefined,
  label: undefined,
  disabled: undefined,
  interimHidden: undefined,
  hidden: undefined,
  exportExcluded: undefined,
  exportHideLabel: undefined,
  priority: undefined,
  separate: undefined,
  populateByRelation: undefined,
  options: undefined,
  aiActions: undefined,
  allowCreateOption: undefined,
  hasDependents: undefined,
  mostRecentForm: undefined,
  makeDependentFunctionsForThisField: undefined,
  aiSkip: undefined,
  aiFillFromPreviousEntry: undefined,
};
