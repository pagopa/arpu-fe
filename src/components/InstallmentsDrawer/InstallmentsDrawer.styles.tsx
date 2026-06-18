import { SxProps, Theme } from '@mui/material';

export const installmentsDrawerStyles = (theme: Theme): Record<string, SxProps> => ({
  container: {
    zIndex: 10,
    position: 'fixed',
    right: 0,
    top: 0,
    width: { xs: '100%', sm: '360px' },
    backgroundColor: theme.palette.background.paper,
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(3)
  },
  overlay: {
    bgcolor: 'rgba(23, 50, 77, 0.7)',
    zIndex: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%'
  },
  header: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  }
});
