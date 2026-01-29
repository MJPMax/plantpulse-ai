import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6B4F3A' },
    secondary: { main: '#8B6E55' },
    background: {
      default: '#E8E6E3',
      paper: '#F5F3F0',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#6B6B6B',
    },
    divider: '#D4D1CC',
    error: { main: '#C1382E' },
    warning: { main: '#C47A20' },
    success: { main: '#3A7D44' },
    info: { main: '#3670A1' },
  },
  typography: {
    fontFamily: '"IBM Plex Mono", "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace',
    h5: { fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.02em', textTransform: 'uppercase' as const },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8rem', lineHeight: 1.5, color: '#6B6B6B' },
    caption: { fontSize: '0.7rem', color: '#8A8A8A' },
    button: { fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace', fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': "url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap')",
        body: {
          backgroundColor: '#E8E6E3',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #D4D1CC',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.7rem', fontFamily: '"IBM Plex Mono", monospace' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '0.78rem', borderRadius: 6 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } },
        outlined: { borderColor: '#D5D1CA' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#8A8A8A',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderColor: '#D4D1CC' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 40 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: '0.8rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiInputBase-input': { fontSize: '0.8rem' } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
