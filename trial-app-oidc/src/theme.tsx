import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    colors: {
      [key: string]: string;
    };
  }
  interface PaletteOptions {
    colors?: {
      [key: string]: string;
    };
  }
}

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#EA6C3B',
    },
    secondary: {
      main: '#5930CC',
    },
    colors: {
      lightGray: '#E8EBF0',
    },
  },
});

export default theme;
