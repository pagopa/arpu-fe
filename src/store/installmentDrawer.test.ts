import { describe, it, expect } from 'vitest';
import {
  installmentsDrawerState,
  setInstallmentsDrawerState,
  resetInstallmentsDrawer,
  toggleInstallmentsDrawer,
  openInstallmentsDrawer,
  closeInstallmentsDrawer
} from './installmentsDrawer';

import { InstallmentsDrawerState } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../generated/data-contracts';

export const items: InstallmentsDrawerState['items'] = [
  {
    installmentId: 1,
    rateIndex: 1,
    paFullName: 'TEST PA',
    paTaxCode: '1234',
    debtPositionId: 1,
    paymentOptionId: 1,
    remittanceInformation: 'A nice description',
    amountCents: 100,
    dueDate: '2024-11-31',
    status: InstallmentStatus.UNPAID,
    nav: '00001',
    iuv: '000001'
  },
  {
    installmentId: 2,
    rateIndex: 2,
    paFullName: 'TEST PA',
    paTaxCode: '1234',
    debtPositionId: 1,
    paymentOptionId: 1,
    remittanceInformation: 'A nice description',
    amountCents: 100,
    dueDate: '2024-12-31',
    status: InstallmentStatus.UNPAID,
    nav: '00002',
    iuv: '000002'
  }
];

describe('Installments drawer store', () => {
  it('toggles the cart drawer state', () => {
    toggleInstallmentsDrawer();
    expect(installmentsDrawerState.value.isOpen).toBeTruthy();
    toggleInstallmentsDrawer();
    expect(installmentsDrawerState.value.isOpen).toBeFalsy();
    openInstallmentsDrawer();
    expect(installmentsDrawerState.value.isOpen).toBeTruthy();
    closeInstallmentsDrawer();
    expect(installmentsDrawerState.value.isOpen).toBeFalsy();
  });

  it('adds items correctly', () => {
    setInstallmentsDrawerState(items);
    expect(installmentsDrawerState.value.items).toStrictEqual(items);
    expect(installmentsDrawerState.value.items.length).toBe(2);
  });

  it('opens and adds items correctly', () => {
    openInstallmentsDrawer(items);
    expect(installmentsDrawerState.value.isOpen).toBeTruthy();
    expect(installmentsDrawerState.value.items).toStrictEqual(items);
    expect(installmentsDrawerState.value.items.length).toBe(2);
  });

  it('resets correctly', () => {
    setInstallmentsDrawerState(items);
    resetInstallmentsDrawer();
    expect(installmentsDrawerState.value.items.length).toBe(0);
  });
});
