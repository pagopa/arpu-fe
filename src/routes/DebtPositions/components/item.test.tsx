/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { generatePath } from 'react-router-dom';
import React from 'react';
import { DebtPositionItem } from './item';

// Mock navigation at top level
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    generatePath: vi.fn()
  };
});

// Mock utilities at top level
vi.mock('utils/converters', () => ({
  fromTaxCodeToSrcImage: vi.fn(() => '/mock-payee-icon.png'),
  formatDateOrMissingValue: vi.fn((date: string) => `Formatted: ${date}`),
  toEuroOrMissingValue: vi.fn((amount: number) => `€${amount / 100}`)
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock PayeeIcon
vi.mock('components/PayeeIcon', () => ({
  PayeeIcon: ({ src, alt, visible }: any) =>
    visible ? <img src={src} alt={alt} data-testid="payee-icon" /> : null
}));

const mockDebtPosition: any = {
  organizationId: 123,
  orgName: 'Very Long Organization Name That Will Be Truncated',
  orgFiscalCode: 'ABC123',
  debtPositionId: 456,
  paymentOptions: [
    {
      dueDate: '2024-12-31',
      totalAmountCents: 150000
    }
  ],
  debtPositionTypeOrgDescription: 'Long Debt Position Type Description That Gets Truncated'
};

describe('DebtPositionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generatePath).mockReturnValue('/debt-position/456/123');
  });

  it('renders organization name and debt type with truncation styles', () => {
    render(<DebtPositionItem debtPosition={mockDebtPosition} />);

    expect(screen.getByText(mockDebtPosition.orgName)).toBeInTheDocument();
    expect(screen.getByText(mockDebtPosition.debtPositionTypeOrgDescription)).toBeInTheDocument();
  });

  it('renders payment info with formatted date and amount', () => {
    render(<DebtPositionItem debtPosition={mockDebtPosition} />);

    expect(screen.getByText('app.debtPositions.debtPositionItem.amount')).toBeInTheDocument();
    expect(screen.getByText('app.debtPositions.debtPositionItem.dueDate')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2024-12-31')).toBeInTheDocument();
    expect(screen.getByText('€1500')).toBeInTheDocument();
  });

  it('handles missing payment options gracefully', () => {
    const debtPositionWithoutPayment = { ...mockDebtPosition, paymentOptions: [] };

    render(<DebtPositionItem debtPosition={debtPositionWithoutPayment} />);

    expect(screen.getByText(mockDebtPosition.orgName)).toBeInTheDocument();
  });
});
