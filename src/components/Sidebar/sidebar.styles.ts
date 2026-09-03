import { SxProps, Theme } from '@mui/material';

export const sidebarStyles = (theme: Theme, collapsed: boolean): Record<string, SxProps> => ({
  container: {
    zIndex: collapsed ? 1 : 10,
    position: collapsed ? 'relative' : 'fixed',
    width: '100%',
    top: 0,
    height: '100vh',
    transition: 'width 0.3s ease, height 0.3s ease', // Add transition for smooth resizing
    [theme.breakpoints.between('sm', 'lg')]: { width: collapsed ? '100%' : 300 },
    [theme.breakpoints.up('lg')]: {
      width: collapsed ? 'fit-content' : 300,
      position: 'sticky',
      zIndex: 1,
      // stretch to the row height so the sidebar always reaches the footer
      height: 'auto',
      minHeight: '100vh',
      bgcolor: 'background.paper'
    },
    [theme.breakpoints.down('lg')]: {
      height: collapsed ? 'fit-content' : '100%',
      // no width tween: the drawer would visibly shrink from full width to 300px
      transition: 'height 0.3s ease'
    }
  },
  nav: {
    minHeight: collapsed ? '1vh' : '50vh',
    height: '100%',
    width: '100%',
    bgcolor: 'background.paper',
    margin: 0,
    transition: 'margin 0.3s ease', // Add transition for smooth width change
    [theme.breakpoints.up('lg')]: { minHeight: '50vh' }
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
  collapseIcon: {
    textAlign: 'right',
    pt: 2,
    pr: 2
  },
  list: {
    [theme.breakpoints.down('lg')]: {
      display: collapsed ? 'none' : 'inline-block'
    },
    top: 0,
    position: 'sticky'
  },
  hamburgerBox: {
    marginTop: 'auto',
    position: 'sticky',
    bottom: '0',
    transition: 'opacity 0.3s ease', // Add transition for smooth visibility change
    [theme.breakpoints.down('lg')]: {
      marginTop: collapsed ? 0 : 'auto',
      opacity: collapsed ? 1 : 0,
      visibility: collapsed ? 'visible' : 'hidden'
    }
  },
  hamburgerIcon: {
    p: 2,
    mr: -1,
    [theme.breakpoints.down('lg')]: {
      mr: 0
    }
  },
  hamburgerTypography: {
    fontWeight: 600,
    pl: 1
  }
});
