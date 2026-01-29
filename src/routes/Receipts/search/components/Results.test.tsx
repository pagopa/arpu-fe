/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/data-contracts';
import { Results } from './Results';
import { InstallmentType } from 'utils/loaders';

// Mock Actions component
vi.mock('./Actions', () => ({
  Actions: ({ installment }: { installment: any }) => (
    <button data-testid={`actions-${installment.installmentId}`}>Actions </button>
  )
}));

// Mock InstallmentChip component
vi.mock('components/StatusChips/InstallmentChip', () => ({
  InstallmentChip: ({ installment }: { installment: any }) => (
    <span data-testid={`chip-${installment.installmentId}`}>Status Chip</span>
  )
}));

const mockInstallments: InstallmentDebtorExtendedDTO[] = [
  {
    installmentId: 1,
    iuv: '123456789012345678',
    orgName: 'org1',
    amountCents: 10000
  },
  {
    installmentId: 2,
    iuv: '987654321098765432',
    orgName: 'org2',
    amountCents: 25000
  }
] as InstallmentDebtorExtendedDTO[];

describe('Results', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Actions component for each installment with installmentType', () => {
    render(<Results installments={mockInstallments} installmentType={InstallmentType.ALL} />);

    expect(screen.getByTestId('actions-1')).toBeInTheDocument();
    expect(screen.getByTestId('actions-2')).toBeInTheDocument();
    expect(screen.getAllByTestId(/actions-/)).toHaveLength(2);
  });

  it('renders status field only when installmentType is ALL', () => {
    const { rerender } = render(
      <Results installments={mockInstallments} installmentType={InstallmentType.ALL} />
    );

    // Should show status label and chips
    expect(screen.getAllByText('fields.status')).toHaveLength(2);
    expect(screen.getByTestId('chip-1')).toBeInTheDocument();
    expect(screen.getByTestId('chip-2')).toBeInTheDocument();

    // Rerender with different type
    rerender(
      <Results installments={mockInstallments} installmentType={InstallmentType.RECEIPTS} />
    );

    // Should not show status
    expect(screen.queryAllByText('fields.status')).toHaveLength(0);
    expect(screen.queryByTestId('chip-1')).not.toBeInTheDocument();
  });

  it('renders empty when no installments', () => {
    render(<Results installments={[]} installmentType={InstallmentType.ALL} />);

    expect(screen.queryByTestId(/actions-/)).not.toBeInTheDocument();
    expect(screen.queryByText('123456789012345678')).not.toBeInTheDocument();
  });

  it('renders Item components with correct label-value structure', () => {
    render(
      <Results installments={mockInstallments.slice(0, 1)} installmentType={InstallmentType.ALL} />
    );

    // Check label-value pairs for first installment
    expect(screen.getByText('fields.noticeCode')).toBeInTheDocument();
    expect(screen.getByText('123456789012345678')).toBeInTheDocument();
    expect(screen.getByText('fields.orgName')).toBeInTheDocument();
    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('fields.amount')).toBeInTheDocument();
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
  });
});
