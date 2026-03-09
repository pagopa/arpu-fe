import React from 'react';
import { render, screen, waitFor, fireEvent } from '__tests__/renderers';
import Spontanei from './index';
import utils from 'utils';
import { Mock } from 'vitest';

// Mock StepWrapper to immediately render children and bypass the Skeleton delay
vi.mock('./steps/StepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('utils', () => ({
  default: {
    loaders: {
      getOrganizationsWithSpontaneous: vi.fn(),
      getDebtPositionTypeOrgsWithSpontaneous: vi.fn(),
      getDebtPositionTypeOrgsWithSpontaneousDetail: vi.fn(),
      getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear: vi.fn(),
      getUserInfoOnce: vi.fn(),
      getUserInfo: vi.fn(),
      public: {
        getPublicOrganizationsWithSpontaneous: vi.fn(),
        getPublicDebtPositionTypeOrgsWithSpontaneous: vi.fn(),
        getPublicDebtPositionTypeOrgsWithSpontaneousDetail: vi.fn(),
        getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear: vi.fn()
      }
    },
    storage: {
      app: {
        getBrokerId: vi.fn().mockReturnValue('mock-broker-id')
      },
      user: {
        isAnonymous: vi.fn().mockReturnValue(false)
      }
    }
  }
}));

describe('Spontanei Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: [],
      isLoading: false
    });
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
      data: [],
      isLoading: false
    });
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: {},
      isLoading: false
    });
    (utils.loaders.getUserInfo as Mock).mockReturnValue({
      data: {},
      isLoading: false
    });
    (utils.loaders.getUserInfoOnce as Mock).mockReturnValue({
      data: {},
      isLoading: false
    });
    (
      utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear as Mock
    ).mockReturnValue({
      data: [],
      isLoading: false
    });
  });

  it('renders the initial step (OrgSelect) correctly', async () => {
    render(<Spontanei />);

    expect(screen.getByTestId('spontanei-title')).toBeInTheDocument();
    expect(screen.getByTestId('spontanei-step1-title')).toBeInTheDocument();
  });

  it('auto-selects organization and moves to step 1 if only one is available', async () => {
    const mockOrg = { organizationId: 1, orgName: 'Test Org', orgFiscalCode: '12345678901' };
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: [mockOrg],
      isLoading: false
    });

    render(<Spontanei />);

    // Should skip step 0 and show step 1
    await waitFor(() => {
      expect(screen.getByTestId('spontanei-step2-title')).toBeInTheDocument();
    });
  });

  it('manually selects an organization and moves to step 2', async () => {
    const mockOrg = { organizationId: 1, orgName: 'Org 1', orgFiscalCode: '1' };
    const mockOrgs = [mockOrg, { organizationId: 2, orgName: 'Org 2', orgFiscalCode: '2' }];
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: mockOrgs,
      isLoading: false
    });

    render(<Spontanei />);

    const input = screen.getByTestId('spontanei-step1-search-input').querySelector('input');
    input && fireEvent.focus(input);
    input && fireEvent.change(input, { target: { value: 'Org 1' } });

    // Wait for the option to appear and click it
    const option = await screen.findByText('Org 1');
    fireEvent.click(option);

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId('spontanei-step2-title')).toBeInTheDocument();
    });
  });

  it('shows validation error if clicking continue without selecting an organization', async () => {
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: [
        { organizationId: 1, orgName: 'Org 1', orgFiscalCode: '1' },
        { organizationId: 2, orgName: 'Org 2', orgFiscalCode: '2' }
      ],
      isLoading: false
    });

    render(<Spontanei />);

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByTestId('spontanei-step1-search-input').querySelector('.Mui-error')
      ).toBeInTheDocument();
    });
  });

  it('selects a debt type and moves to step 2', async () => {
    const mockOrg = { organizationId: 1, orgName: 'Test Org', orgFiscalCode: '1' };
    (utils.loaders.getOrganizationsWithSpontaneous as Mock).mockReturnValue({
      data: [mockOrg],
      isLoading: false
    });

    const mockDebtTypes = Array.from(Array(11).keys()).map((i) => ({
      debtPositionTypeOrgId: i,
      organizationId: 1,
      code: `DT${i}`,
      description: `Debt Type ${i}`
    }));
    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneous as Mock).mockReturnValue({
      data: mockDebtTypes,
      isLoading: false
    });

    (utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail as Mock).mockReturnValue({
      data: { formType: 'STANDARD' },
      isLoading: false
    });

    render(<Spontanei />);

    // Auto-selects org and moves to step 2
    await waitFor(() => {
      expect(screen.getByTestId('spontanei-step2-title')).toBeInTheDocument();
    });

    const input = screen.getByTestId('spontanei-step2-search-input').querySelector('input');
    input && fireEvent.focus(input);
    input && fireEvent.change(input, { target: { value: 'Debt Type 1' } });

    const option = await screen.findByText('Debt Type 1');
    fireEvent.click(option);

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId('spontanei-step2-title')).toBeInTheDocument();
    });
  });
});
