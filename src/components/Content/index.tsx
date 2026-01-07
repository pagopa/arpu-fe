import React from 'react';
import { NoData } from 'components/NoData';
import { Retry } from 'components/Retry';
import QueryLoader from 'components/QueryLoader';
import { TransactionListSkeleton } from 'components/Skeleton';
import { Stack } from '@mui/material';
import { MutationKey, QueryKey } from '@tanstack/react-query';

type ContentProps = {
  showRetry: boolean;
  noData: boolean;
  onRetry: () => void;
  noDataTitle: string;
  noDataText: string;
  queryKey: MutationKey | QueryKey;
  loaderComponent?: React.ReactNode;
  children: React.ReactNode;
  onNoDataClick?: () => void;
  noDataCta?: React.ReactNode;
};

export const Content = ({
  showRetry,
  noData,
  onRetry,
  noDataTitle,
  noDataText,
  queryKey,
  children,
  noDataCta
}: ContentProps) => {
  if (showRetry) return <Retry action={onRetry} />;

  if (noData) return <NoData title={noDataTitle} text={noDataText} cta={noDataCta} />;

  return (
    <Stack mb={{ xs: 2, sm: 3 }}>
      <QueryLoader queryKey={queryKey} loaderComponent={<TransactionListSkeleton />}>
        {children}
      </QueryLoader>
    </Stack>
  );
};
