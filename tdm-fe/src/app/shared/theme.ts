import { frFR } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';

import type { TypographyStyleOptions } from '@mui/material/styles/createTypography';

export const colors = {
    veryDarkGreen: '#667F00',
    darkGreen: '#a9bb1e',
    lightGreen: '#c4d733',
    veryLightGreen: '#E3EF63',
    blue: '#458ca5',
    variantBlue: '#5BC0DE',
    darkBlue: '#2a7392',
    veryDarkBlue: '#1a3d4a',
    lightBlue: '#edf3f6',
    veryLightBlue: '#f6f9fa',
    lightRed: '#ff00001a',
    grey: '#8f8f8f',
    lightGrey: '#D9D9D9',
    darkBlack: '#1d1d1d',
    lightBlack: '#4a4a4a',
    veryLightBlack: '#4a4a4a33',
    red: '#d34315',
    white: '#fefefe',
} as const;

/* eslint-disable @typescript-eslint/consistent-type-definitions */
// Extend the PaletteOptions definition with our custom colors
declare module '@mui/material/styles/createPalette' {
    interface Palette {
        colors: typeof colors;
    }

    interface PaletteOptions {
        colors: typeof colors;
    }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

const headingOptions: TypographyStyleOptions = {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 'bold',
};

const subtitleOptions: TypographyStyleOptions = {
    fontFamily: '"Montserrat", sans-serif',
};

const theme = createTheme(
    {
        palette: {
            colors,
            primary: {
                main: colors.blue,
            },
            secondary: {
                main: colors.lightGreen,
            },
            common: {
                black: colors.darkBlack,
                white: colors.white,
            },
            text: {
                primary: colors.lightBlack,
            },
            info: {
                main: colors.blue,
            },
            error: {
                main: colors.red,
            },
        },
        typography: {
            fontFamily: '"Open Sans", sans-serif',
            h1: headingOptions,
            h2: headingOptions,
            h3: headingOptions,
            h4: headingOptions,
            h5: headingOptions,
            h6: headingOptions,
            subtitle1: subtitleOptions,
            subtitle2: subtitleOptions,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: `
                ul, ol {
                  list-style: none;
                  margin: 0;
                  padding: 0;
                }
                `,
            },
        },
    },
    frFR,
);

export default theme;
