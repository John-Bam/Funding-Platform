import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    charcoal: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary: PaletteOptions['primary'];
    charcoal: PaletteOptions['primary'];
  }
}

// Color palette constants
const FORGE_RED = '#D32F2F';
const FORGE_BLACK = '#121212';
const FORGE_DARK_GREY = '#333333';
const FORGE_LIGHT_GREY = '#E0E0E0';
const FORGE_ORANGE = '#FF5722';
const FORGE_ACCENT = '#FFC107';

const forgeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: FORGE_RED,
      light: '#FF6659',
      dark: '#9A0007',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: FORGE_ORANGE,
      light: '#FF8A50',
      dark: '#C41C00',
      contrastText: '#000000',
    },
    tertiary: {
      main: FORGE_ACCENT,
      light: '#FFF350',
      dark: '#C79100',
      contrastText: '#000000',
    },
    charcoal: {
      main: FORGE_DARK_GREY,
      light: '#5C5C5C',
      dark: '#1E1E1E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: FORGE_BLACK,
      paper: FORGE_DARK_GREY,
    },
    text: {
      primary: '#FFFFFF',
      secondary: FORGE_LIGHT_GREY,
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#29b6f6',
    },
    success: {
      main: '#66bb6a',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          textTransform: 'none',
          padding: '8px 22px',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${FORGE_RED} 30%, ${FORGE_ORANGE} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${FORGE_RED} 50%, ${FORGE_ORANGE} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          background: `linear-gradient(145deg, ${FORGE_DARK_GREY}DD 0%, ${FORGE_BLACK}FF 100%)`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${FORGE_DARK_GREY}50`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${FORGE_BLACK}E6 0%, ${FORGE_DARK_GREY}E6 100%)`,
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: `${FORGE_DARK_GREY}`,
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: FORGE_RED,
            },
            '&.Mui-focused fieldset': {
              borderColor: FORGE_RED,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default forgeTheme;