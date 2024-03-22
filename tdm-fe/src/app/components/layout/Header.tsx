import '~/app/components/layout/Header.scss';
import Link from '@mui/material/Link';

import istexLogo from '/istex.png';

const Header = () => {
    return (
        <header id="header">
            <div id="header-container">
                <Link href="/public" id="home-link">
                    <img src={istexLogo} alt="Logo istex" />
                    <h1 id="header-title">IA Factory</h1>
                </Link>
                <h2 id="header-subtitle">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla non elit sit amet interdum.
                    Sed placerat ex nec eleifend tempor. Nunc porta non nulla id vehicula. Nulla diam nunc.
                </h2>
            </div>
        </header>
    );
};

export default Header;
