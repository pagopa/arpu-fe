import { Grid, styled, useTheme, Box, Typography } from '@mui/material';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridValidRowModel,
  GridSortModel
} from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';
import { useCallback } from 'react';
import CustomPagination, { CustomPaginationProps } from './CustomPagination';
import utils from '../../utils';
import { useHashParamsListener } from '../../hooks/useHashParamsListener';
import React from 'react';

const StyledDataGrid = styled(DataGrid)({
  border: 'none !important',
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: theme.palette.grey[200]
  },
  '& .MuiDataGrid-columnSeparator': {
    color: theme.palette.grey[200]
  },
  '&.Mui-active': {
    color: 'gray', // Color for active sort label text
    '& .MuiTableSortLabel-icon': {
      color: 'gray' // Color for the sort arrow icon
    }
  },
  '& .MuiDataGrid-iconButtonContainer': {
    '& .MuiIconButton-root': {
      backgroundColor: 'transparent',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent'
      }
    }
  },
  '& .MuiDataGrid-sortIcon': {
    color: theme.palette.text.primary,
    opacity: 1
  },
  backgroundColor: theme.palette.background.paper
});

export type CustomDataGridProps<T extends GridValidRowModel> = {
  rows: Array<T>;
  columns: Array<GridColDef>;
  initialSortModel?: GridSortModel;
} & DataGridProps &
  CustomPaginationProps;

export const CustomDataGrid = <T extends GridValidRowModel>({
  rows,
  columns,
  initialSortModel = [],
  ...rest
}: CustomDataGridProps<T>) => {
  // Read from URL hash params directly
  const {
    sortField: hashSort,
    sortDirection: hashSortDirection,
    ...hashParams
  } = useHashParamsListener<Record<string, unknown>>();

  const getSortModelFromHash = (): GridSortModel => {
    const sortField = typeof hashSort === 'string' ? hashSort : undefined;
    const sortDirection =
      typeof hashSortDirection === 'string' &&
      (hashSortDirection === 'asc' || hashSortDirection === 'desc')
        ? (hashSortDirection as 'asc' | 'desc')
        : undefined;
    return sortField && sortDirection
      ? [{ field: sortField, sort: sortDirection }]
      : initialSortModel;
  };
  const sortModel = getSortModelFromHash();

  const updateHashSortModel = useCallback(
    (newSortModel: GridSortModel) => {
      const sort =
        newSortModel.length > 0
          ? {
              sortField: newSortModel[0].field,
              sortDirection: newSortModel[0].sort
            }
          : {};

      const paramsObj = {
        ...hashParams,
        ...sort
      };

      const encoded = utils.URI.encode(paramsObj);
      utils.URI.set(encoded);
    },
    [hashParams]
  );

  return (
    <Grid
      container
      p={2}
      sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
      aria-label="results-table">
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationMode="client"
        sortingMode="client"
        sortModel={sortModel}
        onSortModelChange={updateHashSortModel}
        hideFooterSelectedRowCount
        slots={{
          pagination: () => <CustomPagination {...rest} />
        }}
        {...rest}
      />
    </Grid>
  );
};

export const EmptyData = (props: { title: string; description: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[200],
        padding: 2
      }}>
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          padding: 2
        }}>
        <Typography textAlign="center" fontWeight={600} mb={1}>
          {props.title}
        </Typography>
        <Typography textAlign="center">{props.description}</Typography>
      </Box>
    </Box>
  );
};
