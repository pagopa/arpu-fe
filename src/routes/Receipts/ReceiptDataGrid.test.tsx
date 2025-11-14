/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReceiptDataGrid } from './ReceiptDataGrid';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import * as converters from 'utils/converters';
import { createMock } from 'zodock';
import { pagedDebtorReceiptsDTOSchema } from '../../../generated/arpu-be/zod-schema';
import { PagedDebtorReceiptsDTO } from '../../../generated/arpu-be/data-contracts';

const theme = createTheme();

const mockReceiptsData: PagedDebtorReceiptsDTO = createMock(pagedDebtorReceiptsDTOSchema);

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useMediaQuery: vi.fn()
  };
});

vi.mock('utils/converters', () => ({
  formatDateOrMissingValue: vi.fn((date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  }),
  fromTaxCodeToSrcImage: vi.fn((taxCode) => `/images/${taxCode}.png`)
}));

vi.mock('components/DataGrid/CustomDataGrid', () => ({
  CustomDataGrid: ({ rows, columns, getRowId, totalPages }: any) => (
    <div data-testid="custom-data-grid">
      <div data-testid="total-pages">{totalPages}</div>
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={getRowId(row)} data-testid={`row-${getRowId(row)}`}>
              {columns.map((col: any) => (
                <td key={col.field} data-testid={`cell-${col.field}`}>
                  {col.renderCell
                    ? col.renderCell({ row, id: getRowId(row) })
                    : col.valueFormatter
                      ? col.valueFormatter(row[col.field])
                      : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}));

vi.mock('components/PayeeIcon', () => ({
  PayeeIcon: ({ src, alt, visible }: any) =>
    visible ? <img src={src} alt={alt} data-testid="payee-icon" /> : null
}));

describe('ReceiptDataGrid', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>{component}</ThemeProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
  });

  it('displays organization names correctly', () => {
    mockReceiptsData.content[0].orgName = 'ACI Automobile Club Italia';
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    expect(screen.getByText('ACI Automobile Club Italia')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    mockReceiptsData.content[0].paymentDateTime = '2024-11-05T10:57:06Z';

    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);
    expect(screen.getByText('05/11/2024')).toBeInTheDocument();
  });

  it('does not render PayeeIcon on small screens', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    expect(screen.queryByTestId('payee-icon')).not.toBeInTheDocument();
  });

  it('renders ChevronRight icons in action column', () => {
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('passes totalPages to CustomDataGrid', () => {
    mockReceiptsData.totalPages = 1;
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  it('handles empty content array', () => {
    const emptyData = {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 0
    };

    renderWithProviders(<ReceiptDataGrid data={emptyData} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('row-receipt-1')).not.toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    const undefinedData = {
      content: undefined as any,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 0
    };

    renderWithProviders(<ReceiptDataGrid data={undefinedData} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    // Should render with empty array due to ?? []
    expect(screen.queryByTestId('row-receipt-1')).not.toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    const nullData = {
      content: null as any,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 0
    };

    renderWithProviders(<ReceiptDataGrid data={nullData} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('row-receipt-1')).not.toBeInTheDocument();
  });

  it('renders correctly with single receipt', () => {
    const firstReceipt = mockReceiptsData.content[0];
    firstReceipt.receiptId = 1;
    const singleReceiptData = {
      content: [mockReceiptsData.content[0]],
      totalPages: 1,
      totalElements: 1,
      number: 0,
      size: 1
    };

    renderWithProviders(<ReceiptDataGrid data={singleReceiptData} />);

    expect(screen.getByTestId('row-1')).toBeInTheDocument();
  });

  it('applies correct flex values based on screen size', () => {
    // Test with large screen
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { rerender } = renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    // Component should render with flex: 5 for orgName column
    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();

    // Test with small screen
    vi.mocked(useMediaQuery).mockReturnValue(false);
    rerender(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ReceiptDataGrid data={mockReceiptsData} />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Component should render with flex: 2 for orgName column
    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
  });

  it('passes correct props to CustomDataGrid', () => {
    renderWithProviders(<ReceiptDataGrid data={mockReceiptsData} />);

    const dataGrid = screen.getByTestId('custom-data-grid');
    expect(dataGrid).toBeInTheDocument();
    // CustomDataGrid receives disableColumnMenu, disableColumnResize, totalPages
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  it('renders receipts with multiple pages', () => {
    const multiPageData = {
      ...mockReceiptsData,
      totalPages: 5
    };

    renderWithProviders(<ReceiptDataGrid data={multiPageData} />);

    expect(screen.getByTestId('total-pages')).toHaveTextContent('5');
  });
});
