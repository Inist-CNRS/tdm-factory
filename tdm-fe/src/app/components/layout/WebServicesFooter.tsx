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
                    L&lsquo;équipe Istex vous propose une pluralité d&lsquo;outils pour répondre à vos besoins
                </p>
                <Button variant="contained" size="large">
                    Objectif TDM
                </Button>
            </Container>
        </div>
    );
};

export default WebServicesFooter;
