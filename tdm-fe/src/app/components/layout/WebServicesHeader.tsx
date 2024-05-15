import '~/app/components/layout/scss/WebServicesHeader.scss';
import Container from '@mui/material/Container';

const WebServicesHeader = () => {
    return (
        <div id="ws-header">
            <Container>
                <p className="text" id="ws-header-title">
                    Chargez vos corpus et découvrez les résultats des services TDM
                </p>
                <div className="text" id="ws-header-content">
                    <p>
                        IA Factory est une interface de chargement de corpus et d&apos;exécution d&apos;outils de TDM
                        vous permettant d&apos;exploiter vos propres données en simplement 3 étapes&#8239;:
                    </p>
                    <ul>
                        <li>Téléchargez vos données et choisissez le format et le champ à traiter,</li>
                        <li>Choisissez le service web de TDM que vous voulez exécuter,</li>
                        <li>Remplissez votre adresse mail.</li>
                    </ul>
                    <p>
                        À l&apos;issue du traitement vous recevrez un mail avec un lien de téléchargement du résultat.
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default WebServicesHeader;
