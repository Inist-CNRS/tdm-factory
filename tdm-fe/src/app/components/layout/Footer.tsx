import '~/app/components/layout/scss/Footer.scss';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import abesLogo from '/logo/abes.svg';
import cnrsLogo from '/logo/cnrs.svg';
import couperinLogo from '/logo/couperin.svg';
import franceUniversitesLogo from '/logo/france_universites.svg';
import opereParInistLogo from '/logo/opere_par_inist.svg';
import mesrLogo from '/logo/mesr.svg';
import ulLogo from '/logo/ul.svg';

const partners = [
    {
        logo: mesrLogo,
        alt: "Ministère de l'Enseignement Supérieur et de la Recherche",
        url: 'https://www.enseignementsup-recherche.gouv.fr/',
    },
    {
        logo: cnrsLogo,
        alt: 'Centre National de la Recherche Scientifique',
        url: 'https://www.cnrs.fr/',
        width: 64, // The CNRS logo grows more than the others, so it needs to be in a smaller container
    },
    {
        logo: abesLogo,
        alt: "Agence Bibliographique de l'Enseignement Supérieur",
        url: 'https://www.abes.fr/',
    },
    {
        logo: couperinLogo,
        alt: 'Couperin',
        url: 'https://www.couperin.org/',
    },
    {
        logo: franceUniversitesLogo,
        alt: 'France Universités',
        url: 'https://franceuniversites.fr/',
    },
    {
        logo: ulLogo,
        alt: 'Université de Lorraine',
        url: 'https://www.univ-lorraine.fr/',
    },
];

const MAX_ITEMS_PER_LINE = 12;

const Footer = () => {
    return (
        <footer id="footer">
            <Container id="footer-container">
                <Grid component="ul" container spacing={2}>
                    {partners.map(({ logo, alt, url, width }) => (
                        <Grid
                            key={alt}
                            component="li"
                            item
                            xs={MAX_ITEMS_PER_LINE / 2}
                            md={MAX_ITEMS_PER_LINE / partners.length}
                        >
                            <div className="footer-collaborator" style={width ? { width } : undefined}>
                                <a href={url} target="_blank" rel="noreferrer nofollow noopener">
                                    <img src={logo} alt={alt} />
                                </a>
                            </div>
                        </Grid>
                    ))}
                </Grid>

                <div id="footer-opere-par-inist">
                    <a href="https://www.inist.fr/" target="_blank" rel="noreferrer">
                        <img src={opereParInistLogo} alt="Logo Opéré par l’Inist " />
                    </a>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
