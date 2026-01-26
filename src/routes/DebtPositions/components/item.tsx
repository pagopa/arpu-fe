import React from 'react';
import { DebtorUnpaidDebtPositionDTO } from '../../../../generated/data-contracts';
import { generatePath } from 'react-router-dom';
import { fromTaxCodeToSrcImage, toEuroOrMissingValue } from 'utils/converters';
import { useTranslation } from 'react-i18next';
import { ArcRoutes } from 'routes/routes';
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
  const { label, value } = useDueDateField(paymentOptions);

  const detailPath = generatePath(ArcRoutes.DEBT_POSITION, { debtPositionId, organizationId });

  const Icon = () => <PayeeIcon src={fromTaxCodeToSrcImage(orgFiscalCode)} alt={orgName} visible />;

  return (
    <ListItem
      title={orgName}
      subtitle={debtPositionTypeOrgDescription}
      icon={<Icon />}
      detailPath={detailPath}
      detailAriaLabel={t('commons.detail')}
      detailTestId="receipt-details-button"
      fields={[
        {
          label: t('app.debtPositions.debtPositionItem.amount'),
          value: toEuroOrMissingValue(paymentOptions[0]?.totalAmountCents)
        },
        {
          label,
          value
        }
      ]}
    />
  );
};
