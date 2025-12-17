import { useTranslation } from 'react-i18next';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/data-contracts';
import React from 'react';
import { Card, IconButton, Stack, Typography } from '@mui/material';
import { propertyOrMissingValue, toEuroOrMissingValue } from 'utils/converters';
import { MoreVert } from '@mui/icons-material';

type ResultsProps = {
  installments: InstallmentDebtorExtendedDTO[];
};

const Item = ({ label, value }: { label: string; value: string }) => (
  <Stack>
    <Typography fontSize={14} variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600}>
      {value}
    </Typography>
  </Stack>
);

export const Results = ({ installments }: ResultsProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap={2}>
      {installments.map((installment) => (
        <Card
          key={installment.iuv}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderRadius: 1
          }}>
          <Stack direction="row" justifyContent="space-between" width="80%">
            <Item
              label={t('app.receiptsSearch.fields.noticeCode')}
              value={propertyOrMissingValue(installment.iuv)}
            />
            <Item
              label={t('app.receiptsSearch.fields.orgName')}
              value={propertyOrMissingValue(installment.orgName)}
            />
            <Item
              label={t('app.receiptsSearch.fields.amount')}
              value={toEuroOrMissingValue(installment.amountCents)}
            />
          </Stack>
          <IconButton>
            <MoreVert />
          </IconButton>
        </Card>
      ))}
    </Stack>
  );
};
