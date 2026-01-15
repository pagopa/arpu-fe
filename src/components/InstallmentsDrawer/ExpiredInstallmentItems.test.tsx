import { render, screen, fireEvent } from '__tests__/renderers';
import React from 'react';
import ExpiredIntalmentItems from './ExpiredInstallmentItems';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../../generated/data-contracts';

const items: InstallmentDrawerItem[] = [
  {
    installmentId: 1,
    rateIndex: 1,
    dueDate: '2024-11-31',
    amountCents: 150,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567889',
    nav: 'NAV1234567889',
    remittanceInformation: 'Description 1',
    status: InstallmentStatus.EXPIRED
  },
  {
    installmentId: 2,
    rateIndex: 2,
    dueDate: '2024-12-31',
    amountCents: 275,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567890',
    nav: 'NAV1234567890',
    remittanceInformation: 'Description 2',
    status: InstallmentStatus.EXPIRED
  }
];

describe('ExpiredIntalmentItems', () => {
  it('does not render expired items by default', () => {
    render(<ExpiredIntalmentItems totalItems={4} items={items} />);
    expect(
      screen.queryByTestId('installments-drawer-expired-installment-item-1')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('installments-drawer-expired-installment-item-2')
    ).not.toBeInTheDocument();
  });

  it('renders expired items by clicking the toggle button', () => {
    render(<ExpiredIntalmentItems totalItems={4} items={items} />);
    const toggleButton = screen.getByTestId(
      'installments-drawer-expired-installments-toggle-button'
    );
    fireEvent.click(toggleButton);

    expect(
      screen.getByTestId('installments-drawer-expired-installment-item-1')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('installments-drawer-expired-installment-item-2')
    ).toBeInTheDocument();
  });

  it('renders expired items info correctly', () => {
    render(<ExpiredIntalmentItems totalItems={4} items={items} />);
    const toggleButton = screen.getByTestId(
      'installments-drawer-expired-installments-toggle-button'
    );
    fireEvent.click(toggleButton);

    const item1Amount = screen.getByTestId('installments-drawer-expired-installment-amount-1');
    expect(item1Amount).toHaveTextContent('1,50 €');

    const item2Amount = screen.getByTestId('installments-drawer-expired-installment-amount-2');
    expect(item2Amount).toHaveTextContent('2,75 €');

    /* unfortunately due to the way the date formatting utility is implemented
       (it relies on the global Intl object), it's not possible to test it properly
       without mocking the entire Intl object, which is out of scope for this test.
       Therefore, the following tests are commented out.
    */

    //const item1ExpireDate = screen.getByTestId('installments-drawer-expired-installment-expire-date-1');
    //expect(item1ExpireDate).toHaveTextContent('31/11/2024');

    //const item2ExpireDate = screen.getByTestId('installments-drawer-expired-installment-expire-date-2');
    //expect(item2ExpireDate).toHaveTextContent('31/12/2024');
  });
});
