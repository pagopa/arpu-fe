import React from 'react';
import { useTranslation } from 'react-i18next';
import { DebtorUnpaidDebtPositionDTO } from '../../../../generated/apiClient';
import { datetools } from 'utils/datetools';
import { Tag } from '@pagopa/mui-italia';

export const useDueDateField = (paymentOptions: DebtorUnpaidDebtPositionDTO['paymentOptions']) => {
  const { t } = useTranslation();

  const multiplePaymentOptions = paymentOptions?.length > 1;
  const dueDate = paymentOptions[0]?.dueDate;

  const label =
    multiplePaymentOptions || !dueDate ? '' : t('app.debtPositions.debtPositionItem.dueDate');

  const value = multiplePaymentOptions ? (
    <Tag value={t('app.debtPositions.debtPositionItem.noDueDate')} color="primary" />
  ) : (
    datetools.formatDate(dueDate)
  );

  return { label, value };
};
