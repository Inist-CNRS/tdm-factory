import './scss/ServiceDescription.scss';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
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
                <h2>IA Factory c'est quoi ?</h2>
                <p className="description-text">
                    IA Factory est une interface de chargement de corpus et d'exécution d'outils de TDM vous permettant 
                    d'exploiter vos propres données en quelques étapes. Nous garantissons l'anonymat, les données 
                    que vous nous confiez sont traitées sur notre serveur interne et ne sont pas conservées.
                </p>

                <div className="steps-container">
                    <div className="step">
                        <DownloadIcon className="icon" />
                        <h3>Chargez vos données</h3>
                        <p>Indiquez le type de fichier à traiter et téléchargez vos données</p>
                    </div>

                    <div className="step">
                        <TaskAltIcon className="icon" />
                        <h3>Choisir un service</h3>
                        <p>Choisissez le service web pour la fouille de textes ou TDM que vous voulez exécuter.</p>
                    </div>

                    <div className="step">
                        <EmailIcon className="icon" />
                        <h3>Informations</h3>
                        <p>Remplissez votre adresse mail pour recevoir le lien de téléchargement du résultat.</p>
                    </div>
                </div>

                <div className="start-button">
                    <Button variant="contained" onClick={handleStartClick}>
                        Commencer un traitement
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default ServiceDescription;