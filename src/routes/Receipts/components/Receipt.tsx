import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia';
import { ArcRoutes } from 'routes/routes';
import { PayeeIcon } from 'components/PayeeIcon';
import { formatDateOrMissingValue, fromTaxCodeToSrcImage } from 'utils/converters';
import { DebtorReceiptDTO } from '../../../../generated/arpu-be/data-contracts';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottomColor: theme.palette.divider,
  cursor: 'pointer'
}));

export const Receipt = ({
  orgName,
  orgFiscalCode,
  paymentDateTime,
  receiptId
}: DebtorReceiptDTO) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const navigate = useNavigate();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const tableCellCssDisplayProperty = mdUp ? 'table-cell' : 'none';

  return (
    <TableRow
      hover
      role="button"
      data-testid="transaction-details-button"
      onClick={() => navigate(`${ArcRoutes.RECEIPTS}/${receiptId}`)}>
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
        <StyledTableCell width="56px">
          <ArrowForwardIosIcon color="primary" fontSize="small" />
        </StyledTableCell>
      )}
    </TableRow>
  );
};
