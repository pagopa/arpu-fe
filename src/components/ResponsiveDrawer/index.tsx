import React, { useId } from 'react';
import {
  Box,
  Drawer,
  DrawerProps,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close, FilterAlt } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ResponsiveDrawerProps {
  /** content to render — inline on lg+, inside a drawer on smaller screens */
  children: React.ReactNode;
  /** label for the open-drawer button and the drawer heading (falls back to a translated default) */
  label?: string;
  /** Controlled open state. When omitted the component manages it internally. */
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Responsive filter container.
 *
 * - xs / sm  → bottom drawer
 * - md       → right drawer
 * - lg+      → inline (no drawer, children rendered directly)
 *
 * Pass `children` as the drawer content. On small screens a button
 * is rendered; tapping it opens the drawer.
 */
export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  children,
  label,
  open,
  onOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Breakpoint booleans
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const headingId = useId();
  const drawerTitle = label ?? t('actions.filters', 'Filters');

  // lg+: no drawer
  if (isLg) {
    return <>{children}</>;
  }

  // xs: render a trigger button & drawer
  const anchor = isMd ? 'right' : 'bottom';

  const drawerSx: DrawerProps['sx'] =
    anchor === 'right'
      ? {
          '& .MuiDrawer-paper': {
            width: { md: '70%' },
            p: 3,
            boxSizing: 'border-box'
          }
        }
      : {
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 3,
            maxHeight: '80%',
            minHeight: '50%',
            boxSizing: 'border-box'
          }
        };

  return (
    <>
      {/* Trigger button: visible only when drawer is closed */}
      <Box
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center' }}
        aria-haspopup="dialog">
        <IconButton
          onClick={onOpen}
          sx={{ gap: 1 }}
          disableRipple
          aria-label={drawerTitle}
          size="medium"
          color="primary">
          <FilterAlt fontSize="small" />
          <Typography variant="button" color="primary">
            {drawerTitle}
          </Typography>
        </IconButton>
      </Box>

      <Drawer
        anchor={anchor}
        open={open}
        onClose={onClose}
        sx={drawerSx}
        aria-labelledby={headingId}
        keepMounted={false}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: '#17324DB2'
            }
          }
        }}>
        <Stack gap={3} role="dialog" aria-modal="true" aria-labelledby={headingId}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              id={headingId}
              component="h2"
              fontSize="14px"
              fontWeight={700}
              sx={{ textTransform: 'uppercase' }}>
              {drawerTitle}
            </Typography>
            <IconButton
              onClick={onClose}
              aria-label={t('actions.close', 'Close')}
              size="small"
              sx={{
                '&:focus-visible': {
                  outline: `3px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2
                }
              }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>

          {/* content */}
          <Stack gap={2}>{children}</Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default ResponsiveDrawer;
