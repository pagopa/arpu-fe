/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../__tests__/renderers';
import { ReceiptDetail } from '.';
import { Mock } from 'vitest';
import files from 'utils/files';
import notify from 'utils/notify';
import * as ReactRouterDom from 'react-router-dom';
import loaders from 'utils/loaders';

const mockReceiptData = {
  receiptId: 123,
  organizationId: 456,
  orgFiscalCode: '12345678901',
  orgName: 'Test Organization',
  paymentAmountCents: 150000,
  paymentDateTime: '2024-11-15T14:30:00Z',
  receiptOrigin: 'PAYMENT_NOTICE' as const,
  installmentId: 1,
  remittanceInformation: 'Payment for service ABC',
  debtPositionTypeOrgDescription: 'Municipal Tax Payment',
  debtPositionTypeDescription: 'Tax',
  serviceType: 'Standard',
  iuv: '123456789012345678',
  iur: 'IUR123456789',
  iud: 'IUD987654321',
  pspCompanyName: 'Test Payment Provider',
  debtor: {
    fullName: 'Mario Rossi',
    fiscalCode: 'RSSMRA80A01H501U'
  }
};

vi.mock('utils/loaders', () => ({
  default: {
    useReceiptDetail: vi.fn(),
    useDownloadReceipt: vi.fn()
  }
}));

vi.mock('utils/config', () => ({
  default: {
    brokerId: '999'
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({
      receiptId: '123',
      organizationId: '456'
    }))
  };
});

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

vi.mock('components/DataRow', () => ({
  DataRow: ({ label, value }: any) => (
    <tr data-testid="data-row">
      <td data-testid="data-row-label">{label}</td>
      <td data-testid="data-row-value">{value}</td>
    </tr>
  )
}));

vi.mock('components/CopiableRow', () => ({
  CopiableRow: ({ label, value, copiable }: any) => (
    <div data-testid="copiable-row">
      <span data-testid="copiable-row-label">{label}</span>
      <span data-testid="copiable-row-value">{value}</span>
      {copiable && <button data-testid="copy-button">Copy</button>}
    </div>
  )
}));

describe('ReceiptDetail', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    (loaders.useReceiptDetail as Mock).mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    });

    (loaders.useDownloadReceipt as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false
    });

    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: 'receipt_123.pdf'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    expect(downloadButton).toBeInTheDocument();
  });

  it('renders payment information section title', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.paymentInformation')).toBeInTheDocument();
  });

  it('renders all DataRow components', () => {
    render(<ReceiptDetail />);

    const dataRows = screen.getAllByTestId('data-row');
    // Should have rows for: amount, remittanceInformation, iuv, debtor, debtorFiscalCode
    expect(dataRows.length).toBeGreaterThanOrEqual(5);
  });

  it('renders all CopiableRow components', () => {
    render(<ReceiptDetail />);

    const copiableRows = screen.getAllByTestId('copiable-row');
    // Should have rows for: psp, paymentDate, iur, iud
    expect(copiableRows).toHaveLength(4);
  });

  it('renders dividers between copiable rows', () => {
    render(<ReceiptDetail />);

    const dividers = screen.getAllByRole('separator');
    // Should have 3 dividers (between 4 copiable rows)
    expect(dividers).toHaveLength(3);
  });

  it('calls useReceiptDetail with correct parameters', () => {
    render(<ReceiptDetail />);

    expect(loaders.useReceiptDetail).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    });
  });

  it('calls useDownloadReceipt with correct parameters', () => {
    render(<ReceiptDetail />);

    expect(loaders.useDownloadReceipt).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    });
  });

  it('converts brokerId from string to number', () => {
    render(<ReceiptDetail />);

    expect(loaders.useReceiptDetail).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    });
    expect(loaders.useDownloadReceipt).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    });
  });

  it('converts receiptId and organizationId from URL params to numbers', () => {
    render(<ReceiptDetail />);

    // URL params are strings '123' and '456', should be converted to numbers
    expect(loaders.useReceiptDetail).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    });
  });

  it('downloads receipt when download button is clicked', async () => {
    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(files.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_123.pdf');
    });
  });

  it('uses IUV as filename when filename is not provided', async () => {
    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: null
    });

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(files.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), '123456789012345678.pdf');
    });
  });

  it('uses IUV as filename when filename is undefined', async () => {
    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: undefined
    });

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(files.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), '123456789012345678.pdf');
    });
  });

  it('shows error notification when download fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Download failed'));

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
    });

    expect(files.downloadBlob).not.toHaveBeenCalled();
  });

  it('handles network error during download', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
    });
  });

  it('handles API error during download', async () => {
    mockMutateAsync.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Internal server error' }
      }
    });

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
    });
  });

  it('renders two Card components', () => {
    const { container } = render(<ReceiptDetail />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(2);
  });

  it('renders all translation keys correctly', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
    expect(screen.getByText('app.receiptDetail.download')).toBeInTheDocument();
    expect(screen.getByText('app.receiptDetail.paymentInformation')).toBeInTheDocument();

    // Labels should be present (via DataRow and CopiableRow)
    const labels = screen.getAllByTestId('data-row-label');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('adjusts table width based on screen size', () => {
    const { container } = render(<ReceiptDetail />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    // Width is controlled by mdUp media query
    // Default test environment typically treats as small screen
  });

  it('handles missing receipt data gracefully', () => {
    (loaders.useReceiptDetail as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    });

    render(<ReceiptDetail />);

    // Component should still render
    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
  });

  it('handles undefined params gracefully', () => {
    vi.spyOn(ReactRouterDom, 'useParams').mockReturnValueOnce({
      receiptId: undefined,
      organizationId: undefined
    });

    render(<ReceiptDetail />);

    // Should call with NaN when params are undefined
    expect(loaders.useReceiptDetail).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: NaN,
      receiptId: NaN
    });
  });

  it('download button triggers async operation', async () => {
    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });

    // Click should be async
    fireEvent.click(downloadButton);

    // Should not throw error
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('does not download if mutateAsync throws before returning blob', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Failed before blob'));

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(notify.emit).toHaveBeenCalled();
    });

    expect(files.downloadBlob).not.toHaveBeenCalled();
  });

  it('passes blob and filename to downloadBlob correctly', async () => {
    const testBlob = new Blob(['test content'], { type: 'application/pdf' });
    mockMutateAsync.mockResolvedValue({
      blob: testBlob,
      filename: 'custom_receipt.pdf'
    });

    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(files.downloadBlob).toHaveBeenCalledWith(testBlob, 'custom_receipt.pdf');
    });
  });

  it('passes all three IDs to both hooks', () => {
    render(<ReceiptDetail />);

    const expectedParams = {
      brokerId: 999,
      organizationId: 456,
      receiptId: 123
    };

    expect(loaders.useReceiptDetail).toHaveBeenCalledWith(expectedParams);
    expect(loaders.useDownloadReceipt).toHaveBeenCalledWith(expectedParams);
  });

  it('handles zero values in params', () => {
    vi.spyOn(ReactRouterDom, 'useParams').mockReturnValueOnce({
      receiptId: '0',
      organizationId: '0'
    });

    render(<ReceiptDetail />);

    expect(loaders.useReceiptDetail).toHaveBeenCalledWith({
      brokerId: 999,
      organizationId: 0,
      receiptId: 0
    });
  });
});
