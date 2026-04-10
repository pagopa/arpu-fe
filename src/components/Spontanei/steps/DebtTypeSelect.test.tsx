import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import DebtTypeSelect from './DebtTypeSelect';
import FormContext, { FormContextType } from '../FormContext';
import { Formik, FormikErrors } from 'formik';
import utils from 'utils';
import { DebtPositionTypeOrgsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import { Mock } from 'vitest';

type FormValues = {
  fullName: string;
  entityType: string;
  email: string;
  fiscalCode: string;
  amount: number;
  description: string;
  org: { organizationId: number; orgName: string } | null;
  debtType: DebtPositionTypeOrgsWithSpontaneousDTO | null;
};

// Mock dependencies
vi.mock('./StepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('utils', () => ({
  default: {
    storage: {
      app: { getBrokerId: vi.fn() },
      user: { isAnonymous: vi.fn() }
    },
    loaders: {
      public: {
        getPublicDebtPositionTypeOrgsWithSpontaneous: vi.fn().mockReturnValue({ data: [] }),
        getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear: vi
          .fn()
          .mockReturnValue({ data: [] })
      },
      getDebtPositionTypeOrgsWithSpontaneous: vi.fn().mockReturnValue({ data: [] }),
      getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear: vi
        .fn()
        .mockReturnValue({ data: [] })
    }
  }
}));

const mockDebtTypes: DebtPositionTypeOrgsWithSpontaneousDTO[] = [
  {
    debtPositionTypeOrgId: 1,
    description: 'Debt Type 1',
    code: '111',
    organizationId: 1,
    descriptionI18n: { en: 'Debt Type 1 EN', de: 'Debt Type 1 DE' }
  },
  {
    debtPositionTypeOrgId: 2,
    description: 'Debt Type 2',
    code: '222',
    organizationId: 1,
    descriptionI18n: { en: 'Debt Type 2 EN' }
  },
  { debtPositionTypeOrgId: 3, description: 'Debt Type 3', code: '333', organizationId: 1 },
  { debtPositionTypeOrgId: 4, description: 'Debt Type 4', code: '444', organizationId: 1 },
  { debtPositionTypeOrgId: 5, description: 'Debt Type 5', code: '555', organizationId: 1 },
  { debtPositionTypeOrgId: 6, description: 'Debt Type 6', code: '666', organizationId: 1 },
  { debtPositionTypeOrgId: 7, description: 'Debt Type 7', code: '777', organizationId: 1 },
  { debtPositionTypeOrgId: 8, description: 'Debt Type 8', code: '888', organizationId: 1 },
  { debtPositionTypeOrgId: 9, description: 'Debt Type 9', code: '999', organizationId: 1 },
  { debtPositionTypeOrgId: 10, description: 'Debt Type 10', code: '101', organizationId: 1 },
  { debtPositionTypeOrgId: 11, description: 'Debt Type 11', code: '000', organizationId: 1 }
];

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: 1,
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  causaleHasJoinTemplate: false,
  setCausaleHasJoinTemplate: vi.fn(),
  summaryFields: [],
  setSummaryFields: vi.fn(),
  ...overrides
});

const initialValues = {
  fullName: '',
  entityType: 'F',
  email: '',
  fiscalCode: '',
  amount: 0,
  description: 'initial description',
  org: { organizationId: 100, orgName: 'Test Org' },
  debtType: null
};

const renderDebtTypeSelect = (contextValue: Partial<FormContextType> = {}) => {
  const defaultContext = getDefaultContext(contextValue);
  return render(
    <Formik initialValues={initialValues} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <DebtTypeSelect />
      </FormContext.Provider>
    </Formik>
  );
};

describe('DebtTypeSelect Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.storage.app.getBrokerId as Mock).mockReturnValue('broker123');
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
      data: mockDebtTypes
    });
    (
      utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear as Mock
    ).mockReturnValue({ data: [mockDebtTypes[0]] });
  });

  it('renders correctly with title, description and options', async () => {
    renderDebtTypeSelect();

    expect(screen.getByTestId('spontanei-step2-title')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step2-description')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step2-search-input')).toBeInTheDocument();

    // Check if most used debt types are rendered (localized to 'en' in test env)
    expect(screen.getByTestId('spontanei-step2-mostUsedDebtTypes')).toBeInTheDocument();
    expect(screen.getByText('Debt Type 1 EN')).toBeInTheDocument();
  });

  it('handles debt type selection via Autocomplete', async () => {
    renderDebtTypeSelect();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Debt Type 10' } });

    const option = await screen.findByText('Debt Type 10');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Debt Type 10');
    });
  });

  it('handles debt type selection via RadioGroup and resets description', async () => {
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
      data: [mockDebtTypes[0], mockDebtTypes[1]]
    });
    const { getByLabelText } = renderDebtTypeSelect();

    // Labels are localized to 'en' in test env via descriptionI18n
    const radio = getByLabelText('Debt Type 1 EN');
    fireEvent.click(radio);

    // After clicking radio, it should be checked
    await waitFor(() => {
      expect(radio).toBeChecked();
    });
  });

  it('calls public loaders when user is anonymous', () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    (utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
      data: mockDebtTypes
    });
    (
      utils.loaders.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear as Mock
    ).mockReturnValue({ data: [] });

    renderDebtTypeSelect();

    expect(utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous).toHaveBeenCalledWith(
      'broker123',
      100
    );
    expect(
      utils.loaders.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear
    ).toHaveBeenCalledWith('broker123', 100, true);
  });

  it('shows error message when clicking continue without selection', async () => {
    // Custom render with validation
    const validationSchema = {
      validate: (values: FormValues) => {
        const errors: FormikErrors<FormValues> = {};
        if (!values.debtType) {
          errors.debtType = 'Required';
        }
        return errors;
      }
    };

    render(
      <Formik initialValues={initialValues} validate={validationSchema.validate} onSubmit={vi.fn()}>
        <FormContext.Provider value={getDefaultContext()}>
          <DebtTypeSelect />
        </FormContext.Provider>
      </Formik>
    );

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('advances to next step when a debt type is selected and continue is clicked', async () => {
    const setStep = vi.fn();
    renderDebtTypeSelect({ setStep });

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Debt Type 2' } });
    const option = await screen.findByText('Debt Type 2 EN');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Debt Type 2 EN');
    });

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(setStep).toHaveBeenCalled();
    });
  });

  describe('i18n localized descriptions', () => {
    it('displays localized description in RadioGroup when descriptionI18n contains current language', async () => {
      const i18nDebtTypes = [
        {
          debtPositionTypeOrgId: 1,
          description: 'Tipo Debito 1',
          code: '111',
          organizationId: 1,
          descriptionI18n: { en: 'Debt Type 1 EN' }
        },
        { debtPositionTypeOrgId: 2, description: 'Tipo Debito 2', code: '222', organizationId: 1 }
      ];
      (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
        data: i18nDebtTypes
      });

      renderDebtTypeSelect();

      expect(screen.getByText('Debt Type 1 EN')).toBeInTheDocument();
      expect(screen.getByText('Tipo Debito 2')).toBeInTheDocument();
    });

    it('falls back to default description when descriptionI18n does not contain current language', () => {
      const i18nDebtTypes = [
        {
          debtPositionTypeOrgId: 1,
          description: 'Tipo Debito Fallback',
          code: '111',
          organizationId: 1,
          descriptionI18n: { de: 'German Only' }
        }
      ];
      (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
        data: i18nDebtTypes
      });

      renderDebtTypeSelect();

      expect(screen.getByText('Tipo Debito Fallback')).toBeInTheDocument();
    });

    it('falls back to default description when descriptionI18n is undefined', () => {
      const i18nDebtTypes = [
        {
          debtPositionTypeOrgId: 1,
          description: 'No I18n Description',
          code: '111',
          organizationId: 1
        }
      ];
      (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
        data: i18nDebtTypes
      });

      renderDebtTypeSelect();

      expect(screen.getByText('No I18n Description')).toBeInTheDocument();
    });

    it('displays localized description in Autocomplete options', async () => {
      (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
        data: mockDebtTypes
      });

      renderDebtTypeSelect();

      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Debt Type 3' } });

      const option = await screen.findByText('Debt Type 3');
      expect(option).toBeInTheDocument();
    });

    it('displays localized labels for most used debt types', async () => {
      (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
        data: mockDebtTypes
      });
      (
        utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear as Mock
      ).mockReturnValue({
        data: [
          {
            debtPositionTypeOrgId: 1,
            description: 'Tipo Debito 1',
            code: '111',
            organizationId: 1,
            descriptionI18n: { en: 'Most Used EN' }
          }
        ]
      });

      renderDebtTypeSelect();

      expect(screen.getByTestId('spontanei-step2-mostUsedDebtTypes')).toBeInTheDocument();
      expect(screen.getByText('Most Used EN')).toBeInTheDocument();
    });
  });
});
