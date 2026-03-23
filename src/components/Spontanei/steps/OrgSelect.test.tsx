import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import OrgSelect from './OrgSelect';
import FormContext, { FormContextType } from '../FormContext';
import { Formik, useFormikContext } from 'formik';
import utils from 'utils';
import {
  OrganizationsWithSpontaneousDTO,
  PersonEntityType
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
  formType: null,
  setFormType: vi.fn(),
  userDescription: null,
  setUserDescription: vi.fn(),
  ...overrides
});

const initialValues = {
  fullName: '',
  entityType: PersonEntityType.F,
  email: '',
  fiscalCode: '',
  amount: 0,
  description: '',
  org: null,
  debtType: null
};

const renderOrgSelect = (contextValue: Partial<FormContextType> = {}) => {
  const defaultContext = getDefaultContext(contextValue);
  return render(
    <Formik initialValues={initialValues} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <OrgSelect />
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

  it('resets debtType when a different organization is selected', async () => {
    const initialValuesWithDebtType = {
      ...initialValues,
      org: mockOrgs[0],
      debtType: {
        debtPositionTypeOrgId: 99,
        description: 'Old Debt',
        code: '999',
        organizationId: 1
      }
    };

    let formValues: typeof initialValuesWithDebtType | undefined;
    const FormSpy = () => {
      const { values } = useFormikContext<typeof initialValuesWithDebtType>();
      formValues = values;
      return null;
    };

    render(
      <Formik initialValues={initialValuesWithDebtType} onSubmit={vi.fn()}>
        <FormContext.Provider value={getDefaultContext()}>
          <OrgSelect />
          <FormSpy />
        </FormContext.Provider>
      </Formik>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Org 2' } });
    const option = await screen.findByText('Org 2');
    fireEvent.click(option);

    await waitFor(() => {
      expect(formValues?.debtType).toBeNull();
      expect(formValues?.org?.organizationId).toBe(2);
    });
  });

  it('resets debtType when auto-selecting the only available organization', async () => {
    const singleOrg = [mockOrgs[0]];
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({ data: singleOrg });
    const setStep = vi.fn();
    const setOmitFirstStep = vi.fn();

    const initialValuesWithDebtType = {
      ...initialValues,
      debtType: {
        debtPositionTypeOrgId: 99,
        description: 'Old Debt',
        code: '999',
        organizationId: 5
      }
    };

    let formValues: typeof initialValuesWithDebtType | undefined;
    const FormSpy = () => {
      const { values } = useFormikContext<typeof initialValuesWithDebtType>();
      formValues = values;
      return null;
    };

    render(
      <Formik initialValues={initialValuesWithDebtType} onSubmit={vi.fn()}>
        <FormContext.Provider value={getDefaultContext({ setStep, setOmitFirstStep })}>
          <OrgSelect />
          <FormSpy />
        </FormContext.Provider>
      </Formik>
    );

    await waitFor(() => {
      expect(setStep).toHaveBeenCalled();
      expect(formValues?.debtType).toBeNull();
      expect(formValues?.org?.organizationId).toBe(1);
    });
  });
});
