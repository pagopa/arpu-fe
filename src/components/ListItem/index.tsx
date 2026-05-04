import React from 'react';
import { ChevronRight } from '@mui/icons-material';
import { Stack, Typography, IconButton, Card, Theme, useMediaQuery, Divider } from '@mui/material';
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
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(detailPath);
  };

  return (
    <Card role="listitem">
      <Stack height={theme.spacing(19)} justifyContent="center">
        <Stack
          p={{ sm: 3, xs: 2 }}
          direction="row"
          justifyContent={'space-between'}
          alignItems="center">
          <Stack direction="row" spacing={{ xs: 0, sm: 2 }} alignItems="center">
            {smUp ? icon : null}
            <Stack>
              <Typography
                variant="body2"
                fontWeight={600}
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

          <Stack
            direction="row"
            alignItems="center"
            gap={2}
            justifyContent="space-between"
            width={{ xs: '50%', sm: '30%', md: '25%', xl: '20%' }}>
            <Stack gap={2} alignItems="center" direction="row">
              <Divider orientation="vertical" flexItem sx={{ height: theme.spacing(13) }} />
              <Stack gap={1}>
                {fields.map((field, index) => (
                  <Stack key={index}>
                    <Typography variant="caption" color="text.secondary" fontSize={16}>
                      {field.label}
                    </Typography>
                    <Typography
                      variant={field.variant || 'body2'}
                      fontWeight={field.fontWeight || 600}
                      fontSize={18}
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}>
                      {field.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            {sm && (
              <IconButton
                onClick={handleClick}
                size="small"
                aria-label={detailAriaLabel}
                data-testid={detailTestId}>
                <ChevronRight />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};
