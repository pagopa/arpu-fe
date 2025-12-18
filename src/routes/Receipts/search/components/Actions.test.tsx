/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Actions } from './Actions';
import React from 'react';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/data-contracts';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockInstallment = {
  installmentId: 1,
  iuv: '987654321098765432',
  orgName: 'org',
  amountCents: 25000
} as InstallmentDebtorExtendedDTO;

describe('Receipts Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render', () => {
    render(<Actions installment={mockInstallment} />);
    expect(screen.getByTestId('action-menu-1')).toBeInTheDocument();
  });

  it('should navigate to receipt detail', () => {
    render(<Actions installment={mockInstallment} />);
    fireEvent.click(screen.getByTestId('action-menu-1'));

    waitFor(() => {
      const gotoReceiptDetail = screen.getByText('app.receiptsSearch.actions.download');
      fireEvent.click(gotoReceiptDetail);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
