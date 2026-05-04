import { render, screen, fireEvent } from '__tests__/renderers';
import React from 'react';
import InstallmentItem from './InstallmentItem';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../../generated/data-contracts';

const item: InstallmentDrawerItem = {
  installmentId: 1,
  rateIndex: 1,
  dueDate: '2024-12-31',
  amountCents: 150,
  paFullName: 'ENTE TEST',
  paTaxCode: 'JHNDOE80A01F205X',
  debtPositionId: 123,
  paymentOptionId: 456,
  iuv: 'IUV1234567890',
  nav: 'NAV1234567890',
  remittanceInformation: 'Description 1',
  status: InstallmentStatus.UNPAID,
  allCCP: false
};

describe('InstallmentItem', () => {
  it('renders as expected: type available', () => {
    const mockAction = vi.fn();
    render(<InstallmentItem totalItems={4} item={item} type="available" action={mockAction} />);

    expect(
      screen.getByTestId(`installments-drawer-installment-item-${item.installmentId}`)
    ).toBeInTheDocument();

    const button = screen.getByTestId('add-installment-button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledWith(item);

    const installmentIndex = screen.getByTestId('installment-index');
    expect(installmentIndex).toBeInTheDocument();
    // expect(installmentIndex).toHaveTextContent('Rata 1 di 4');

    const installmentDueDate = screen.getByTestId('installment-due-date');
    expect(installmentDueDate).toBeInTheDocument();
    //expect(installmentDueDate).toHaveTextContent('Entro il 31/12/2024');

    const installmentAmount = screen.getByTestId('installment-amount');
    expect(installmentAmount).toBeInTheDocument();
    //expect(installmentAmount).toHaveTextContent('1,50 €');
  });

  it('renders as expected: type added', () => {
    const mockAction = vi.fn();
    render(<InstallmentItem totalItems={4} item={item} type="added" action={mockAction} />);

    expect(
      screen.getByTestId(`installments-drawer-installment-item-${item.installmentId}`)
    ).toBeInTheDocument();

    const button = screen.getByTestId('remove-installment-button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledWith(item);
  });
});
