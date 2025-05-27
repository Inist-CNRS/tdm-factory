import theme, { colors } from '~/app/shared/theme';

import { default as MuiThemeProvider } from '@mui/material/styles/ThemeProvider';
import { useEffect } from 'react';

import type { PropsWithChildren } from 'react';

export type ThemeProviderType = PropsWithChildren;

const injectCssVariable = () => {
    const style = document.documentElement.style;
    style.setProperty('--very-dark-green', colors.veryDarkGreen);
    style.setProperty('--dark-green', colors.darkGreen);
    style.setProperty('--light-green', colors.lightGreen);
    style.setProperty('--very-light-green', colors.veryLightGreen);
    style.setProperty('--blue', colors.blue);
    style.setProperty('--variant-blue', colors.variantBlue);
    style.setProperty('--light-blue', colors.lightBlue);
    style.setProperty('--very-light-blue', colors.veryLightBlue);
    style.setProperty('--light-red', colors.lightRed);
    style.setProperty('--grey', colors.grey);
    style.setProperty('--light-grey', colors.lightGrey);
    style.setProperty('--dark-black', colors.darkBlack);
    style.setProperty('--light-black', colors.lightBlack);
    style.setProperty('--very-light-black', colors.veryLightBlack);
    style.setProperty('--red', colors.red);
    style.setProperty('--white', colors.white);
    style.setProperty('--dark-blue', colors.darkBlue);
    style.setProperty('--very-dark-blue', colors.veryDarkBlue);

    style.setProperty('--text-primary', colors.lightBlack);
};

const ThemeProvider = ({ children }: ThemeProviderType) => {
    useEffect(injectCssVariable, []);

    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
