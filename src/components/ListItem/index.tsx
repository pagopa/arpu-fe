import React from 'react';
import { ChevronRight } from '@mui/icons-material';
import { Stack, Typography, IconButton, Theme, useMediaQuery, Divider, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia';

export interface ListItemField {
  label: string;
  value: React.ReactNode;
  variant?: 'body2' | 'caption';
  fontWeight?: number;
}

export interface GenericListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  fields?: ListItemField[];
  detailPath: string;
  detailAriaLabel?: string;
  detailTestId?: string;
}

export const ListItem = ({
  title,
  subtitle,
  icon,
  fields = [],
  detailPath,
  detailAriaLabel = 'View details',
  detailTestId = 'detail-button'
}: GenericListItemProps) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const md = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(detailPath);
  };

  return (
    <Stack
      bgcolor="background.paper"
      borderRadius={2}
      gap={3}
      role="listitem"
      p={{ xs: 2, sm: 3 }}
      direction={{ xs: 'column', md: 'row' }}
      justifyContent={'space-between'}
      alignItems={{ xs: 'flex-start', md: 'center' }}>
      <Stack direction="row" spacing={{ xs: 0, sm: 2 }} alignItems="center">
        {sm ? (
          <Box aria-hidden="true" sx={{ display: 'flex' }}>
            {icon}
          </Box>
        ) : null}
        <Stack>
          <Typography
            variant="body2"
            component="h3"
            fontWeight={600}
            data-testid="list-item-ec"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%'
            }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              component="h4"
              data-testid="list-item-description"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>

      {md ? null : <Divider flexItem aria-hidden="true" />}
      <Stack
        minHeight={theme.spacing(10)}
        direction="row"
        alignItems="center"
        gap={2}
        justifyContent="space-between"
        width={{ xs: '100%', md: '50%', lg: '25%' }}>
        <Stack gap={2} alignItems="center" direction="row">
          {md ? (
            <Divider
              orientation="vertical"
              flexItem
              aria-hidden="true"
              sx={{ minHeight: theme.spacing(10) }}
            />
          ) : null}
          <Stack component="dl" gap={1} sx={{ m: 0 }}>
            {fields.map((field, index) => (
              <Box key={index}>
                <Typography component="dt" variant="caption" color="text.secondary" fontSize={16}>
                  {field.label}
                </Typography>
                <Typography
                  component="dd"
                  variant={field.variant || 'body2'}
                  fontWeight={field.fontWeight || 600}
                  fontSize={18}
                  sx={{
                    m: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}>
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
        <IconButton
          color="primary"
          onClick={handleClick}
          size="small"
          aria-label={detailAriaLabel}
          data-testid={detailTestId}>
          <ChevronRight />
        </IconButton>
      </Stack>
    </Stack>
  );
};
