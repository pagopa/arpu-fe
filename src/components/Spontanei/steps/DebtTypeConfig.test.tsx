import React from 'react';
import { render, screen, cleanup } from '__tests__/renderers';
import '@testing-library/jest-dom';
import DebtTypeConfig from './DebtTypeConfig';
import FormContext, { FormContextType } from '../FormContext';
import { Formik } from 'formik';
import utils from 'utils';
import { Mock } from 'vitest';
import { PaymentNoticeInfo } from '../index';
import { PersonEntityType } from '../../../../generated/data-contracts';

// Mock sub-components
vi.mock('../StandarForm/StandardForm', () => ({
  default: vi.fn(({ fixedAmount, hasFlagAnonymousFiscalCode }) => (
    <div data-testid="standard-form">
      Standard Form {fixedAmount && `Fixed: ${fixedAmount}`}{' '}
      {hasFlagAnonymousFiscalCode && 'Anonymous FC'}
    </div>
  ))
}));

vi.mock('../DinamicForm/CustomForm', () => ({
  default: vi.fn(({ fields, amountFieldName }) => (
    <div data-testid="custom-form">
      Custom Form Fields: {fields.length} AmountField: {amountFieldName}
    </div>
  ))
}));

vi.mock('../ExternalUrlForm/ExternalUrlForm', () => ({
  default: vi.fn(({ link }) => (
    <div data-testid="external-url-form">External Form Link: {link}</div>
  ))
}));

// Mock utils
vi.mock('utils', () => ({
  default: {
    storage: {
      app: { getBrokerId: vi.fn() },
      user: { isAnonymous: vi.fn() }
    },
    loaders: {
      public: {
        getPublicDebtPositionTypeOrgsWithSpontaneousDetail: vi.fn()
      },
      getDebtPositionTypeOrgsWithSpontaneousDetail: vi.fn()
    }
  }
}));

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: 0,
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  formType: null,
  setFormType: vi.fn(),
  userDescription: null,
  setUserDescription: vi.fn(),
  ...overrides
});

const initialValues: PaymentNoticeInfo = {
  org: { organizationId: 'org123' } as any,
  debtType: { debtPositionTypeOrgId: 'debt123' } as any,
  fullName: '',
  fiscalCode: '',
  entityType: PersonEntityType.F,
  amount: 0,
  description: ''
};

const renderDebtTypeConfig = (
  contextValue: Partial<FormContextType> = {},
  formikValues: Partial<PaymentNoticeInfo> = initialValues
) => {
  const defaultContext = getDefaultContext(contextValue);
  const mergedValues = { ...initialValues, ...formikValues } as PaymentNoticeInfo;
  return render(
    <Formik initialValues={mergedValues} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <DebtTypeConfig />
      </FormContext.Provider>
    </Formik>
  );
};

describe('DebtTypeConfig Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.storage.app.getBrokerId as Mock).mockReturnValue('broker123');
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
  });

  it('throws error if required parameters are missing', () => {
    // Suppress console.error for this test as we expect an error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      renderDebtTypeConfig({}, { org: null, debtType: null } as Partial<PaymentNoticeInfo>)
    ).toThrow('Missing required parameters: organizationId, debtPositionTypeOrgId, or brokerId');

    spy.mockRestore();
  });

  it('calls public loader when user is anonymous', () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    (
      utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail as Mock
    ).mockReturnValue({ data: {} });

    renderDebtTypeConfig();

    expect(
      utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail
    ).toHaveBeenCalledWith('broker123', 'org123', 'debt123');
  });

  it('calls private loader when user is authenticated', () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: {}
    });

    renderDebtTypeConfig();

    expect(utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail).toHaveBeenCalledWith(
      'broker123',
      'org123',
      'debt123'
    );
  });

  it('updates formType in context and clears it on unmount', () => {
    const setFormType = vi.fn();
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: { formType: 'STANDARD' }
    });

    const { unmount } = renderDebtTypeConfig({ setFormType });

    expect(setFormType).toHaveBeenCalledWith('STANDARD');

    unmount();
    expect(setFormType).toHaveBeenCalledWith(null);
  });

  it('renders StandardForm for STANDARD type', () => {
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: { formType: 'STANDARD', flagAnonymousFiscalCode: true }
    });

    renderDebtTypeConfig();

    expect(screen.getByTestId('standard-form')).toBeInTheDocument();
    expect(screen.getByText(/Anonymous FC/)).toBeInTheDocument();
  });

  it('renders StandardForm with fixedAmount for PRESET_AMOUNT type', () => {
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: { formType: 'PRESET_AMOUNT', amountCents: 1000 }
    });

    renderDebtTypeConfig();

    expect(screen.getByTestId('standard-form')).toBeInTheDocument();
    expect(screen.getByText(/Fixed: 1000/)).toBeInTheDocument();
  });

  it('renders CustomForm for CUSTOM type', () => {
    const mockFields = [{ id: 1, name: 'field1' }];
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: {
        formType: 'CUSTOM',
        formCustom: {
          structure: {
            fields: mockFields,
            amountFieldName: 'amount'
          }
        }
      }
    });

    renderDebtTypeConfig();

    expect(screen.getByTestId('custom-form')).toBeInTheDocument();
    expect(screen.getByText(/Fields: 1/)).toBeInTheDocument();
    expect(screen.getByText(/AmountField: amount/)).toBeInTheDocument();
  });

  it('renders ExternalUrlForm for EXTERNAL_URL type', () => {
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: { formType: 'EXTERNAL_URL', externalPaymentUrl: 'https://example.com' }
    });

    renderDebtTypeConfig();

    expect(screen.getByTestId('external-url-form')).toBeInTheDocument();
    expect(screen.getByText(/Link: https:\/\/example.com/)).toBeInTheDocument();
  });
});
