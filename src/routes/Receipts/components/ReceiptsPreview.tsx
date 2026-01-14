import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { TableHead, TableRow, TableCell, useMediaQuery, Theme, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DebtorReceiptDTO } from '../../../../generated/data-contracts';
import { Receipt } from './Receipt';

export interface ReceiptsProps {
  rows?: DebtorReceiptDTO[];
  dateOrdering?: 'ASC' | 'DESC';
  onDateOrderClick?: () => void;
  hideDateOrdering?: boolean;
}

export const ReceiptsPreview = (props: ReceiptsProps) => {
  const { t } = useTranslation();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  return (
    <TableContainer sx={{ bgcolor: 'transparent', height: 'fit-content' }}>
      <Table aria-label="Storico table" id="receipts-table">
        <TableHead sx={{ display: mdUp ? 'table-head' : 'none' }}>
          <TableRow>
            <TableCell sx={{ paddingTop: 0.75, paddingBottom: 1 }} width="60%">
              {t('app.receipts.payee')}
            </TableCell>
            <TableCell sx={{ paddingTop: 0.75, paddingBottom: 1 }}>
              <Stack direction="row" sx={{ cursor: 'pointer' }}>
                <span>{t('app.receipts.date')}</span>
              </Stack>
            </TableCell>
            <TableCell sx={{ paddingTop: 0.75, paddingBottom: 1 }} />
          </TableRow>
        </TableHead>
        <TableBody sx={{ bgcolor: 'background.paper' }}>
          {props?.rows && props.rows.map((row) => <Receipt receipt={row} key={row.receiptId} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
