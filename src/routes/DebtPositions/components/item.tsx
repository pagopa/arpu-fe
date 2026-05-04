import React from 'react';
import { DebtorUnpaidDebtPositionDTO } from '../../../../generated/data-contracts';
import { generatePath } from 'react-router-dom';
import { fromTaxCodeToSrcImage, toEuroOrMissingValue } from 'utils/converters';
import { useTranslation } from 'react-i18next';
import { ROUTES } from 'routes/routes';
import { ListItem } from 'components/ListItem';
import { PayeeIcon } from 'components/PayeeIcon';
import { useDueDateField } from '../hooks/useDueDateField';

type DebtPositionItemProps = {
  debtPosition: DebtorUnpaidDebtPositionDTO;
};

export const DebtPositionItem = ({
  debtPosition: {
    orgName,
    orgFiscalCode,
    debtPositionId,
    paymentOptions,
    debtPositionTypeOrgDescription,
    organizationId
  }
}: DebtPositionItemProps) => {
  const { t } = useTranslation();
  const dateField = useDueDateField(paymentOptions);
  const amount = paymentOptions[0]?.totalAmountCents;
  const amountField = {
    label: t('app.debtPositions.debtPositionItem.amount'),
    value: toEuroOrMissingValue(amount)
  };

  const fields = amount ? [amountField, dateField] : [dateField];

  const detailPath = generatePath(ROUTES.DEBT_POSITION, { debtPositionId, organizationId });

  const Icon = () => <PayeeIcon src={fromTaxCodeToSrcImage(orgFiscalCode)} alt={orgName} visible />;

  return (
    <ListItem
      title={orgName}
      subtitle={debtPositionTypeOrgDescription}
      icon={<Icon />}
      detailPath={detailPath}
      detailAriaLabel={t('commons.detail')}
      detailTestId="receipt-details-button"
      fields={fields}
    />
  );
};
