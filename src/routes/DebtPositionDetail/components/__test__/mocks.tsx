import {
  DebtorPaymentOptionOverviewDTO,
  InstallmentStatus,
  PaymentOptionStatus,
  PaymentOptionType
} from '../../../../../generated/data-contracts';

export const mockSingleUnpaidInstallmentPaymentOption: DebtorPaymentOptionOverviewDTO = {
  paymentOptionId: 1,
  paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
  status: PaymentOptionStatus.UNPAID,
  totalAmountCents: 150,
  installments: [
    {
      installmentId: 1,
      dueDate: '2025-11-19',
      amountCents: 150,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    }
  ]
};

export const mockInstallmentsPaymentOption: DebtorPaymentOptionOverviewDTO = {
  paymentOptionId: 1,
  paymentOptionType: PaymentOptionType.INSTALLMENTS,
  status: PaymentOptionStatus.UNPAID,
  totalAmountCents: 500,
  installments: [
    {
      installmentId: 1,
      dueDate: '2025-07-15',
      amountCents: 100,
      status: InstallmentStatus.EXPIRED,
      remittanceInformation: 'test'
    },
    {
      installmentId: 2,
      dueDate: '2025-08-15',
      amountCents: 100,
      status: InstallmentStatus.PAID,
      remittanceInformation: 'test'
    },
    {
      installmentId: 3,
      dueDate: '2025-09-15',
      amountCents: 150,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    },
    {
      installmentId: 3,
      dueDate: '2025-10-15',
      amountCents: 150,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    }
  ]
};

export const paymentOptions: DebtorPaymentOptionOverviewDTO[] = [
  mockSingleUnpaidInstallmentPaymentOption,
  mockInstallmentsPaymentOption
];
