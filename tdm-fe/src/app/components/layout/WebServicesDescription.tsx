import '~/app/components/layout/scss/WebServicesDescription.scss';
import Container from '@mui/material/Container';

const WebServicesDescription = () => {
    return (
        <div id="ws-description">
            <Container className="text">
                <p>Par exemple&#8239;:</p>
                <ul>
                    <li>
                        chargez vos données au format CSV&#8239;: VosData.csv
                        (dans le cas de corpus ISTEX on pourra utiliser le
                        fichier compressé fourni par ISTEX),
                    </li>
                    <li>
                        choisissez le convertisseur adapté au csv («&#8239;Transformation d&apos;un fichier CSV en
                        fichier&#8239;»)
                        (dans le cas de corpus ISTEX on pourra
                        utiliser «&#8239;Transformation d&apos;un fichier ISTEX
                        (format tar.gz) en fichier corpus&#8239;»),
                    </li>
                    <li>
                        dans la liste déroulante, sélectionnez le nom de la
                        colonne que vous voulez traiter,
                    </li>
                    <li>
                        puis sélectionnez le web service que vous voulez
                        exécuter,
                    </li>
                    <li>
                        et enfin remplissez votre adresse mail, vous recevrez un
                        message au lancement du service et à la fin du
                        traitement avec un lien de téléchargement des résultats.
                    </li>
                </ul>
            </Container>
        </div>
    );
};

export default WebServicesDescription;
