import { render } from '__tests__/renderers';
import React from 'react';
import InatallmentsDrawer from './';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { setInstallmentsDrawerState } from 'store/installmentsDrawer';

const items: InstallmentDrawerItem[] = [
  {
    installmentId: 1,
    rateIndex: 1,
    dueDate: '2024-08-31',
    amountCents: 150,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567890',
    nav: 'NAV1234567890',
    remittanceInformation: 'Description 1',
    status: InstallmentStatus.EXPIRED
  },
  {
    installmentId: 2,
    rateIndex: 2,
    dueDate: '2024-09-31',
    amountCents: 150,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567891',
    nav: 'NAV1234567891',
    remittanceInformation: 'Description 2',
    status: InstallmentStatus.PAID
  },
  {
    installmentId: 3,
    rateIndex: 3,
    dueDate: '2024-10-31',
    amountCents: 150,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567892',
    nav: 'NAV1234567892',
    remittanceInformation: 'Description 3',
    status: InstallmentStatus.UNPAID
  },
  {
    installmentId: 4,
    rateIndex: 4,
    dueDate: '2024-11-31',
    amountCents: 150,
    paFullName: 'ENTE TEST',
    paTaxCode: 'JHNDOE80A01F205X',
    debtPositionId: 123,
    paymentOptionId: 456,
    iuv: 'IUV1234567893',
    nav: 'NAV1234567893',
    remittanceInformation: 'Description 4',
    status: InstallmentStatus.UNPAID
  }
];

describe('InatallmentsDrawer', () => {
  it('renders as expected', () => {
    setInstallmentsDrawerState(items);
    render(<InatallmentsDrawer />);
  });
});
