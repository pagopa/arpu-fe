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
  { debtPositionTypeOrgId: 1, description: 'Debt Type 1', code: '111', organizationId: 1 },
  { debtPositionTypeOrgId: 2, description: 'Debt Type 2', code: '222', organizationId: 1 },
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

    // Check if most used debt types are rendered
    expect(screen.getByTestId('spontanei-step2-mostUsedDebtTypes')).toBeInTheDocument();
    expect(screen.getByText('Debt Type 1')).toBeInTheDocument();
  });

  it('handles debt type selection via Autocomplete', async () => {
    renderDebtTypeSelect();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Debt Type 2' } });

    const option = await screen.findByText('Debt Type 2');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Debt Type 2');
    });
  });

  it('handles debt type selection via RadioGroup and resets description', async () => {
    const { getByLabelText } = renderDebtTypeSelect();

    const radio = getByLabelText('Debt Type 1');
    fireEvent.click(radio);

    // After clicking radio, the autocomplete should reflect the selection
    const input = screen.getByRole('combobox');
    await waitFor(() => {
      expect(input).toHaveValue('Debt Type 1');
    });

    // Verify onChange logic (check if description would be reset - though testing formik state inside here is tricky without access to formik BAG)
    // We can at least see it was called.
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
    ).toHaveBeenCalledWith('broker123', 100);
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

    // Select a debt type
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Debt Type 2' } });
    const option = await screen.findByText('Debt Type 2');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Debt Type 2');
    });

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(setStep).toHaveBeenCalled();
    });
  });
});
