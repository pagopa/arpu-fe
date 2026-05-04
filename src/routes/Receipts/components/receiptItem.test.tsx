/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { DebtorReceiptDTO } from '../../../../generated/data-contracts';

// mock media query
vi.mock('@mui/material', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    useMediaQuery: vi.fn()
  };
});

// mock router generatePath
vi.mock('react-router-dom', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    generatePath: vi.fn()
  };
});

// mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// mock converters
vi.mock('utils/converters', () => ({
  toEuroOrMissingValue: vi.fn(),
  formatDateOrMissingValue: vi.fn(),
  fromTaxCodeToSrcImage: vi.fn()
}));

// mock PayeeIcon
vi.mock('components/PayeeIcon', () => ({
  PayeeIcon: ({ alt }: { alt: string }) => <div data-testid="payee-icon">{alt}</div>
}));

/* ------------------------------------------------------------------
 * Imports after mocks
 * ------------------------------------------------------------------ */
import { useMediaQuery } from '@mui/material';
import { generatePath } from 'react-router-dom';
import {
  toEuroOrMissingValue,
  formatDateOrMissingValue,
  fromTaxCodeToSrcImage
} from 'utils/converters';
import { ReceiptItem } from './item';

const receiptMock: DebtorReceiptDTO = {
  debtPositionTypeOrgDescription: 'Tax payment',
  orgName: 'Comune di Roma',
  orgFiscalCode: '12345678901',
  paymentDateTime: '2024-12-31T10:30:00Z',
  receiptId: 'receipt-123',
  organizationId: 'org-456',
  paymentAmountCents: 15000
} as any;

describe('ReceiptItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(generatePath).mockReturnValue('/receipts/receipt-123/org-456');

    vi.mocked(toEuroOrMissingValue).mockReturnValue('€150.00');
    vi.mocked(formatDateOrMissingValue).mockReturnValue('31/12/2024');
    vi.mocked(fromTaxCodeToSrcImage).mockReturnValue('icon-src');
  });

  it('renders organization name and debt description', () => {
    render(<ReceiptItem receipt={receiptMock} />);

    expect(screen.getAllByText('Comune di Roma')).toHaveLength(2);
    expect(screen.getByText('Tax payment')).toBeInTheDocument();
  });

  it('renders amount and payment date fields', () => {
    render(<ReceiptItem receipt={receiptMock} />);

    expect(screen.getByText('app.receipts.amount')).toBeInTheDocument();
    expect(screen.getByText('€150.00')).toBeInTheDocument();

    expect(screen.getByText('app.receipts.paymentDateTime')).toBeInTheDocument();
    expect(screen.getByText('31/12/2024')).toBeInTheDocument();
  });

  it('renders PayeeIcon when screen is smUp', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);

    render(<ReceiptItem receipt={receiptMock} />);

    expect(screen.getByTestId('payee-icon')).toBeInTheDocument();
  });

  it('passes correct detail path and renders detail button', () => {
    render(<ReceiptItem receipt={receiptMock} />);

    const detailButton = screen.getByTestId('receipt-details-button');
    expect(detailButton).toBeInTheDocument();

    expect(generatePath).toHaveBeenCalledWith(expect.anything(), {
      receiptId: 'receipt-123',
      organizationId: 'org-456'
    });
  });

  it('uses translated aria label for detail button', () => {
    render(<ReceiptItem receipt={receiptMock} />);

    const detailButton = screen.getByLabelText('commons.detail');
    expect(detailButton).toBeInTheDocument();
  });
});
