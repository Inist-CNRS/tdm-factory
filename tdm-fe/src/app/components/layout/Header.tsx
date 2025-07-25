import '~/app/components/layout/scss/Header.scss';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { alpha } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

import istexLogo from '/logo/istex.png';

const navigations = [
    { name: 'ISTEX TDM', url: 'https://services.istex.fr/' },
    {
        name: 'TM Tools Explorer',
        url: 'https://data.istex.fr/instance/tm-tools-explorer',
    },
    { name: 'Hébergement corpus', url: 'https://lodex.istex.fr/' },
];

const Header = () => {
    return (
        <>
            <AppBar position="sticky" component="nav" id="nav-bar">
                <Container id="nav-bar-container">
                    <Button
                        href="https://istex.fr/"
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                        id="nav-bar-istex-link"
                        sx={(theme) => ({
                            bgcolor: alpha(theme.palette.colors.blue, 0.2),
                        })}
                    >
                        <KeyboardBackspaceIcon />
                        istex.fr
                    </Button>
                    <ul id="nav-bar-navigation">
                        {navigations.map((navigation) => (
                            <li key={navigation.name}>
                                <Button
                                    className="nav-bar-navigation-button"
                                    href={navigation.url}
                                    target="_blank"
                                    rel="noreferrer nofollow noopener"
                                    sx={{
                                        bgcolor: '#fff',
                                    }}
                                >
                                    {navigation.name}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Container>
            </AppBar>
            <header id="header">
                <Container id="header-container">
                    <Link href="/" id="home-link">
                        <img src={istexLogo} alt="Logo istex" />
                        <h1 id="header-title">TDM Factory</h1>
                    </Link>
                    <h2 id="header-subtitle">
                        <b>L&lsquo;IA appliquée à vos corpus</b>
                    </h2>
                </Container>
            </header>
        </>
    );
};

export default Header;
