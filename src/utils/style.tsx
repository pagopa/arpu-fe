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

declare module '@mui/material/FormControlLabel' {
  interface FormControlLabelProps {
    variant?: 'radio';
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
  typography: {
    ...theme.typography,
    h4: {
      ...theme.typography.h4,
      [theme.breakpoints.down('sm')]: {
        fontSize: '24px'
      }
    },
    h5: {
      ...theme.typography.h5,
      [theme.breakpoints.down('sm')]: {
        fontSize: '20px'
      }
    },
    h6: {
      ...theme.typography.h6,
      [theme.breakpoints.down('sm')]: {
        fontSize: '18px'
      }
    }
  },
  ...theme?.components,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3)
        },
        disableGutters: {
          paddingLeft: 0,
          paddingRight: 0
        },
        maxWidthLg: {
          [theme.breakpoints.up('lg')]: {
            maxWidth: 760 + 48
          },
          [theme.breakpoints.up('xl')]: {
            maxWidth: 984 + 48
          }
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.body2.fontSize,
          fontWeight: '500'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: theme.typography.body2.fontSize
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          fontSize: theme.typography.body2.fontSize
        }
      }
    },
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
      // styleOverrides: {
      //   sizeLarge: ({ theme }) => ({
      //     minHeight: theme.spacing(6)
      //   })
      // },
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
    },
    MuiFormControlLabel: {
      ...theme?.components?.MuiFormControlLabel,
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === 'radio' && {
            display: 'flex',
            flexDirection: 'row',
            gap: theme.spacing(1),
            alignItems: 'center',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            fontWeight: '500',
            '& .MuiRadio-root': {
              padding: 0,
              width: 20,
              height: 20,
              marginLeft: theme.spacing(1)
            },
            '& .MuiTypography-root': {
              alignItems: 'center',
              fontSize: theme.typography.body2.fontSize,
              fontWeight: '500'
            }
          })
        })
      }
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
