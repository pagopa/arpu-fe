/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Results } from './results';
import '@testing-library/jest-dom';
import * as converters from 'utils/converters';

vi.mock('utils/converters', () => ({
  propertyOrMissingValue: vi.fn((value) => value || '-'),
  toEuroOrMissingValue: vi.fn((cents) => {
    if (cents === undefined || cents === null) return '-';
    return `€ ${(cents / 100).toFixed(2)}`;
  })
}));

describe('Results', () => {
  const mockInstallments = [
    {
      iuv: '123456789012345678',
      orgName: 'Test Organization',
      amountCents: 10000
    },
    {
      iuv: '987654321098765432',
      orgName: 'Another Organization',
      amountCents: 25000
    }
  ];

  it('renders list of installments', () => {
    render(<Results installments={mockInstallments as any} />);

    expect(screen.getByText('123456789012345678')).toBeInTheDocument();
    expect(screen.getByText('987654321098765432')).toBeInTheDocument();
  });

  it('displays organization names', () => {
    render(<Results installments={mockInstallments as any} />);

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('Another Organization')).toBeInTheDocument();
  });

  it('formats amounts in euros', () => {
    render(<Results installments={mockInstallments as any} />);

    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(10000);
    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(25000);
    expect(screen.getByText('€ 100.00')).toBeInTheDocument();
    expect(screen.getByText('€ 250.00')).toBeInTheDocument();
  });

  it('renders action button for each installment', () => {
    render(<Results installments={mockInstallments as any} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders empty when no installments', () => {
    const { container } = render(<Results installments={[]} />);

    expect(container.querySelector('.MuiCard-root')).not.toBeInTheDocument();
  });

  it('handles missing values', () => {
    const installmentsWithMissing = [
      {
        iuv: '123456789012345678',
        orgName: undefined,
        amountCents: undefined
      }
    ];

    render(<Results installments={installmentsWithMissing as any} />);

    expect(converters.propertyOrMissingValue).toHaveBeenCalledWith(undefined);
    expect(converters.toEuroOrMissingValue).toHaveBeenCalledWith(undefined);
  });
});
