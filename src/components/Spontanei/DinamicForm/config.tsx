import React from 'react';
import * as z from 'zod';
import { SpontaneousFormField } from '../../../../generated/data-contracts';
import { Option } from './FieldBeans/withDinamicValues';

// SANDBOX
import sand from '@nyariv/sandboxjs';
const Sandbox = sand;
const sandbox = new Sandbox();

// FIELDBEANS INPUTS
import SINGLESELECT from './FieldBeans/SINGLESELECT';
import MULTISELECT from './FieldBeans/MULTISELECT';
import DATEPICKER from './FieldBeans/DATE';
import TEXT from './FieldBeans/TEXT';
import CURRENCY_LABEL from './FieldBeans/CURRENCY_LABEL';
import MULTIFIELD from './FieldBeans/MULTIFIELD';
import NONE from './FieldBeans/NONE';
import TAB from './FieldBeans/TAB';
import DYNAMIC_SELECT from './FieldBeans/DYNAMIC_SELECT';
import DYNAMIC_AMOUNTLABEL from './FieldBeans/DYNAMIC_AMOUNT_LABEL';
import { RenderType } from '../../../../generated/apiClient';
import CURRENCY from './FieldBeans/CURRENCY';

export type FieldName = SpontaneousFormField['name'];

export type FormState = Record<FieldName, string>;

export type ZodIssues = z.ZodIssue[];

/** return a bolean if the input has an error based on zod issues */
export const inputHasError = (issues: z.ZodIssue[], fieldName: string) =>
  issues.filter((error) => error.path.includes(fieldName)).length > 0;

/** return the error message for an input based on zod issues and its name */
export const getErrorMessage = (issues: z.ZodIssue[], fieldName: string) =>
  issues
    .filter((error) => error.path.includes(fieldName))
    .map(({ message }) => message)
    .toString();

type FlattenedValue = string | number | boolean | null | undefined;

/** Extrae placeholders from a string */
export const getPlaceholders = (template: string): string[] => {
  const regex = /[$]?{([^{}]*)}/g;
  const matches = template.matchAll(regex);
  return Array.from(new Set(Array.from(matches, (match) => match[1])));
};

function formatString(formatString: string, dataObject: { [key: string]: unknown }): string {
  return formatString.replace(/[$]?{([^{}]*)}/g, (match, key) => {
    /*eslint no-prototype-builtins: "off"*/
    if (dataObject.hasOwnProperty(key)) {
      return String(dataObject[key]);
    }
    return match;
  });
}

export const flattenObject = (
  obj: Record<string, unknown>,
  delimiter = '.',
  prefix = ''
): Record<string, FlattenedValue> =>
  Object.keys(obj).reduce<Record<string, FlattenedValue>>((acc, k) => {
    const pre = prefix.length ? `${prefix}${delimiter}` : '';
    const value = obj[k];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedObject = value as Record<string, unknown>;
      if (Object.keys(nestedObject).length > 0) {
        Object.assign(acc, flattenObject(nestedObject, delimiter, pre + k));
        return acc;
      }
    }

    acc[pre + k] = value as FlattenedValue;
    return acc;
  }, {});

/** usata per la causale */
export const buildDinamicValue = (
  stringTemplate: string,
  templateVars: object,
  fields?: SpontaneousFormField[]
) => {
  const updatedFields: { [key: string]: unknown } = {};

  if (fields) {
    fields.forEach((field) => {
      const name = field.name;
      const causaleFunction = field.extraAttr?.causale_function;
      const hasCausaleFunction = Boolean(causaleFunction);
      if (hasCausaleFunction && causaleFunction) {
        updatedFields[name] = computeValue(causaleFunction, templateVars);
      }
    });
  }
  return formatString(stringTemplate, { ...templateVars, ...updatedFields });
};

export function computeValue<T>(code: string, scope = {}) {
  return sandbox.compile(code)(scope).run() as T;
}

/** set the form schema for validation */
let schemaObject: Record<string, z.ZodTypeAny> = {};
export const BuildFormSchema = (fields: Array<SpontaneousFormField>) => {
  schemaObject = {};

  const buildFormSchema = (fieldsToBuild: Array<SpontaneousFormField>) => {
    fieldsToBuild.forEach((field) => {
      if (field.subfields) buildFormSchema(field.subfields);
      const name = field.name;
      const isRequired = field.required;
      const regex = field.regex;
      const type = field.htmlRender;
      if (type === RenderType.MULTIFIELD) {
        return;
      }
      const errorMessage = field.extraAttr?.error_messag;
      const isAmountField =
        type === RenderType.CURRENCY ||
        type === RenderType.DYNAMIC_AMOUNT_LABEL ||
        type === RenderType.CURRENCY_LABEL;
      let fieldSchema: z.ZodTypeAny;
      if (isAmountField) {
        fieldSchema = isRequired ? z.number().min(0, errorMessage) : z.number();
      } else if (type === RenderType.SINGLESELECT || type === RenderType.DYNAMIC_SELECT) {
        fieldSchema = z
          .object({
            label: z.string(),
            value: z.string()
          })
          .nullable()
          .refine((option) => !isRequired || option !== null, errorMessage);
      } else if (type === RenderType.MULTISELECT) {
        fieldSchema = isRequired ? z.array(z.string()).min(1, errorMessage) : z.array(z.string());
      } else {
        const stringSchema = isRequired ? z.string().min(1, errorMessage) : z.string();
        if (regex) {
          fieldSchema = stringSchema.regex(new RegExp(regex || ''), errorMessage);
        } else {
          fieldSchema = stringSchema;
        }
      }
      schemaObject = { ...schemaObject, [name]: fieldSchema };
    });
  };

  buildFormSchema(fields);

  return z.object(schemaObject);
};

export interface CustomFormValues {
  [key: string]: string | string[] | number | number[] | Option | null | undefined;
  debtPositionTypeOrgCode?: string;
  debtPositionTypeOrgId?: number;
  debtPositionTypeOrgDescription?: string;
  organizationId?: number;
  organizationName?: string;
  orgFiscalCode?: string;
  ipaCode?: string;
  fullName?: string;
  email?: string;
  fiscalCode?: string;
  description?: string;
}

const isOption = (value: unknown): value is Option =>
  typeof value === 'object' &&
  value !== null &&
  'label' in value &&
  'value' in value &&
  typeof value.label === 'string' &&
  typeof value.value === 'string';

export const normalizeSelectValue = (value: unknown, options: Option[] = []): Option | null => {
  if (isOption(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  return options.find((option) => option.value === value || option.label === value) || null;
};

/** set the form state considering the initial value */
let intialState: CustomFormValues = {};
export const BuildFormState = (fields: Array<SpontaneousFormField>): CustomFormValues => {
  intialState = {};

  const buildFormState = (fieldsToBuild: Array<SpontaneousFormField>) => {
    fieldsToBuild.forEach(({ name, defaultValue, subfields, htmlRender, enumerationList = [] }) => {
      if (subfields) buildFormState(subfields);
      /* I fields MULTFIELD sono solo contenitori di altri fields
        non hanno un value associato e per questo motivo non è
        necessario tenere tracciao dello stato
        probabilmente anche altri tipi di fields non necessitano
        di stato  */
      if (htmlRender !== RenderType.MULTIFIELD) {
        // Una multiselect usa un array di valori
        // TODO: gestire un eventuale valore
        // iniziale. In questo caso è più complesso
        // perchè defaultValue dovrebbe essere un array di valori
        if (htmlRender == RenderType.MULTISELECT) {
          intialState = { ...intialState, [name]: [] };
        } else if (
          htmlRender === RenderType.SINGLESELECT ||
          htmlRender === RenderType.DYNAMIC_SELECT
        ) {
          const initialOptions = enumerationList.map((enumeration) => ({
            label: enumeration,
            value: enumeration
          }));
          intialState = {
            ...intialState,
            [name]: normalizeSelectValue(defaultValue, initialOptions)
          };
        } else {
          intialState = { ...intialState, [name]: defaultValue };
        }
      }
    });
  };

  buildFormState(fields);

  return intialState;
};

/** Render a single input */
export const BuildInput = (
  element: SpontaneousFormField,
  allElements?: SpontaneousFormField[],
  amountFieldName = 'importo'
) => {
  switch (element.htmlRender) {
    case RenderType.TAB:
      return <TAB input={element} />;
    case RenderType.SINGLESELECT:
      return <SINGLESELECT {...element} />;
    case RenderType.DYNAMIC_SELECT:
      return <DYNAMIC_SELECT {...element} />;
    case RenderType.MULTISELECT:
      return <MULTISELECT {...element} />;
    case RenderType.DATE:
      return <DATEPICKER {...element} />;
    case RenderType.NONE:
      return <NONE {...element} allFields={allElements} />;
    case RenderType.TEXT:
      return <TEXT {...element} />;
    case RenderType.MULTIFIELD:
      return <MULTIFIELD input={element} />;
    // amount
    case RenderType.CURRENCY:
      return <CURRENCY {...element} amountFieldName={amountFieldName} />;
    // readonly amount
    case RenderType.CURRENCY_LABEL:
      return <CURRENCY_LABEL {...element} amountFieldName={amountFieldName} />;
    // dynamic readonly amount (amount that changes based on other fields and an API call)
    case RenderType.DYNAMIC_AMOUNT_LABEL:
      return <DYNAMIC_AMOUNTLABEL {...element} amountFieldName={amountFieldName} />;
    default:
      return null;
  }
};

/** Render a group of inputs */
export const BuildFormInputs = (
  elements: Array<SpontaneousFormField>,
  amountFieldName?: string
) => {
  const fields = [...elements];

  if (!amountFieldName) {
    fields.push({
      name: 'importo',
      required: true,
      htmlRender: RenderType.TEXT,
      htmlClass: 'center',
      htmlLabel: 'Importo',
      defaultValue: '',
      insertableOrder: 0,
      indexable: false,
      renderableOrder: 0,
      searchableOrder: 0,
      listableOrder: 0,
      minOccurences: 0,
      maxOccurences: 0,
      insertable: false,
      renderable: false,
      listable: false,
      detailLink: false,
      searchable: false,
      association: false
    });
  }

  return fields
    .sort((a, b) => a.renderableOrder - b.renderableOrder)
    .map((element) => BuildInput(element, elements, amountFieldName));
};

export type FieldBeanPros = {
  input: SpontaneousFormField;
};
