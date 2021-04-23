import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

export const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#FFD000',
    },
    secondary: {
      main: '#000000',
    },
  },
  overrides: {
    MuiSelect: {
      root: {
        '&.MuiFilledInput-input': {
          padding: '10px 12px 10px',
        },
      },
    },
  },
};
