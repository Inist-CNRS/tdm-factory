import '~/app/components/layout/scss/WebServicesFooter.scss';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

const WebServicesFooter = () => {
    return (
        <div id="ws-footer">
            <Container>
                <p id="ws-footer-galaxy">La galaxie Istex</p>
                <h1>Découvrez tous nos web services</h1>
                <p id="ws-footer-text">
                    L&apos;équipe Istex vous propose une pluralité d&apos;outils pour répondre à vos besoins
                </p>
                <Button variant="contained" size="large" href="https://services.istex.fr/">
                    ISTEX TDM
                </Button>
            </Container>
        </div>
    );
};

export default WebServicesFooter;
