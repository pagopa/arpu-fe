import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import OrgSelect from './OrgSelect';
import FormContext, { FormContextType } from '../FormContext';
import { Formik, useFormikContext } from 'formik';
import utils from 'utils';
import {
  OrganizationsWithSpontaneousDTO,
  PersonEntityType,
  DebtPositionTypeOrgsWithSpontaneousDTO
} from '../../../../generated/data-contracts';
import { Mock } from 'vitest';
import { PaymentNoticeInfo } from '../index';

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
        getPublicOrganizationsWithSpontaneous: vi.fn().mockReturnValue({ data: [] })
      },
      getOrganizationsWithSpontaneous: vi.fn().mockReturnValue({ data: [] })
    }
  }
}));

const mockOrgs: OrganizationsWithSpontaneousDTO[] = [
  { organizationId: 1, orgName: 'Org 1', orgFiscalCode: '123', ipaCode: 'IPA1' },
  { organizationId: 2, orgName: 'Org 2', orgFiscalCode: '456', ipaCode: 'IPA2' }
];

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: 0,
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  summaryFields: [],
  setSummaryFields: vi.fn(),
  submitFields: [],
  setSubmitFields: vi.fn(),
  causaleHasJoinTemplate: false,
  setCausaleHasJoinTemplate: vi.fn(),
  ...overrides
});

type FormValues = PaymentNoticeInfo & {
  sys_type?: string;
  comune?: string;
};

const initialValues: FormValues = {
  fullName: '',
  entityType: PersonEntityType.F,
  email: '',
  fiscalCode: '',
  amount: 0,
  description: '',
  org: null,
  debtType: null
};

const FormikValuesProbe = () => {
  const { values } = useFormikContext<FormValues>();

  return <pre data-testid="formik-values-probe">{JSON.stringify(values)}</pre>;
};

const renderOrgSelect = (
  contextValue: Partial<FormContextType> = {},
  formValues: Partial<FormValues> = {}
) => {
  const defaultContext = getDefaultContext(contextValue);
  const values = { ...initialValues, ...formValues };

  return render(
    <Formik initialValues={values} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <OrgSelect />
        <FormikValuesProbe />
      </FormContext.Provider>
    </Formik>
  );
};

describe('OrgSelect Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.storage.app.getBrokerId as Mock).mockReturnValue('broker123');
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({ data: mockOrgs });
  });

  it('renders correctly with multiple organizations', () => {
    renderOrgSelect();

    expect(screen.getByTestId('spontanei-step1-title')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step1-description')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('automatically selects the only organization and advances the step', async () => {
    const singleOrg = [mockOrgs[0]];
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({ data: singleOrg });
    const setStep = vi.fn();
    const setOmitFirstStep = vi.fn();

    renderOrgSelect({ setStep, setOmitFirstStep });

    await waitFor(() => {
      expect(setOmitFirstStep).toHaveBeenCalledWith(true);
      expect(setStep).toHaveBeenCalled();
    });
  });

  it('handles organization selection manually', async () => {
    renderOrgSelect();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Org 1' } });

    // MUI Autocomplete usually needs to select from the list
    const option = await screen.findByText('Org 1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Org 1');
    });
  });

  it('resets debt type and dependent fields when organization changes', async () => {
    const selectedDebtType = {
      debtPositionTypeOrgId: 10,
      organizationId: 1,
      code: 'SERVICE-1',
      description: 'Service 1'
    } as DebtPositionTypeOrgsWithSpontaneousDTO;

    renderOrgSelect(
      {},
      {
        org: mockOrgs[0],
        debtType: selectedDebtType,
        amount: 2500,
        description: 'Causale precedente',
        sys_type: 'FORM_PREVIOUS_VALUE',
        comune: 'Roma'
      }
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Org 2' } });

    const option = await screen.findByText('Org 2');
    fireEvent.click(option);

    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('formik-values-probe').textContent || '{}');

      expect(values.org.organizationId).toBe(2);
      expect(values.debtType).toBeNull();
      expect(values.amount).toBe(0);
      expect(values.description).toBe('');
      expect(values.sys_type).toBeUndefined();
      expect(values.comune).toBeUndefined();
    });
  });

  it('calls public loader when user is anonymous', () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    (utils.loaders.public.getPublicOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: mockOrgs
    });

    renderOrgSelect();

    expect(utils.loaders.public.getPublicOrganizationsWithSpontaneous).toHaveBeenCalledWith(
      'broker123'
    );
  });

  it('validates form and shows error when clicking continue with no selection', async () => {
    // We need to provide a validation schema to test validation error display
    const validationSchema = {
      validate: (values: Partial<PaymentNoticeInfo>) => {
        const errors: Record<string, string> = {};
        if (!values.org) {
          errors.org = 'Required';
        }
        return errors;
      }
    };

    render(
      <Formik initialValues={initialValues} validate={validationSchema.validate} onSubmit={vi.fn()}>
        <FormContext.Provider value={getDefaultContext()}>
          <OrgSelect />
        </FormContext.Provider>
      </Formik>
    );

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('advances to next step when an organization is selected and continue is clicked', async () => {
    const setStep = vi.fn();
    renderOrgSelect({ setStep });

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Org 1' } });
    const option = await screen.findByText('Org 1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('Org 1');
    });

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(setStep).toHaveBeenCalled();
    });
  });
});
