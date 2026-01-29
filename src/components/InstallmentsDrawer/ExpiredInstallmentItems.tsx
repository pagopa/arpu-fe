import React from 'react';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Box, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { Trans, useTranslation } from 'react-i18next';
import utils from 'utils';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { InstallmentChip } from 'components/StatusChips/InstallmentChip';

interface ExpiredInstallmentItemsProps {
  items: InstallmentDrawerItem[];
  totalItems: number;
}

const ExpiredInstallmentItems = ({ items, totalItems }: ExpiredInstallmentItemsProps) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Divider />
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderWidth: 1,
          mt: 3
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="overline">
            {t('app.installmentsDrawer.expiredInstallments')}
          </Typography>
          <IconButton
            aria-label="add"
            onClick={handleToggle}
            data-testid="installments-drawer-expired-installments-toggle-button">
            {open ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          </IconButton>
        </Stack>
        {open && (
          <ul
            style={{
              margin: 16,
              padding: 0
            }}>
            {items.map((item, index) => (
              <li
                key={index}
                style={{ marginBottom: 32 }}
                data-testid={`installments-drawer-expired-installment-item-${item.installmentId}`}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography
                      fontWeight={600}
                      fontSize={16}
                      fontStyle="semibold"
                      color="text.secondary">
                      {t('app.installmentsDrawer.installment.installmentNumber', {
                        installmentNumber: item.rateIndex,
                        totalInstallments: totalItems
                      })}
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    {item.amountCents && (
                      <Typography
                        data-testid={`installments-drawer-expired-installment-amount-${item.installmentId}`}
                        fontWeight={600}
                        fontSize={16}
                        fontStyle="semibold"
                        color="text.secondary">
                        {utils.converters.toEuro(item.amountCents)}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={6}>
                    <InstallmentChip
                      installment={{
                        status: InstallmentStatus.EXPIRED,
                        installmentId: item.installmentId
                      }}
                    />
                  </Grid>

                  <Grid size={6}>
                    {item.dueDate && (
                      <Typography
                        data-testid={`installments-drawer-expired-installment-expire-date-${item.installmentId}`}>
                        <Trans
                          i18nKey={t('app.installmentsDrawer.installment.expireDate', {
                            date: utils.datetools.formatDate(item.dueDate)
                          })}
                          components={{
                            strong: (
                              <Typography
                                fontSize={16}
                                fontWeight={600}
                                component="span"
                                fontStyle="semibold"
                              />
                            )
                          }}
                        />
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </>
  );
};

export default ExpiredInstallmentItems;
