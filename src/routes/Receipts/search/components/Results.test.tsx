/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '__tests__/renderers';
import '@testing-library/jest-dom';
import * as converters from 'utils/converters';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/data-contracts';
import { Results } from './Results';

vi.mock('utils/converters', () => ({
  propertyOrMissingValue: vi.fn((value) => value || '-'),
  toEuroOrMissingValue: vi.fn((cents) => {
    if (cents === undefined || cents === null) return '-';
    return `€ ${(cents / 100).toFixed(2)}`;
  })
}));

// Mock Actions component
vi.mock('./Actions', () => ({
  Actions: ({ installment }: { installment: any }) => (
    <button data-testid={`actions-${installment.installmentId}`}>Actions</button>
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

  it('renders list of installments with Item components', () => {
    render(<Results installments={mockInstallments} />);

    // Check translation labels
    expect(screen.getAllByText('app.receiptsSearch.fields.noticeCode')).toHaveLength(2);
    expect(screen.getAllByText('app.receiptsSearch.fields.orgName')).toHaveLength(2);
    expect(screen.getAllByText('app.receiptsSearch.fields.amount')).toHaveLength(2);

    // Check installment values
    expect(screen.getByText('123456789012345678')).toBeInTheDocument();
    expect(screen.getByText('€ 100.00')).toBeInTheDocument();
    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('org2')).toBeInTheDocument();
    expect(screen.getByText('987654321098765432')).toBeInTheDocument();
    expect(screen.getByText('€ 250.00')).toBeInTheDocument();
  });

  it('renders Actions component for each installment', () => {
    render(<Results installments={mockInstallments} />);

    expect(screen.getByTestId('actions-1')).toBeInTheDocument();
    expect(screen.getByTestId('actions-2')).toBeInTheDocument();
    expect(screen.getAllByTestId(/actions-/)).toHaveLength(2);
  });

  it('calls converters with correct values', () => {
    render(<Results installments={mockInstallments} />);

    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith('123456789012345678');
    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith('org1');
    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(10000);
    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith('987654321098765432');
    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith('org2');
    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(25000);
  });

  it('renders empty when no installments', () => {
    render(<Results installments={[]} />);

    expect(screen.queryByTestId(/actions-/)).not.toBeInTheDocument();
    expect(screen.queryByText('123456789012345678')).not.toBeInTheDocument();
  });

  it('handles missing values gracefully', () => {
    const installmentsWithMissing: InstallmentDebtorExtendedDTO[] = [
      {
        installmentId: 1,
        iuv: undefined,
        orgName: null,
        amountCents: undefined
      }
    ] as any;

    render(<Results installments={installmentsWithMissing} />);

    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith(undefined);
    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith(null);
    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(undefined);
    expect(screen.getByTestId('actions-1')).toBeInTheDocument();
  });

  it('renders Item components with correct label-value structure', () => {
    render(<Results installments={mockInstallments.slice(0, 1)} />); // Just first item

    // Check label-value pairs for first installment
    expect(screen.getByText('app.receiptsSearch.fields.noticeCode')).toBeInTheDocument();
    expect(screen.getByText('123456789012345678')).toBeInTheDocument();
    expect(screen.getByText('app.receiptsSearch.fields.orgName')).toBeInTheDocument();
    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('app.receiptsSearch.fields.amount')).toBeInTheDocument();
    expect(screen.getByText('€ 100.00')).toBeInTheDocument();
  });
});
