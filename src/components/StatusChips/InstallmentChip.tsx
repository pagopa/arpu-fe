import { Chip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstallmentDebtorExtendedDTO, InstallmentStatus } from '../../../generated/apiClient';

type InstallmentChipProps = {
  installment: Pick<InstallmentDebtorExtendedDTO, 'status' | 'installmentId'>;
};

export const InstallmentChip = ({
  installment: { status, installmentId }
}: InstallmentChipProps) => {
  const { t } = useTranslation();

  const getInstallmentStatusColor = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'success';
      case InstallmentStatus.REPORTED:
        return 'success';
      case InstallmentStatus.UNPAID:
        return 'default';
      case InstallmentStatus.EXPIRED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      data-testid={`installment-chip-${installmentId}`}
      label={t(`installment.status.${status}`)}
      color={getInstallmentStatusColor(status)}
    />
  );
};
