import React from 'react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { fireEvent, render, screen, waitFor } from '__tests__/renderers';
import DinamicForm from './index';
import FormContext from '../FormContext';

import {
  RenderType,
  SpontaneousFormField,
  SpontaneousFormItemDTO
} from '../../../../generated/data-contracts';

const orgFiscalCodePlaceholder = '$' + '{orgFiscalCode.value}';
const dynamicAmountSource =
  'https://test.it/pu/cie/public/organizations/' + orgFiscalCodePlaceholder + '/amount';

const dynamicSelectField: SpontaneousFormField = {
  name: 'orgFiscalCode',
  required: true,
  htmlRender: RenderType.DYNAMIC_SELECT,
  htmlLabel: 'Cerca il comune',
  defaultValue: '',
  insertableOrder: 1,
  indexable: false,
  renderableOrder: 1,
  searchableOrder: 0,
  listableOrder: 0,
  insertable: true,
  renderable: true,
  searchable: false,
  listable: false,
  association: false,
  detailLink: false,
  minOccurences: 1,
  maxOccurences: 1,
  source: 'https://test.it/pu/cie/public/organizations'
};

const amountSourceParams: SpontaneousFormItemDTO[] = [
  {
    name: 'debtPositionTypeOrgCode',
    key: 'debtType.code'
  }
];

const dynamicAmountField: SpontaneousFormField = {
  name: 'costo',
  required: true,
  htmlRender: RenderType.DYNAMIC_AMOUNT_LABEL,
  htmlLabel: 'Importo',
  defaultValue: '0',
  insertableOrder: 2,
  indexable: false,
  renderableOrder: 2,
  searchableOrder: 0,
  listableOrder: 0,
  insertable: true,
  renderable: true,
  searchable: false,
  listable: false,
  association: false,
  detailLink: false,
  minOccurences: 1,
  maxOccurences: 1,
  source: dynamicAmountSource,
  sourceParams: amountSourceParams
};

describe('DinamicForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetches the dynamic amount only once after selecting an organization', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url === 'https://test.it/pu/cie/public/organizations?') {
        return Promise.resolve({
          json: vi.fn().mockResolvedValue({
            result: [{ label: 'Comune di Test', value: 'CF123' }]
          })
        });
      }

      if (
        url ===
        'https://test.it/pu/cie/public/organizations/CF123/amount?debtPositionTypeOrgCode=TYPE01'
      ) {
        return Promise.resolve({
          json: vi.fn().mockResolvedValue({ result: 2500 })
        });
      }

      throw new Error('Unexpected fetch URL: ' + url);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <React.StrictMode>
        <Formik
          initialValues={{
            debtType: { code: 'TYPE01' },
            orgFiscalCode: null,
            costo: 0,
            amount: 0,
            description: ''
          }}
          onSubmit={vi.fn()}>
          <DinamicForm
            fieldBeans={[dynamicSelectField, dynamicAmountField]}
            amountFieldName="costo"
          />
        </Formik>
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('https://test.it/pu/cie/public/organizations?');
    });

    const input = screen.getByLabelText('Cerca il comune');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Comune' } });

    const option = await screen.findByText('Comune di Test');
    fireEvent.click(option);

    await waitFor(() => {
      const amountCalls = fetchMock.mock.calls.filter(([url]) =>
        String(url).includes('/organizations/CF123/amount')
      );

      expect(amountCalls).toHaveLength(1);
    });
  });

  it('reset the form only when the user goes back to the previous step', async () => {
    const fieldBeans: SpontaneousFormField[] = [dynamicSelectField];

    const initialValues = {
      orgFiscalCode: { label: 'Keep me', value: 'keep-me' }
    };

    // Case 1: direction > 0 (forward) - SHOULD RESET
    const { unmount } = render(
      <FormContext.Provider value={{ step: { current: 2, previous: 1 } } as any}>
        <Formik initialValues={initialValues} onSubmit={vi.fn()}>
          <DinamicForm fieldBeans={fieldBeans} />
        </Formik>
      </FormContext.Provider>
    );

    // expect label search input to be empty after mount-reset
    await waitFor(() => {
      expect(screen.getByLabelText('Cerca il comune')).toHaveValue('');
    });

    unmount();

    // Case 2: direction < 0 (backward) - SHOULD NOT RESET
    render(
      <FormContext.Provider value={{ step: { current: 1, previous: 2 } } as any}>
        <Formik initialValues={initialValues} onSubmit={vi.fn()}>
          <DinamicForm fieldBeans={fieldBeans} />
        </Formik>
      </FormContext.Provider>
    );

    // Initial value is preserved
    await waitFor(() => {
      expect(screen.getByLabelText('Cerca il comune')).toHaveValue('Keep me');
    });
  });

});
