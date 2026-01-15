/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { DebtorUnpaidDebtPositionDTO } from '../../../../generated/data-contracts';

vi.mock('react-router-dom', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    generatePath: vi.fn()
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('utils/converters', () => ({
  toEuroOrMissingValue: vi.fn(),
  formatDateOrMissingValue: vi.fn(),
  fromTaxCodeToSrcImage: vi.fn()
}));

vi.mock('components/PayeeIcon', () => ({
  PayeeIcon: ({ alt }: { alt: string }) => <div data-testid="payee-icon">{alt}</div>
}));

import { generatePath } from 'react-router-dom';
import {
  toEuroOrMissingValue,
  formatDateOrMissingValue,
  fromTaxCodeToSrcImage
} from 'utils/converters';
import { DebtPositionItem } from './item';

const debtPositionMock: DebtorUnpaidDebtPositionDTO = {
  orgName: 'Comune di Milano',
  orgFiscalCode: '98765432109',
  debtPositionId: 'debt-123',
  organizationId: 'org-456',
  debtPositionTypeOrgDescription: 'Property tax',
  paymentOptions: [{ totalAmountCents: 5000, dueDate: '2025-01-31T00:00:00Z' }]
} as any;

describe('DebtPositionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(generatePath).mockReturnValue('/debt-positions/debt-123/org-456');

    vi.mocked(toEuroOrMissingValue).mockReturnValue('€50.00');
    vi.mocked(formatDateOrMissingValue).mockReturnValue('31/01/2025');
    vi.mocked(fromTaxCodeToSrcImage).mockReturnValue('icon-src');
  });

  it('renders organization name and debt description', () => {
    render(<DebtPositionItem debtPosition={debtPositionMock} />);

    expect(screen.getByText('Comune di Milano')).toBeInTheDocument();
    expect(screen.getByText('Property tax')).toBeInTheDocument();
  });

  it('renders amount and due date fields', () => {
    render(<DebtPositionItem debtPosition={debtPositionMock} />);

    expect(screen.getByText('app.debtPositions.debtPositionItem.amount')).toBeInTheDocument();
    expect(screen.getByText('€50.00')).toBeInTheDocument();

    expect(screen.getByText('app.debtPositions.debtPositionItem.dueDate')).toBeInTheDocument();
    expect(screen.getByText('31/01/2025')).toBeInTheDocument();
  });
});
