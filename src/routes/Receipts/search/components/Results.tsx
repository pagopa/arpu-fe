import { useTranslation } from 'react-i18next';
import {
  InstallmentDebtorExtendedDTO,
  InstallmentStatus
} from '../../../../../generated/data-contracts';
import React from 'react';
import { Card, Chip, ChipOwnProps, Stack, Typography } from '@mui/material';
import { propertyOrMissingValue, toEuroOrMissingValue } from 'utils/converters';
import { Actions } from './Actions';
import { InstallmentType } from 'utils/loaders';

type ResultsProps = {
  installments: InstallmentDebtorExtendedDTO[];
  installmentType: InstallmentType;
};

const Item = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack>
    <Typography fontSize={14} variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600}>
      {value}
    </Typography>
  </Stack>
);

const statusColorMap: Record<InstallmentStatus, ChipOwnProps['color']> = {
  [InstallmentStatus.CANCELLED]: 'warning',
  [InstallmentStatus.DRAFT]: 'default',
  [InstallmentStatus.EXPIRED]: 'error',
  [InstallmentStatus.INVALID]: 'error',
  [InstallmentStatus.PAID]: 'success',
  [InstallmentStatus.REPORTED]: 'warning',
  [InstallmentStatus.TO_SYNC]: 'info',
  [InstallmentStatus.UNPAID]: 'default',
  [InstallmentStatus.UNPAYABLE]: 'error'
};

export const Results = ({ installments, installmentType }: ResultsProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap={2}>
      {installments.map((installment) => (
        <Card
          key={installment.installmentId}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderRadius: 1
          }}>
          <Stack direction="row" justifyContent="space-between" width="80%">
            <Item label={t('fields.noticeCode')} value={propertyOrMissingValue(installment.iuv)} />
            <Item label={t('fields.orgName')} value={propertyOrMissingValue(installment.orgName)} />
            <Item
              label={t('fields.amount')}
              value={toEuroOrMissingValue(installment.amountCents)}
            />
            {installmentType === InstallmentType.ALL && (
              <Item
                label={t('fields.status')}
                value={
                  <Chip
                    label={t(`installments.status.${installment.status}`)}
                    color={statusColorMap[installment.status]}
                  />
                }
              />
            )}
          </Stack>
          <Actions installment={installment} installmentType={installmentType} />
        </Card>
      ))}
    </Stack>
  );
};
