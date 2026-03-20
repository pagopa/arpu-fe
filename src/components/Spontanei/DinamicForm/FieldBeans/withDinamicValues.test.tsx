import React from 'react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { render, waitFor } from '__tests__/renderers';
import { RenderType, SpontaneousFormItemDTO } from '../../../../../generated/data-contracts';

const { flattenObjectMock, buildDinamicValueMock, getPlaceholdersMock } = vi.hoisted(() => {
  const extractTemplateTokens = (template: string): Array<{ token: string; key: string }> => {
    const tokens: Array<{ token: string; key: string }> = [];
    let currentIndex = 0;

    while (currentIndex < template.length) {
      const openBraceIndex = template.indexOf('{', currentIndex);

      if (openBraceIndex === -1) {
        break;
      }

      const closeBraceIndex = template.indexOf('}', openBraceIndex + 1);

      if (closeBraceIndex === -1) {
        break;
      }

      const tokenStartIndex =
        openBraceIndex > 0 && template[openBraceIndex - 1] === '$'
          ? openBraceIndex - 1
          : openBraceIndex;
      const key = template.slice(openBraceIndex + 1, closeBraceIndex);

      if (!key.includes('{') && !key.includes('}')) {
        tokens.push({
          token: template.slice(tokenStartIndex, closeBraceIndex + 1),
          key
        });
      }

      currentIndex = closeBraceIndex + 1;
    }

    return tokens;
  };

  const flattenObject = (
    obj: Record<string, unknown>,
    delimiter = '.',
    prefix = ''
  ): Record<string, string | number> =>
    Object.keys(obj).reduce(
      (acc, key) => {
        const pre = prefix.length ? prefix + delimiter : '';
        const value = obj[key];
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
          Object.assign(acc, flattenObject(value as Record<string, unknown>, delimiter, pre + key));
        } else {
          acc[pre + key] = value as string | number;
        }
        return acc;
      },
      {} as Record<string, string | number>
    );

  const buildDinamicValue = (template: string, templateVars: Record<string, string>) =>
    extractTemplateTokens(template).reduce(
      (result, { token, key }) => result.split(token).join(String(templateVars[key])),
      template
    );

  const getPlaceholders = (template: string): string[] =>
    Array.from(new Set(extractTemplateTokens(template).map(({ key }) => key)));

  return {
    flattenObjectMock: flattenObject,
    buildDinamicValueMock: buildDinamicValue,
    getPlaceholdersMock: getPlaceholders
  };
});

const orgFiscalCodePlaceholder = '$' + '{orgFiscalCode.value}';
const dynamicAmountSource =
  'https://test.it/pu/cie/public/organizations/' + orgFiscalCodePlaceholder + '/amount';

vi.mock('../config', () => ({
  buildDinamicValue: buildDinamicValueMock,
  computeValue: vi.fn(),
  flattenObject: flattenObjectMock,
  getPlaceholders: getPlaceholdersMock
}));

import DynamicAmountLabel from './DYNAMIC_AMOUNT_LABEL';

describe('withDinamicValues', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls fetch for each component instance with the same dynamic source', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ result: 2500 })
    });

    vi.stubGlobal('fetch', fetchMock);

    const sourceParams: SpontaneousFormItemDTO[] = [
      {
        name: 'debtPositionTypeOrgCode',
        key: 'debtType.code'
      }
    ];

    render(
      <Formik
        initialValues={{
          orgFiscalCode: { label: 'Comune di Test', value: 'CF123' },
          debtType: { code: 'TYPE01' },
          costo: 0,
          amount: 0,
          description: ''
        }}
        onSubmit={vi.fn()}>
        <>
          <DynamicAmountLabel
            name="costo"
            required
            htmlRender={RenderType.DYNAMIC_AMOUNT_LABEL}
            htmlLabel="Importo"
            defaultValue="0"
            insertableOrder={0}
            indexable={false}
            renderableOrder={0}
            searchableOrder={0}
            listableOrder={0}
            insertable
            renderable
            searchable={false}
            listable={false}
            association={false}
            detailLink={false}
            minOccurences={1}
            maxOccurences={1}
            source={dynamicAmountSource}
            sourceParams={sourceParams}
            amountFieldName="costo"
          />
          <DynamicAmountLabel
            name="costoBis"
            required
            htmlRender={RenderType.DYNAMIC_AMOUNT_LABEL}
            htmlLabel="Importo bis"
            defaultValue="0"
            insertableOrder={1}
            indexable={false}
            renderableOrder={1}
            searchableOrder={0}
            listableOrder={0}
            insertable
            renderable
            searchable={false}
            listable={false}
            association={false}
            detailLink={false}
            minOccurences={1}
            maxOccurences={1}
            source={dynamicAmountSource}
            sourceParams={sourceParams}
            amountFieldName="costoBis"
          />
        </>
      </Formik>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://test.it/pu/cie/public/organizations/CF123/amount?debtPositionTypeOrgCode=TYPE01'
    );
  });

  it('calls fetch again on StrictMode remount for the same dynamic source', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ result: 1750 })
    });

    vi.stubGlobal('fetch', fetchMock);

    const sourceParams: SpontaneousFormItemDTO[] = [
      {
        name: 'debtPositionTypeOrgCode',
        key: 'debtType.code'
      }
    ];

    render(
      <React.StrictMode>
        <Formik
          initialValues={{
            orgFiscalCode: { label: 'Comune di Remount', value: 'CF999' },
            debtType: { code: 'TYPE02' },
            costo: 0,
            amount: 0,
            description: ''
          }}
          onSubmit={vi.fn()}>
          <DynamicAmountLabel
            name="costo"
            required
            htmlRender={RenderType.DYNAMIC_AMOUNT_LABEL}
            htmlLabel="Importo"
            defaultValue="0"
            insertableOrder={0}
            indexable={false}
            renderableOrder={0}
            searchableOrder={0}
            listableOrder={0}
            insertable
            renderable
            searchable={false}
            listable={false}
            association={false}
            detailLink={false}
            minOccurences={1}
            maxOccurences={1}
            source={dynamicAmountSource}
            sourceParams={sourceParams}
            amountFieldName="costo"
          />
        </Formik>
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://test.it/pu/cie/public/organizations/CF999/amount?debtPositionTypeOrgCode=TYPE02'
    );
  });
});
