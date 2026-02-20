import React from 'react';
import * as z from 'zod';
import { SpontaneousFormField } from '../../../../generated/data-contracts';

// SANDBOX
import sand from '@nyariv/sandboxjs';
const Sandbox = sand;
const sandbox = new Sandbox();

// FIELDBEANS INPUTS
import SINGLESELECT from './FieldBeans/SINGLESELECT';
import MULTISELECT from './FieldBeans/MULTISELECT';
import DATEPICKER from './FieldBeans/DATE';
import TEXT from './FieldBeans/TEXT';
import CURRENCYLABEL from './FieldBeans/CURRENCYLABEL';
import MULTIFIELD from './FieldBeans/MULTIFIELD';
import NONE from './FieldBeans/NONE';
import TAB from './FieldBeans/TAB';
import DYNAMIC_SELECT from './FieldBeans/DYNAMIC_SELECT';
import DYNAMIC_AMOUNTLABEL from './FieldBeans/DYNAMIC_AMOUNTLABEL';
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

function formatString(formatString: string, dataObject: { [key: string]: unknown }): string {
  return formatString.replace(/[$]?{([^{}]*)}/g, (match, key) => {
    /*eslint no-prototype-builtins: "off"*/
    if (dataObject.hasOwnProperty(key)) {
      return String(dataObject[key]);
    }
    return match;
  });
}

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
let schemaObject = {};
export const BuildFormSchema = (fields: Array<SpontaneousFormField>) => {
  fields.forEach((field) => {
    if (field.subfields) BuildFormSchema(field.subfields);
    const name = field.name;
    const isRequired = field.required;
    const regex = field.regex;
    const type = field.htmlRender;
    const errorMessage = field.extraAttr?.error_message;

    let fieldSchema;
    if (type === 'MULTISELECT') {
      fieldSchema = isRequired ? z.array(z.string()).min(1, errorMessage) : z.array(z.string());
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
  [key: string]: string | string[] | undefined;
}

/** set the form state considering the initial value */
let intialState: CustomFormValues = {};
export const BuildFormState = (fields: Array<SpontaneousFormField>): CustomFormValues => {
  fields.forEach(({ name, defaultValue, subfields, htmlRender }) => {
    if (subfields) BuildFormState(subfields);
    /* I fields MULTFIELD sono solo contenitori di altri fields
      non hanno un value associato e per questo motivo non è
      necessario tenere tracciao dello stato
      probabilmente anche altri tipi di fields non necessitano
      di stato  */
    if (htmlRender !== 'MULTIFIELD') {
      // Una multiselect usa un array di valori
      // TODO: gestire un eventuale valore
      // iniziale. In questo caso è più complesso
      // perchè defaultValue dovrebbe essere un array di valori
      if (htmlRender == 'MULTISELECT') {
        intialState = { ...intialState, [name]: [] };
      } else {
        intialState = { ...intialState, [name]: defaultValue };
      }
    }
  });
  return intialState;
};

/** Render a single input */
export const BuildInput = (element: SpontaneousFormField, allElements?: SpontaneousFormField[]) => {
  switch (element.htmlRender) {
    case 'TAB':
      return <TAB input={element} />;
    case 'SINGLESELECT':
      return <SINGLESELECT {...element} />;
    case 'DYNAMIC_SELECT':
      return <DYNAMIC_SELECT {...element} />;
    case 'MULTISELECT':
      return <MULTISELECT {...element} />;
    case 'DATE':
      return <DATEPICKER {...element} />;
    case 'NONE':
      return <NONE {...element} allFields={allElements} />;
    case 'CURRENCY':
    case 'TEXT':
      return <TEXT {...element} />;
    case 'CURRENCY_LABEL':
      return <CURRENCYLABEL {...element} />;
    case 'DYNAMIC_AMOUNT_LABEL':
      return <DYNAMIC_AMOUNTLABEL {...element} />;
    case 'MULTIFIELD':
      return <MULTIFIELD input={element} />;
    default:
      return null;
  }
};

/** Render a group of inputs */
export const BuildFormInputs = (elements: Array<SpontaneousFormField>, addTotaleField = false) => {
  const fields = elements;

  if (addTotaleField) {
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
    .map((element) => BuildInput(element, elements));
};

export type FieldBeanPros = {
  input: SpontaneousFormField;
};
