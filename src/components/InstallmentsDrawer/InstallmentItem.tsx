import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import utils from 'utils';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { useTranslation, Trans } from 'react-i18next';
import { Accent } from 'routes/DebtPositionDetail/components/PaymentOptionItem';

interface InstallmentItemProps {
  item: InstallmentDrawerItem;
  totalItems: number;
  type: 'added' | 'available';
  action: (item: InstallmentDrawerItem) => void;
}

const InstallmentItem = ({ item, totalItems, type, action }: InstallmentItemProps) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row">
      <IconButton aria-label="add">
        {type === 'added' ? (
          <RemoveCircleOutlineIcon onClick={() => action(item)} color="error" />
        ) : (
          <AddCircleIcon onClick={() => action(item)} />
        )}
      </IconButton>
      <Box
        sx={{
          py: 1,
          px: 2,
          borderRadius: 2,
          borderColor: 'divider',
          borderWidth: '1px',
          borderStyle: 'solid',
          flexGrow: 1
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            {/*  Installment X of Y */}
            <Box>
              <Accent>
                {t('app.installmentsDrawer.installment.installmentNumber', {
                  installmentNumber: item.rateIndex,
                  totalInstallments: totalItems
                })}
              </Accent>
            </Box>
            {
              /* Due date */
              item.dueDate && (
                <Typography fontSize={16} fontWeight={400}>
                  <Trans
                    i18nKey={t('app.installmentsDrawer.installment.dueDate', {
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
              )
            }
          </Stack>
          {
            /* Amount */
            item.amountCents && (
              <Typography fontWeight={600} fontSize={18} fontStyle="semibold">
                {utils.converters.toEuro(item.amountCents)}
              </Typography>
            )
          }
        </Stack>
      </Box>
    </Stack>
  );
};

export default InstallmentItem;
