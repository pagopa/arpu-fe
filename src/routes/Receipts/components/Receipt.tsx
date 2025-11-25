import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Box, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia';
import { ArcRoutes } from 'routes/routes';
import { PayeeIcon } from 'components/PayeeIcon';
import { formatDateOrMissingValue, fromTaxCodeToSrcImage } from 'utils/converters';
import { DebtorReceiptDTO } from '../../../../generated/arpu-be/data-contracts';
import { ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottomColor: theme.palette.divider,
  cursor: 'pointer'
}));

type ReceiptProps = {
  receipt: DebtorReceiptDTO;
};

export const Receipt = ({
  receipt: { orgName, orgFiscalCode, paymentDateTime, receiptId, organizationId }
}: ReceiptProps) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const tableCellCssDisplayProperty = mdUp ? 'table-cell' : 'none';

  const detailPath = generatePath(ArcRoutes.RECEIPT, { receiptId, organizationId });

  return (
    <TableRow
      hover
      role="button"
      data-testid="receipt-details-button"
      onClick={() => navigate(detailPath)}>
      <StyledTableCell>
        <Stack direction="row" spacing={{ xs: 0, sm: 2 }} alignItems="center">
          <PayeeIcon src={fromTaxCodeToSrcImage(orgFiscalCode)} alt={orgName} visible={smUp} />
          <Box sx={{ maxWidth: '30vw' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
              {orgName}
            </Typography>
            {!mdUp && (
              <Typography variant="caption" color="text.secondary">
                {formatDateOrMissingValue(paymentDateTime)}
              </Typography>
            )}
          </Box>
        </Stack>
      </StyledTableCell>

      <StyledTableCell sx={{ display: tableCellCssDisplayProperty }}>
        <Typography variant="body2">{formatDateOrMissingValue(paymentDateTime)}</Typography>
      </StyledTableCell>

      {sm && (
        <Link to={detailPath} aria-label={t('commons.detail')} data-testid="receipt-details-button">
          <IconButton size="small">
            <ChevronRight />
          </IconButton>
        </Link>
      )}
    </TableRow>
  );
};
