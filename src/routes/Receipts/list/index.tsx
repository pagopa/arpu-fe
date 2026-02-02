import React, { useState } from 'react';
import { Stack, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import { Helmet } from 'react-helmet';
import config from 'utils/config';
import { useSearch } from 'hooks/useSearch';
import { ArcRoutes } from 'routes/routes';
import { Link } from 'react-router-dom';
import { Content } from 'components/Content';
import PaymentButton from 'components/PaymentButton';
import CustomPagination from 'components/DataGrid/CustomPagination';
import { ReceiptItem } from '../components/item';
import { DateRange } from 'components/DateRange';
import { Search } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

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

  const {
    query: { isError, isSuccess, data },
    applyFilters
  } = useSearch({
    query: mutation,
    filters: appliedFilters
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
  };

  const handleResetFilters = () => {
    setSearchCode('');
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({});
    applyFilters({});
  };

  return (
    <>
      <Helmet>
        <title>{`${t('pageTitles.notices')} - ${t('app.title')}`}</title>
      </Helmet>
      <Stack gap={3}>
        <Stack gap={1}>
          <Typography variant="h3" component="h1">
            {t('menu.receipts.pageTitle')}
          </Typography>
          <Typography fontSize={16} component="h2">
            {t('app.receipts.subtitle')}{' '}
            <Link to={ArcRoutes.public.RECEIPTS_SEARCH}>{t('app.receipts.subtitleLink')}</Link>
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          gap={3}
          width="100%">
          <TextField
            label="Codice Avviso"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ flex: { xs: 1, lg: 2 } }}
          />

          <Stack direction="row" gap={3} alignItems="center" flex={2}>
            <DateRange
              from={{
                onChange: (dateFrom) => setStartDate(dateFrom),
                value: startDate
              }}
              to={{ onChange: (dateTo) => setEndDate(dateTo), value: endDate }}
            />

            <Button
              variant="outlined"
              size="medium"
              sx={{ minHeight: '42px', height: '100%' }}
              onClick={handleApplyFilters}>
              {t('actions.filter')}
            </Button>

            <Button variant="text" sx={{ whiteSpace: 'nowrap' }} onClick={handleResetFilters}>
              {t('actions.resetFilters')}
            </Button>
          </Stack>
        </Stack>

        <Content
          showRetry={isError}
          noData={isSuccess && !data?.content?.length}
          onRetry={() => applyFilters(appliedFilters)}
          noDataCta={<PaymentButton />}
          queryKey="pagedUnpaidDebtPositions"
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
