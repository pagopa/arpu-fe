import { Box, Select, MenuItem, Pagination, SelectChangeEvent } from '@mui/material';
import { useHashParamsListener } from 'hooks/useHashParamsListener';
import React, { useCallback } from 'react';
import utils from 'utils';

export type CustomPaginationProps = {
  sizePageOptions?: Array<number>;
  initialPage?: number; // 1-based indexing as fallback
  initialPageSize?: number;
  totalPages: number;
};

const CustomPagination = ({
  sizePageOptions = [5, 10, 20],
  initialPage = 1,
  initialPageSize = 5,
  totalPages = 1
}: CustomPaginationProps) => {
  const {
    page: hashPage,
    size: hashSize,
    ...hashParams
  } = useHashParamsListener<Record<string, unknown>>();

  const getPageFromHash = () => {
    const page = hashPage ? Number(hashPage) : initialPage;
    return isNaN(page) || page < 1 ? initialPage : page;
  };

  const getSizeFromHash = () => {
    const size = Number(hashSize);
    return isNaN(size) || size < 1 ? initialPageSize : size;
  };

  const page = getPageFromHash();
  const pageSize = getSizeFromHash();

  const hidePreviousButton = page === 1;
  const hideNextButton = page === totalPages;

  // Write updated params into URL hash
  const updateHashParams = useCallback(
    (newPage: number, newSize: number) => {
      const paramsObj = {
        ...hashParams,
        page: newPage,
        size: newSize
      };

      const encoded = utils.URI.encode(paramsObj);
      utils.URI.set(encoded);
    },
    [hashParams]
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    updateHashParams(newPage, pageSize);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    if (!isNaN(newSize)) {
      updateHashParams(page, newSize);
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <Select
        value={pageSize}
        onChange={handlePageSizeChange}
        size="small"
        data-testid="result-set-select"
        sx={{
          fontSize: 12
        }}>
        {sizePageOptions?.map((size) => (
          <MenuItem key={size} value={size} data-testid={`select-size-${size}`}>
            {size}
          </MenuItem>
        ))}
      </Select>

      <Pagination
        variant="text"
        page={page}
        siblingCount={1}
        boundaryCount={0}
        count={totalPages}
        hidePrevButton={hidePreviousButton}
        hideNextButton={hideNextButton}
        onChange={handlePageChange}
      />
    </Box>
  );
};

export default CustomPagination;
