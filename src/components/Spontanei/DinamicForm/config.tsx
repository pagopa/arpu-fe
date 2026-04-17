import React from 'react';
import * as z from 'zod';
import { SpontaneousFormField } from '../../../../generated/data-contracts';
import { Option, OptionSchema } from 'components/Spontanei/SpontaneiSchemas';

// SANDBOX
import sand from '@nyariv/sandboxjs';
const Sandbox = sand;
const sandbox = new Sandbox();

// FIELDBEANS INPUTS
import SINGLESELECT from './FieldBeans/SINGLESELECT';
import MULTISELECT from './FieldBeans/MULTISELECT';
import DATEPICKER from './FieldBeans/DATE';
import TEXT from './FieldBeans/TEXT';
import MULTIFIELD from './FieldBeans/MULTIFIELD';
import NONE from './FieldBeans/NONE';
import TAB from './FieldBeans/TAB';
import DYNAMIC_SELECT from './FieldBeans/DYNAMIC_SELECT';
import CURRENCY from './FieldBeans/CURRENCY';
import DYNAMIC_AMOUNTLABEL from './FieldBeans/DYNAMIC_AMOUNT_LABEL';
import CURRENCY_LABEL from './FieldBeans/CURRENCY_LABEL';
import { RenderType } from '../../../../generated/apiClient';

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

export const flattenObject = (obj, delimiter = '.', prefix = ''): Record<string, string | number> =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}${delimiter}` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && Object.keys(obj[k]).length > 0)
      Object.assign(acc, flattenObject(obj[k], delimiter, pre + k));
    else acc[pre + k] = obj[k];
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
  try {
    const scopeValues = backToOriginalScope(scope);
    return sandbox.compile(code)(scopeValues).run() as T;
  } catch (error) {
    console.error('something went wrong in computeValue', code, error);
    return;
  }
}

// This function is used to convert the values of the specific fields to the original form

// For example, if the form has a field with a value of { label: 'test', value: 'test' },
// this function will convert it to 'test'
// This is required to have full retrocompatibility with the existing code
// The problem is particularly evident with select fields converted to object {label, value} or array of objects
// But old code assumes that the values are strings or arrays of strings
const backToOriginalScope = (values: CustomFormValues) => {
  const scopeValues = { ...values };
  Object.keys(scopeValues).forEach((key) => {
    const value = scopeValues[key];
    if (isOption(value)) {
      scopeValues[key] = value.value;
    }
    if (Array.isArray(scopeValues[key]) && scopeValues[key].every(isOption)) {
      scopeValues[key] = scopeValues[key]?.map((opt: Option) => opt.value);
    }

  });
  return scopeValues;
}

/** set the form schema for validation */
export const BuildFormSchema = (fields: Array<SpontaneousFormField>, amountFieldName?: string) => {
  let schemaObject = {};
  fields.forEach((field) => {
    if (amountFieldName) {
      schemaObject = { ...schemaObject, [amountFieldName]: z.number().min(1, 'spontanei.form.errors.amount') };
    }
    if (field.subfields) BuildFormSchema(field.subfields);
    if (field.htmlRender === RenderType.MULTIFIELD || field.htmlRender === RenderType.TAB) {
      return;
    }
    const name = field.name;
    const isRequired = field.required;
    const regex = field.regex;
    const type = field.htmlRender;
    const errorMessage = field.extraAttr?.error_messag;
    const isAmountField =
      type === RenderType.CURRENCY ||
      type === RenderType.DYNAMIC_AMOUNT_LABEL ||
      type === RenderType.CURRENCY_LABEL;
    let fieldSchema;
    if (isAmountField) {
      fieldSchema = isRequired ? z.number().min(0, errorMessage) : z.number();
    } else if (type === RenderType.SINGLESELECT || type === RenderType.DYNAMIC_SELECT) {
      fieldSchema = OptionSchema
        .nullable()
        .refine((option) => isRequired && option !== null, errorMessage);
    } else if (type === RenderType.MULTISELECT) {
      fieldSchema = isRequired ? z.array(OptionSchema).min(1, errorMessage) : z.array(OptionSchema);
    } else {
      fieldSchema = isRequired ? z.string().min(1, errorMessage) : z.string();
      if (regex) {
        fieldSchema = fieldSchema.regex(new RegExp(regex || ''), errorMessage);
      }
    }
    schemaObject = { ...schemaObject, [name]: fieldSchema };
  });
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

/** Type guard to check if a value is a valid Option */
const isOption = (value: unknown): value is Option =>
  typeof value === 'object' &&
  value !== null &&
  'label' in value &&
  'value' in value &&
  typeof (value as Option).label === 'string' &&
  typeof (value as Option).value === 'string';

/** Normalize a select value to a proper Option or null */
export const normalizeSelectValue = (value: unknown, options: Option[] = []): Option | null => {
  if (isOption(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  return options.find((option) => option.value === value || option.label === value) || null;
};

let intialState: CustomFormValues = {};
/** set the form state considering the initial value */
export const BuildFormState = (fields: Array<SpontaneousFormField>): CustomFormValues => {
  fields.forEach(({ name, defaultValue, subfields, htmlRender, enumerationList }) => {
    if (subfields) BuildFormState(subfields);
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
        return
      }
      if (
        htmlRender === RenderType.SINGLESELECT ||
        htmlRender === RenderType.DYNAMIC_SELECT
      ) {
        const initialOptions = (enumerationList || []).map((enumeration) => ({
          label: enumeration,
          value: enumeration
        }));
        intialState = {
          ...intialState,
          [name]: normalizeSelectValue(defaultValue, initialOptions)
        };
        return
      }
      if (htmlRender === RenderType.CURRENCY || htmlRender === RenderType.CURRENCY_LABEL || htmlRender === RenderType.DYNAMIC_AMOUNT_LABEL) {
        intialState = { ...intialState, [name]: 0 };
        return
      }
      intialState = { ...intialState, [name]: defaultValue };
    }
  });
  return intialState;
};

/** Render a single input */
export const BuildInput = (
  element: SpontaneousFormField,
  allElements?: SpontaneousFormField[],
  amountFieldName = 'amount'
) => {
  switch (element.htmlRender) {
    case RenderType.TAB:
      return <TAB {...element} />;
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
  addTotaleField = false,
  amountFieldName = 'amount'
) => {
  const fields = [...elements];

  if (addTotaleField) {
    fields.push({
      name: amountFieldName,
      required: true,
      htmlRender: RenderType.CURRENCY,
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
