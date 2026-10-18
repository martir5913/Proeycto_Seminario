import { createTheme } from '@mui/material/styles';

export const umgTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1100,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: '#002B49',      // Azul Marino Institucional UMG
      light: '#1B4965',
      dark: '#00192D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D32F2F',      // Rojo UMG
      light: '#EF5350',
      dark: '#9A0007',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#C5A059',      // Dorado UMG
      contrastText: '#00192D',
    },
    background: {
      default: '#F4F6F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#00192D',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 900,
      letterSpacing: '-0.5px',
      color: '#00192D',
    },
    h2: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.3px',
      color: '#00192D',
    },
    h3: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      color: '#00192D',
    },
    h4: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.2px',
      color: '#00192D',
    },
    h5: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      color: '#002B49',
    },
    h6: {
      fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      color: '#002B49',
    },
    subtitle1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.2px',
    },
    subtitle2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
    },
    body1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.2px',
    },
    caption: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 43, 73, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 43, 73, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#002B49',
          borderBottom: '3px solid #C5A059', // Borde dorado UMG
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        maxWidthXl: {
          maxWidth: '1780px !important',
        },
      },
    },
  },
});

export default umgTheme;
