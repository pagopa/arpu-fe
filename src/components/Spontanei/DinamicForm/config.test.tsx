import React from 'react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { RenderType } from '../../../../generated/apiClient';
import { SpontaneousFormField } from '../../../../generated/data-contracts';
import {
  BuildFormInputs,
  BuildFormSchema,
  BuildFormState,
  BuildInput,
  buildDinamicValue,
  computeValue,
  flattenObject,
  getErrorMessage,
  getPlaceholders,
  inputHasError,
  normalizeSelectValue
} from './config';

const getElementName = (element: React.ReactNode): string | undefined =>
  React.isValidElement<{ name?: string }>(element) ? element.props.name : undefined;

const placeholder = (name: string) => '$' + '{' + name + '}';

const createField = (overrides: Partial<SpontaneousFormField> = {}): SpontaneousFormField =>
  ({
    name: 'field',
    required: false,
    htmlRender: RenderType.TEXT,
    htmlClass: 'full',
    htmlLabel: 'Field',
    defaultValue: '',
    insertableOrder: 0,
    indexable: false,
    renderableOrder: 0,
    searchableOrder: 0,
    listableOrder: 0,
    minOccurences: 0,
    maxOccurences: 1,
    insertable: true,
    renderable: true,
    listable: false,
    detailLink: false,
    searchable: false,
    association: false,
    ...overrides
  }) as SpontaneousFormField;

describe('Spontanei dynamic form config', () => {
  it('detects field errors and extracts their messages', () => {
    const issues = [
      { path: ['nested', 'comune'], message: 'Comune obbligatorio' },
      { path: ['provincia'], message: 'Provincia obbligatoria' }
    ] as z.ZodIssue[];

    expect(inputHasError(issues, 'comune')).toBe(true);
    expect(inputHasError(issues, 'cap')).toBe(false);
    expect(getErrorMessage(issues, 'comune')).toBe('Comune obbligatorio');
  });

  it('extracts unique placeholders from templates', () => {
    const namePlaceholder = placeholder('name');

    expect(
      getPlaceholders('Ciao ' + namePlaceholder + ', paga {amount} per ' + namePlaceholder)
    ).toEqual(['name', 'amount']);
  });

  it('flattens nested objects preserving primitive values', () => {
    expect(
      flattenObject({
        payer: { city: 'Roma', cap: 12345 },
        enabled: true,
        note: null
      })
    ).toEqual({
      'payer.city': 'Roma',
      'payer.cap': 12345,
      enabled: true,
      note: null
    });
  });

  it('computes sandboxed expressions and injects dynamic placeholders', () => {
    expect(computeValue<number>('return amount * 2', { amount: 6 })).toBe(12);
    const fullNamePlaceholder = placeholder('fullName');
    const causalePlaceholder = placeholder('causale');

    const result = buildDinamicValue(
      'Pagamento ' + fullNamePlaceholder + ' - ' + causalePlaceholder,
      { fullName: 'Mario Rossi' },
      [
        createField({
          name: 'causale',
          extraAttr: { causale_function: 'return "RINNOVO"' }
        })
      ]
    );

    expect(result).toBe('Pagamento Mario Rossi - RINNOVO');
  });

  it('keeps unknown placeholders unchanged in dynamic templates', () => {
    const knownPlaceholder = placeholder('known');
    const missingPlaceholder = placeholder('missing');

    expect(
      buildDinamicValue('Pagamento ' + knownPlaceholder + ' - ' + missingPlaceholder, {
        known: 'OK'
      })
    ).toBe('Pagamento OK - ' + missingPlaceholder);
  });

  it('normalizes select values from different sources', () => {
    const option = { label: 'Roma', value: 'RM' };

    expect(normalizeSelectValue(option)).toBe(option);
    expect(normalizeSelectValue('RM', [option])).toEqual(option);
    expect(normalizeSelectValue('Roma', [option])).toEqual(option);
    expect(normalizeSelectValue(undefined)).toBeNull();
    expect(normalizeSelectValue('')).toBeNull();
    expect(normalizeSelectValue('   ')).toBeNull();
    expect(normalizeSelectValue('MILANO', [option])).toBeNull();
  });

  it('builds validation schemas for required, optional and recursive fields', () => {
    const schema = BuildFormSchema([
      createField({
        name: 'comune',
        htmlRender: RenderType.SINGLESELECT,
        required: true,
        extraAttr: { error_messag: 'Comune obbligatorio' }
      }),
      createField({
        name: 'causale',
        htmlRender: RenderType.TEXT,
        required: true,
        regex: '^[A-Z]+$',
        extraAttr: { error_messag: 'Formato non valido' }
      }),
      createField({
        name: 'tags',
        htmlRender: RenderType.MULTISELECT,
        required: true,
        extraAttr: { error_messag: 'Seleziona almeno un valore' }
      }),
      createField({
        name: 'amount',
        htmlRender: RenderType.CURRENCY,
        required: true,
        extraAttr: { error_messag: 'Importo non valido' }
      })
    ]);

    expect(
      schema.safeParse({
        comune: { label: 'Roma', value: 'RM' },
        causale: 'RINNOVO',
        tags: ['A'],
        amount: 100
      }).success
    ).toBe(true);

    const invalidResult = schema.safeParse({
      comune: null,
      causale: 'rinovo',
      tags: [],
      amount: -1
    });

    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      const messages = invalidResult.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Comune obbligatorio');
      expect(messages).toContain('Formato non valido');
      expect(messages).toContain('Seleziona almeno un valore');
      expect(messages).toContain('Importo non valido');
    }
  });

  it('resets schema state between invocations', () => {
    const firstSchema = BuildFormSchema([createField({ name: 'first', required: true })]);
    expect(firstSchema.safeParse({ first: 'ok' }).success).toBe(true);

    const secondSchema = BuildFormSchema([createField({ name: 'second', required: true })]);
    expect(secondSchema.safeParse({ second: 'ok' }).success).toBe(true);
    expect(secondSchema.safeParse({ first: 'ok' }).success).toBe(false);
  });

  it('supports optional number, multi-select and plain text fields', () => {
    const schema = BuildFormSchema([
      createField({
        name: 'optionalAmount',
        htmlRender: RenderType.CURRENCY,
        required: false
      }),
      createField({
        name: 'optionalTags',
        htmlRender: RenderType.MULTISELECT,
        required: false
      }),
      createField({
        name: 'optionalNote',
        htmlRender: RenderType.TEXT,
        required: false
      })
    ]);

    expect(
      schema.safeParse({
        optionalAmount: 0,
        optionalTags: [],
        optionalNote: ''
      }).success
    ).toBe(true);
  });

  it('builds form state for text, multi-select, select and nested fields without leaking previous state', () => {
    const firstState = BuildFormState([
      createField({
        name: 'comune',
        htmlRender: RenderType.SINGLESELECT,
        enumerationList: ['Roma', 'Milano'],
        defaultValue: 'Roma'
      }),
      createField({
        name: 'tags',
        htmlRender: RenderType.MULTISELECT
      }),
      createField({
        name: 'wrapper',
        htmlRender: RenderType.MULTIFIELD,
        subfields: [
          createField({
            name: 'note',
            defaultValue: 'memo'
          })
        ]
      })
    ]);

    expect(firstState).toEqual({
      note: 'memo'
    });

    const secondState = BuildFormState([
      createField({
        name: 'provincia',
        htmlRender: RenderType.DYNAMIC_SELECT,
        defaultValue: undefined
      })
    ]);

    expect(secondState).toEqual({
      provincia: null
    });
    expect(secondState).not.toHaveProperty('comune');
  });

  it('returns the expected field bean for each supported render type', () => {
    const supportedRenderTypes = [
      RenderType.TAB,
      RenderType.SINGLESELECT,
      RenderType.DYNAMIC_SELECT,
      RenderType.MULTISELECT,
      RenderType.DATE,
      RenderType.NONE,
      RenderType.TEXT,
      RenderType.MULTIFIELD,
      RenderType.CURRENCY,
      RenderType.CURRENCY_LABEL,
      RenderType.DYNAMIC_AMOUNT_LABEL
    ];

    supportedRenderTypes.forEach((renderType, index) => {
      const element = BuildInput(
        createField({
          name: 'field-' + String(index),
          htmlRender: renderType
        }),
        [],
        'customAmount'
      );

      expect(React.isValidElement(element)).toBe(true);
    });

    const unsupportedElement = BuildInput(
      createField({
        name: 'unknown',
        htmlRender: 'UNKNOWN' as RenderType
      })
    );

    expect(unsupportedElement).toBeNull();
  });

  it('builds sorted inputs and appends the implicit importo field', () => {
    const sourceFields = [
      createField({
        name: 'second',
        renderableOrder: 2
      }),
      createField({
        name: 'first',
        renderableOrder: 1
      })
    ];

    const builtInputs = BuildFormInputs(sourceFields);

    expect(sourceFields).toHaveLength(3);
    expect(builtInputs).toHaveLength(3);
    expect(getElementName(builtInputs[0])).toBe('importo');
    expect(getElementName(builtInputs[1])).toBe('first');
    expect(getElementName(builtInputs[2])).toBe('second');
    expect(builtInputs.some((element) => getElementName(element) === 'importo')).toBe(true);
  });

  it('does not append the implicit importo field when amountFieldName is provided', () => {
    const builtInputs = BuildFormInputs(
      [
        createField({
          name: 'existing',
          renderableOrder: 1
        })
      ],
      'customAmount'
    );

    expect(builtInputs).toHaveLength(1);
    expect(getElementName(builtInputs[0])).toBe('existing');
  });
});
