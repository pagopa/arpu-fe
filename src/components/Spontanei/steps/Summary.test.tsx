import React from 'react';
import { render, screen, cleanup } from '__tests__/renderers';
import '@testing-library/jest-dom';
import Summary from './Summary';
import FormContext, { FormContextType } from '../FormContext';
import { Formik } from 'formik';
import { PaymentNoticeInfo } from '../index';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  OrganizationsWithSpontaneousDTO,
  PersonEntityType
} from '../../../../generated/data-contracts';

// Mock sub-components
vi.mock('../Controls', () => ({
  default: vi.fn(() => <div data-testid="controls-mock">Controls</div>)
}));

// Mock utils
vi.mock('utils', () => ({
  default: {
    converters: {
      toEuro: vi.fn((cents: number) => `€ ${(cents / 100).toFixed(2).replace('.', ',')}`)
    }
  }
}));

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: { current: 3, previous: 2 },
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  setSummaryFields: vi.fn(),
  submitFields: [],
  setSubmitFields: vi.fn(),
  summaryFields: [],
  amountFieldName: '',
  setAmountFieldName: vi.fn(),
  causaleHasJoinTemplate: false,
  setCausaleHasJoinTemplate: vi.fn(),
  ...overrides
});

const initialValues: PaymentNoticeInfo = {
  org: {
    organizationId: 123,
    orgName: 'Test Org',
    orgFiscalCode: '12345678901',
    ipaCode: 'IPA123'
  } as OrganizationsWithSpontaneousDTO,
  debtType: {
    debtPositionTypeOrgId: 456,
    organizationId: 123,
    code: 'DEBT_CODE',
    description: 'Test Debt Type'
  } as DebtPositionTypeOrgsWithSpontaneousDTO,
  fullName: 'Mario Rossi',
  fiscalCode: 'RSSMRA80A01H501U',
  entityType: PersonEntityType.F,
  amount: 10,
  description: 'Test Description'
};

const renderSummary = (
  contextValue: Partial<FormContextType> = {},
  formikValues: Partial<PaymentNoticeInfo> = initialValues
) => {
  const defaultContext = getDefaultContext(contextValue);
  const mergedValues = { ...initialValues, ...formikValues } as PaymentNoticeInfo;
  return render(
    <Formik initialValues={mergedValues} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <Summary />
      </FormContext.Provider>
    </Formik>
  );
};

describe('Summary Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders all summary sections', () => {
    renderSummary();
    expect(screen.getByTestId('spontanei-step3-summary')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step3-org-and-service-summary')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step3-debtor-summary')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step3-payment-summary')).toBeInTheDocument();
  });

  it('displays organization and service info correctly', () => {
    renderSummary();
    expect(screen.getByTestId('summary-org-name-value')).toHaveTextContent('Test Org');
    expect(screen.getByTestId('summary-org-code-value')).toHaveTextContent('12345678901');
    expect(screen.getByTestId('summary-service-name-value')).toHaveTextContent('Test Debt Type');
  });

  it('displays debtor data for fiscal person (Type F)', () => {
    renderSummary(
      {},
      {
        entityType: PersonEntityType.F,
        fullName: 'Mario Rossi',
        fiscalCode: 'RSSMRA80A01H501U',
        email: 'mario.rossi@example.com'
      }
    );

    expect(screen.getByTestId('summary-debtor-name-value')).toHaveTextContent('Mario Rossi');
    expect(screen.getByTestId('summary-debtor-code-value')).toHaveTextContent('RSSMRA80A01H501U');
    expect(screen.getByTestId('summary-debtor-email-value')).toHaveTextContent(
      'mario.rossi@example.com'
    );
  });

  it('displays debtor data for corporate entity (Type G)', () => {
    renderSummary(
      {},
      {
        entityType: PersonEntityType.G,
        fullName: 'Test Company S.r.l.',
        fiscalCode: '01234567890',
        email: 'info@testcompany.it'
      }
    );

    expect(screen.getByTestId('summary-debtor-name-value')).toHaveTextContent(
      'Test Company S.r.l.'
    );
    expect(screen.getByTestId('summary-debtor-code-value')).toHaveTextContent('01234567890');
    expect(screen.getByTestId('summary-debtor-email-value')).toHaveTextContent(
      'info@testcompany.it'
    );
  });

  it('does not render email if not provided', () => {
    renderSummary({}, { email: '' });
    expect(screen.queryByTestId('summary-debtor-email')).not.toBeInTheDocument();
  });

  it('displays payment summary correctly with standard form', () => {
    renderSummary(
      {},
      {
        amount: 5050,
        description: 'Monthly Fee'
      }
    );

    // Pagamento on-the-fly ${formType === 'CUSTOM' ? debtType.value?.description : description.value}
    expect(screen.getByTestId('summary-payment-description-value')).toHaveTextContent(
      'Monthly Fee'
    );
    expect(screen.getByTestId('summary-payment-amount-value')).toHaveTextContent('€ 50,50');
  });

  it('displays payment summary correctly with custom form and calls setUserDescription', () => {
    renderSummary(
      {},
      {
        debtType: {
          description: 'Test Description'
        } as DebtPositionTypeOrgsWithSpontaneousDTO,
        amount: 100
      }
    );

    expect(screen.getByTestId('summary-payment-description-value')).toHaveTextContent(
      'Test Description'
    );
  });

  it('renders controls', () => {
    renderSummary();
    expect(screen.getByTestId('controls-mock')).toBeInTheDocument();
  });

  describe('with summaryFields context filtering', () => {
    it('only renders sections included in summaryFields', () => {
      renderSummary({
        summaryFields: ['fullName', 'amount']
      });

      // Included
      expect(screen.getByTestId('spontanei-step3-debtor-summary')).toBeInTheDocument();
      expect(screen.getByTestId('spontanei-step3-payment-summary')).toBeInTheDocument();
      expect(screen.getByTestId('summary-debtor-name')).toBeInTheDocument();
      expect(screen.getByTestId('summary-payment-amount')).toBeInTheDocument();

      // NOT included
      expect(screen.queryByTestId('spontanei-step3-org-and-service-summary')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-debtor-code')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-payment-description')).not.toBeInTheDocument();
    });

    it('returns null if filtered summary fields are empty for a section', () => {
      renderSummary({
        summaryFields: ['someOtherField']
      });

      expect(screen.queryByTestId('spontanei-step3-org-and-service-summary')).not.toBeInTheDocument();
      expect(screen.queryByTestId('spontanei-step3-debtor-summary')).not.toBeInTheDocument();
      expect(screen.queryByTestId('spontanei-step3-payment-summary')).not.toBeInTheDocument();
    });
  });

  describe('ExtraSummaryFields', () => {
    it('renders extra fields correctly', () => {
      renderSummary(
        {
          summaryFields: ['customField1', 'customField2']
        },
        {
          // We need custom fields in the formik values
          ...initialValues,
          // @ts-ignore - custom fields not in PaymentNoticeInfo but expected by flattenObject and ExtraSummaryFields
          customField1: 'Value 1',
          customField2: 'Value 2'
        }
      );

      expect(screen.getByTestId('spontanei-step4-extra-summary')).toBeInTheDocument();
      expect(screen.getByTestId('summary-extra-customField1-value')).toHaveTextContent('Value 1');
      expect(screen.getByTestId('summary-extra-customField2-value')).toHaveTextContent('Value 2');
    });

    it('converts value to Euro if it matches amountFieldName', () => {
      renderSummary(
        {
          summaryFields: ['extraAmount'],
          amountFieldName: 'extraAmount'
        },
        {
          ...initialValues,
          // @ts-ignore
          extraAmount: 1250
        }
      );

      expect(screen.getByTestId('summary-extra-extraAmount-value')).toHaveTextContent('€ 12,50');
    });
  });

  it('displays debt type description in payment summary when causaleHasJoinTemplate is true', () => {
    renderSummary(
      {
        causaleHasJoinTemplate: true
      },
      {
        debtType: {
          description: 'Debt Type Description'
        } as DebtPositionTypeOrgsWithSpontaneousDTO,
        description: 'User Description'
      }
    );

    expect(screen.getByTestId('summary-payment-description-value')).toHaveTextContent(
      'Debt Type Description'
    );
  });
});
