import React from 'react';
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { PropsWithChildren } from 'react';
import CssBaseline from '@mui/material/CssBaseline';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    contrast: true;
  }
}

const customTheme = createTheme({
  ...theme,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  components: {
    ...theme?.components,
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `solid 2px ${theme.palette.grey[300]}`
        })
      }
    },
    MuiChip: {
      ...theme?.components?.MuiChip,
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'success' && {
            backgroundColor: theme.palette.success.extraLight
          })
        })
      }
    },
    MuiButton: {
      ...theme?.components?.MuiButton,
      styleOverrides: {
        sizeLarge: ({ theme }) => ({
          minHeight: theme.spacing(6)
        })
      },
      variants: [
        {
          props: { variant: 'contrast' },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.background.paper}`,
            color: theme.palette.primary.main,
            justifyContent: 'flex-start',
            textAlign: 'left',
            paddingX: 20,
            paddingY: 11,
            fontWeight: 700,
            '&:hover': {
              border: `1px solid ${theme.palette.primary.main}`
            }
          })
        }
      ]
    }
  }
} as ThemeOptions);

const style = {
  theme: customTheme
};

export const Theme = (props: PropsWithChildren) => (
  <>
    <CssBaseline />
    <ThemeProvider theme={style.theme}>{props.children}</ThemeProvider>
  </>
);

export default style;
