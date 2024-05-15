import '~/app/components/layout/scss/WebServicesDescription.scss';
import Container from '@mui/material/Container';

const WebServicesDescription = () => {
    return (
        <div id="ws-description">
            <Container>
                <p className="text">
                    Par exemple :
                    <ul>
                        <li>
                            chargez vos données au format CSV : VosData.csv (dans le cas de corpus ISTEX on pourra
                            utiliser le fichier compressé fourni par ISTEX),
                        </li>
                        <li>
                            choisissez le convertisseur adapté au csv («Transformation d&apos;un fichier CSV en
                            fichier») (Dans le cas de corpus ISTEX on pourra utiliser «Transformation d&apos;un fichier
                            ISTEX (format tar.gz) en fichier corpus»),
                        </li>
                        <li>dans la liste déroulante, sélectionnez le nom de la colonne que vous voulez traiter,</li>
                        <li>puis sélectionnez le web service que vous voulez exécuter,</li>
                        <li>
                            et enfin remplissez votre adresse mail, vous recevrez un message au lancement du service et
                            à la fin du traitement avec un lien de téléchargement des résultats.
                        </li>
                    </ul>
                </p>
            </Container>
        </div>
    );
};

export default WebServicesDescription;
