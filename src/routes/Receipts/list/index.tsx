import React, { useState } from 'react';
import { Stack, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import config from 'utils/config';
import { useSearch } from 'hooks/useSearch';
import { ROUTES } from 'routes/routes';
import { Link } from 'react-router-dom';
import { Content } from 'components/Content';
import PaymentButton from 'components/PaymentButton';
import CustomPagination from 'components/DataGrid/CustomPagination';
import { ReceiptItem } from '../components/item';
import { DateRange } from 'components/DateRange';
import { Search } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { ResponsiveDrawer } from 'components/ResponsiveDrawer';

type Filters = {
  noticeNumberOrIuv?: string;
  paymentDateTimeFrom?: string;
  paymentDateTimeTo?: string;
};

export const ReceiptsList = () => {
  const { t } = useTranslation();
  const brokerId = Number(config.brokerId);
  const mutation = utils.loaders.getPagedDebtorReceipts(brokerId);

  const { noticeNumberOrIuv, paymentDateTimeFrom, paymentDateTimeTo } = utils.URI.decode(
    window.location.hash
  );

  const initialIuv = noticeNumberOrIuv || '';
  const initialFrom = paymentDateTimeFrom ? dayjs(paymentDateTimeFrom) : null;
  const initialTo = paymentDateTimeTo ? dayjs(paymentDateTimeTo) : null;

  const [searchCode, setSearchCode] = useState(initialIuv);
  const [startDate, setStartDate] = useState<Dayjs | null>(initialFrom);
  const [endDate, setEndDate] = useState<Dayjs | null>(initialTo);
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    noticeNumberOrIuv: initialIuv,
    paymentDateTimeFrom: initialFrom?.format(),
    paymentDateTimeTo: initialTo?.format()
  });

  // Drawer state — lifted here so Apply/Reset can close it
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    query: { isError, isSuccess, data },
    applyFilters
  } = useSearch({
    query: mutation,
    filters: appliedFilters,
    initialSort: ['paymentDateTime,desc']
  });

  const handleApplyFilters = () => {
    const newFilters: Filters = {};

    if (searchCode.trim()) {
      newFilters.noticeNumberOrIuv = searchCode.trim();
    }
    if (startDate) {
      newFilters.paymentDateTimeFrom = startDate.format();
    }
    if (endDate) {
      newFilters.paymentDateTimeTo = endDate.format();
    }

    setAppliedFilters(newFilters);
    applyFilters(newFilters);
    setDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setSearchCode('');
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({});
    applyFilters({});
    setDrawerOpen(false);
  };

  const filters = (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      alignItems={{ xs: 'stretch', lg: 'center' }}
      gap={3}
      width="100%">
      <TextField
        label={t('fields.noticeCode')}
        size="small"
        value={searchCode}
        onChange={(e) => setSearchCode(e.target.value)}
        sx={{ flex: { xs: 1, lg: 2 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            )
          }
        }}
      />

      <DateRange
        from={{ onChange: setStartDate, value: startDate }}
        to={{ onChange: setEndDate, value: endDate }}
      />

      <Button
        variant="outlined"
        size="medium"
        sx={{ maxHeight: '42px' }}
        data-testid="apply-filters"
        onClick={handleApplyFilters}>
        {t('actions.filter')}
      </Button>

      <Button variant="text" sx={{ whiteSpace: 'nowrap', padding: 0 }} onClick={handleResetFilters}>
        {t('actions.resetFilters')}
      </Button>
    </Stack>
  );

  return (
    <>
      <Stack gap={3}>
        {/* Page heading */}
        <Stack gap={1}>
          <Typography variant="h3" component="h1">
            {t('menu.receipts.pageTitle')}
          </Typography>
          <Typography fontSize={16} component="h2">
            {t('app.receipts.subtitle')}{' '}
            <Link to={ROUTES.public.RECEIPTS_SEARCH}>{t('app.receipts.subtitleLink')}</Link>
          </Typography>
        </Stack>
        {/* Filters */}
        <ResponsiveDrawer
          label={t('actions.filter')}
          open={drawerOpen}
          onOpen={() => setDrawerOpen(true)}
          onClose={() => setDrawerOpen(false)}>
          {filters}
        </ResponsiveDrawer>

        {/* Results list */}
        <Content
          showRetry={isError}
          noData={isSuccess && !data?.content?.length}
          onRetry={() => applyFilters(appliedFilters)}
          noDataCta={<PaymentButton />}
          queryKey="pagedDebtorReceipts"
          noDataTitle={t('app.receipts.empty.title')}
          noDataText={t('app.receipts.empty.subtitle')}>
          <Stack gap={2}>
            {data?.content?.map((receipt) => (
              <ReceiptItem key={receipt.receiptId} receipt={receipt} />
            ))}
          </Stack>
        </Content>

        {data?.totalPages && data.totalPages > 0 ? (
          <CustomPagination totalPages={data?.totalPages ?? 1} />
        ) : null}
      </Stack>
    </>
  );
};
