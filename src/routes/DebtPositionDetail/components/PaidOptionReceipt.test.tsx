/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '__tests__/renderers';
import { PaidOptionReceipt } from './PaidOptionReceipt';
import { DebtorPaymentOptionOverviewDTO } from '../../../../generated/data-contracts';
import { useParams } from 'react-router-dom';
import loaders from 'utils/loaders';
import { formatDateOrMissingValue, toEuroOrMissingValue } from 'utils/converters';
import files from 'utils/files';
import notify from 'utils/notify';
import { i18nTestSetup } from '__tests__/i18nTestSetup';

i18nTestSetup({
  'app.debtPositionDetail.paidOptionReceipt': '{{date}} {{amount}}'
});

vi.mock('react-router-dom', () => ({
  useParams: vi.fn()
}));

vi.mock('utils/loaders', () => ({
  default: {
    getUserInfo: vi.fn(),
    getDebtorReceipts: vi.fn(),
    useDownloadReceipt: vi.fn()
  }
}));

vi.mock('utils/converters', () => ({
  formatDateOrMissingValue: vi.fn(),
  toEuroOrMissingValue: vi.fn()
}));

vi.mock('utils/files', () => ({
  default: {
    downloadBlob: vi.fn()
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: vi.fn()
  }
}));

const mockPaymentOption: DebtorPaymentOptionOverviewDTO = {
  paymentOptionId: 123
} as any;

const mockReceipts = [
  {
    receiptId: 'receipt-1',
    paymentDateTime: '2025-01-15T10:30:00Z',
    paymentAmountCents: 5000
  },
  {
    receiptId: 'receipt-2',
    paymentDateTime: '2025-01-20T14:00:00Z',
    paymentAmountCents: 3000
  }
];

describe('PaidOptionReceipt', () => {
  const mockDownloadReceipt = {
    mutateAsync: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up localStorage with brokerId
    localStorage.setItem('ARPU-brokerId', 'broker-123');

    vi.mocked(useParams).mockReturnValue({
      debtPositionId: '456',
      organizationId: '789'
    });

    vi.mocked(loaders.getUserInfo).mockReturnValue({
      data: { fiscalCode: 'RSSMRA80A01H501U' }
    } as any);

    vi.mocked(loaders.getDebtorReceipts).mockReturnValue({
      data: mockReceipts
    } as any);

    vi.mocked(loaders.useDownloadReceipt).mockReturnValue(mockDownloadReceipt as any);

    vi.mocked(formatDateOrMissingValue).mockImplementation((date) =>
      date === '2025-01-15T10:30:00Z' ? '15/01/2025' : '20/01/2025'
    );

    vi.mocked(toEuroOrMissingValue).mockImplementation((cents) =>
      cents === 5000 ? '€50.00' : '€30.00'
    );
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('renders all receipts with payment info', () => {
    render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    expect(screen.getByText(/15\/01\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/€50.00/)).toBeInTheDocument();
    expect(screen.getByText(/20\/01\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/€30.00/)).toBeInTheDocument();
  });

  it('renders download buttons for each receipt', () => {
    render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    const downloadButtons = screen.getAllByText('app.debtPositionDetail.downloadReceipt');
    expect(downloadButtons).toHaveLength(2);
  });

  it('downloads receipt when button is clicked', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    mockDownloadReceipt.mutateAsync.mockResolvedValue({
      blob: mockBlob,
      filename: 'receipt.pdf'
    });

    render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    const downloadButtons = screen.getAllByText('app.debtPositionDetail.downloadReceipt');
    downloadButtons[0].click();

    await waitFor(() => {
      expect(mockDownloadReceipt.mutateAsync).toHaveBeenCalledWith({
        organizationId: 789,
        receiptId: 'receipt-1',
        fiscalCode: 'RSSMRA80A01H501U'
      });
      expect(files.downloadBlob).toHaveBeenCalledWith(mockBlob, 'receipt.pdf');
    });
  });

  it('shows error notification when download fails', async () => {
    mockDownloadReceipt.mutateAsync.mockRejectedValue(new Error('Download failed'));

    render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    const downloadButtons = screen.getAllByText('app.debtPositionDetail.downloadReceipt');
    downloadButtons[0].click();

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
    });
  });

  it('shows error when receiptId is missing', async () => {
    vi.mocked(loaders.getDebtorReceipts).mockReturnValue({
      data: [{ ...mockReceipts[0], receiptId: undefined }]
    } as any);

    render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    const downloadButton = screen.getByText('app.debtPositionDetail.downloadReceipt');
    downloadButton.click();

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
      expect(mockDownloadReceipt.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it('renders nothing when no receipts exist', () => {
    vi.mocked(loaders.getDebtorReceipts).mockReturnValue({
      data: []
    } as any);

    const { container } = render(<PaidOptionReceipt paymentOption={mockPaymentOption} />);

    expect(container.firstChild).toBeNull();
  });
});
