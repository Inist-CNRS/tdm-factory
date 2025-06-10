import './scss/ServiceDescription.scss';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ServiceDescription = () => {
    const navigate = useNavigate();

    const handleStartClick = () => {
        navigate('/');
    };

    return (
        <div className="service-description">
            <Container>
                <h2>TDM Factory – Transformez vos données en connaissances grâce à une interface simple dédiée à la fouille de textes</h2>

                <p className="description-text">
                    TDM Factory est une interface intuitive qui vous permet de charger vos propres données et d’y appliquer facilement des traitements de fouille de textes  (ou TDM pour <em>text and data mining</em>).
                    <br />
                    Ils sont disponibles sous forme de web services sur notre site <a href="https://services.istex.fr/">Istex TDM qui répertorie et détaille chaque web service et ses usages</a>.
                    <br />
                    Sélectionnez simplement le service qui vous intéresse&nbsp;: vous pourrez extraire, enrichir ou structurer vos données textuelles en quelques clics grâce à une <a href="https://services.istex.fr/">large gamme d’outils spécialisés</a>.
                </p>

                <p className="description-text">
                    Vous souhaitez tester&nbsp;? Chargez vos fichiers et lancez votre première analyse en quelques minutes&nbsp;!
                </p>

                <p className="description-text">
                    Vos données restent confidentielles&nbsp;: elles sont traitées temporairement sur notre serveur interne, sans aucun stockage.
                </p>

                <div className="steps-container">
                    <div className="step">
                        <DownloadIcon className="icon" />
                        <h3>Chargez vos données</h3>
                        <p>Indiquez le type de fichier à traiter et téléchargez vos données</p>
                        <p>Exemple : chargez un corpus en chimie ou en astrophysique (vous pouvez décharger votre corpus sur <a href="https://search.istex.fr/">Istex Search</a>)</p>
                    </div>

                    <div className="step">
                        <CheckIcon className="icon" />
                        <h3>Choisissez un service</h3>
                        <p>Choisissez le service web pour la fouille de textes ou TDM que vous voulez exécuter (voir la description de tous les services sur <a href="https://services.istex.fr/">Istex TDM</a>).</p>
                        <p>
                            Exemple : utilisez le service <a href="https://services.istex.fr/detection-dentites-nommees-en-chimie/">chemTag</a> pour repérer tous les composés chimiques ou le services <a href="https://services.istex.fr/detection-dentites-nommees-en-astronomie/">astroTag</a> pour extraire toutes les données célestes.
                        </p>
                    </div>

                    <div className="step">
                        <EmailIcon className="icon" />
                        <h3>Recevez le résultat</h3>
                        <p>Remplissez votre adresse mail pour recevoir le lien de téléchargement du résultat.</p>
                    </div>
                </div>
            </Container>
        </div >
    );
};

export default ServiceDescription;
