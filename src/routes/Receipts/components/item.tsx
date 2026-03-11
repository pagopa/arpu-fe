import React from 'react';
import { useMediaQuery } from '@mui/material';
import { generatePath } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia';
import { ROUTES } from 'routes/routes';
import { PayeeIcon } from 'components/PayeeIcon';
import {
  formatDateOrMissingValue,
  fromTaxCodeToSrcImage,
  toEuroOrMissingValue
} from 'utils/converters';
import { DebtorReceiptDTO } from '../../../../generated/data-contracts';
import { useTranslation } from 'react-i18next';
import { ListItem } from 'components/ListItem';

type ReceiptItemProps = {
  receipt: DebtorReceiptDTO;
};

export const ReceiptItem = ({
  receipt: {
    debtPositionTypeOrgDescription,
    orgName,
    orgFiscalCode,
    paymentDateTime,
    receiptId,
    organizationId,
    paymentAmountCents
  }
}: ReceiptItemProps) => {
  const { t } = useTranslation();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const detailPath = generatePath(ROUTES.RECEIPT, { receiptId, organizationId });

  return (
    <ListItem
      title={orgName}
      subtitle={debtPositionTypeOrgDescription}
      icon={<PayeeIcon src={fromTaxCodeToSrcImage(orgFiscalCode)} alt={orgName} visible={smUp} />}
      detailPath={detailPath}
      detailAriaLabel={t('commons.detail')}
      detailTestId="receipt-details-button"
      fields={[
        {
          label: t('app.receipts.amount'),
          value: toEuroOrMissingValue(paymentAmountCents)
        },
        {
          label: t('app.receipts.paymentDateTime'),
          value: formatDateOrMissingValue(paymentDateTime)
        }
      ]}
    />
  );
};
