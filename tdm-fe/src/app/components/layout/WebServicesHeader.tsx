import '~/app/components/layout/scss/WebServicesHeader.scss';
import Container from '@mui/material/Container';

const WebServicesHeader = () => {
    return (
        <div id="ws-header">
            <Container>
                <p className="text" id="ws-header-title">
                    Chargez vos corpus et découvrez les résultats des services TDM
                </p>
                <p className="text" id="ws-header-content">
                    IA Factory est une interface de chargement de corpus et d&apos;exécution d&apos;outils de tdm vous
                    permettant d&apos;exploiter vos propres données en simplement 3 étapes :
                    <ul>
                        <li>Téléchargez vos donnée et choisissez le format et le champ à traiter,</li>
                        <li>Choisissez le web service de TDM que vous voulez exécuter,</li>
                        <li>Remplissez votre adresse mail.</li>
                    </ul>
                    A l&apos;issu du traitement vous recevrez un mail avec un lien de téléchargement du résultat.
                </p>
            </Container>
        </div>
    );
};

export default WebServicesHeader;
