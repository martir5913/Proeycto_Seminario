import { createTheme } from '@mui/material/styles';

export const umgTheme = createTheme({
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
      color: '#002B49',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
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
