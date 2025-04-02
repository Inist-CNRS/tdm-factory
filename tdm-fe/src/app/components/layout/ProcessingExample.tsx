import { Container } from '@mui/material';
import './ProcessingExample.scss';
import { useParams } from 'react-router-dom';
import { 
    PROCESSING_FORMAT_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_UPLOADING_STEP,
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_VALIDATION_STEP,
    PROCESSING_CONFIRMATION_STEP 
} from '~/app/pages/ProcessingCreationForm';

type ProcessingExampleProps = {
    currentStep?: number;
}

const ProcessingExample = ({ currentStep = 0 }: ProcessingExampleProps) => {
    const { type } = useParams();

    if (currentStep === PROCESSING_CONFIRMATION_STEP) {
        return null;
    }

    const getActiveClass = (stepNumber: number) => {
        switch (stepNumber) {
            case 0: // Format
                return currentStep === PROCESSING_FORMAT_STEP ? 'active' : '';
            case 1: // Upload
                return (currentStep === PROCESSING_UPLOAD_STEP || currentStep === PROCESSING_UPLOADING_STEP) ? 'active' : '';
            case 2: // Configuration
                return currentStep === PROCESSING_CONFIGURATION_STEP ? 'active' : '';
            case 3: // Validation
                return currentStep === PROCESSING_VALIDATION_STEP ? 'active' : '';
            default:
                return '';
        }
    };

    return (
        <div className="processing-example">
            <Container>
                <h2>Exemple de traitement</h2>
                <div className="steps-grid">
                    <div className={`step-card ${getActiveClass(0)}`}>
                        <div className="step-number">ÉTAPE 1</div>
                        <h3>Choisissez le format</h3>
                        <p>Vous choisissez le format de l'article que vous voulez traiter.</p>
                    </div>

                    <div className={`step-card ${getActiveClass(1)}`}>
                        <div className="step-number">ÉTAPE 2</div>
                        <h3>Téléversez votre fichier</h3>
                        <p>Téléversez le fichier au format choisi.</p>
                    </div>

                    <div className={`step-card ${getActiveClass(2)}`}>
                        <div className="step-number">ÉTAPE 3</div>
                        <h3>Choix du service</h3>
                        <p>Choisissez le service qui répond à votre besoin. Par exemple choisissez l'option : « Extraction d'entités nommées (Personnes, Localisations, Organismes et autres) ».</p>
                    </div>

                    <div className={`step-card ${getActiveClass(3)}`}>
                        <div className="step-number">ÉTAPE 4</div>
                        <h3>Remplissez votre e-mail</h3>
                        <p>Remplissez votre adresse mail, vous recevrez un message au lancement du service et à la fin du traitement avec un lien de téléchargement des résultats.</p>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ProcessingExample;
