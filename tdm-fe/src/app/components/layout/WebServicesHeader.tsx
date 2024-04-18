import '~/app/components/layout/scss/WebServicesHeader.scss';
import Container from '@mui/material/Container';

const WebServicesHeader = () => {
    return (
        <div id="ws-header">
            <Container>
                <p className="text" id="ws-header-pre-title">
                    Chargez vos corpus et découvrez les résultats des services TDM
                </p>
                <h1 id="ws-header-title">
                    <span id="ws-header-title-blue">IA</span>
                    <span id="ws-header-title-green">Factory</span>
                </h1>
                <p className="text">
                    Une interface simple de chargement de corpus et d&apos;exécution d&apos;outils de TDM vous
                    permettent d&apos;exploiter vos propres données simplement.
                </p>
            </Container>
        </div>
    );
};

export default WebServicesHeader;
