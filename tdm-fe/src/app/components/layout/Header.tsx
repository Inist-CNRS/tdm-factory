import '~/app/components/layout/Header.scss';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { alpha } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

import istexLogo from '/istex.png';

const navigations = [
    { name: 'Objectif TDM', url: '#' },
    { name: 'TDM Tools', url: '#' },
    { name: 'Hébergement corpus', url: '#' },
];

const Header = () => {
    return (
        <header id="header">
            <AppBar position="sticky" component="nav" id="header-nav-bar">
                <Container id="header-nav-bar-container">
                    <Button
                        href="https://istex.fr/"
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                        id="header-nav-bar-istex-link"
                        sx={(theme) => ({
                            bgcolor: alpha(theme.palette.colors.blue, 0.2),
                        })}
                    >
                        <KeyboardBackspaceIcon />
                        istex.fr
                    </Button>
                    <ul id="header-nav-bar-navigation">
                        {navigations.map((navigation) => (
                            <li key={navigation.name}>
                                <Button
                                    className="header-nav-bar-navigation-button"
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
            <Container id="header-container">
                <Link href="/" id="home-link">
                    <img src={istexLogo} alt="Logo istex" />
                    <h1 id="header-title">IA Factory</h1>
                </Link>
                <h2 id="header-subtitle">
                    <b>L&apos;IA appliquée à vos corpus</b>
                </h2>
            </Container>
        </header>
    );
};

export default Header;
