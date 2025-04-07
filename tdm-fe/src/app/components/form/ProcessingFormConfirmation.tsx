import { status } from '~/app/services/status/status';
import Status from '~/app/shared/Status';

import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { memo, useEffect, useState } from 'react';
import './scss/ProcessingFormConfirmation.scss';

export type ProcessingFormConfirmationProps = {
    processingId: string | null;
    fileName?: string;
    status?: 202 | 400 | 409 | 428 | 500 | null;
    isPending?: boolean;
};

const ProcessingFormConfirmation = ({ processingId, fileName = '', status, isPending }: ProcessingFormConfirmationProps) => {
    const [currentStatus, setCurrentStatus] = useState<number>(Status.STARTING);

    useEffect(() => {
        if (!processingId) {
            return;
        }

        let isMounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const checkStatus = async () => {
            if (!isMounted) {
                return;
            }

            const result = await status(processingId);
            if (result !== undefined && isMounted) {
                setCurrentStatus(result);

                // Si le statut est terminal, arrêter les vérifications
                if (isTerminalStatus(result)) {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }
            }
        };

        // Vérifier immédiatement le statut
        checkStatus();

        // Créer l'intervalle pour vérifier périodiquement le statut
        intervalId = setInterval(checkStatus, 5000);

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [processingId]); // Retirer currentStatus des dépendances

    const getStepIcon = (step: number) => {
        const stepStatus = getStepStatus(step);

        if (stepStatus === 'completed') {
            return <CheckIcon className="step-icon-svg" />;
        }

        if (stepStatus === 'current') {
            return <CircularProgress size={20} className="step-icon-svg" />;
        }

        if (stepStatus === 'error') {
            return <ErrorIcon className="step-icon-svg error" />;
        }

        return '';
    };

    const getStepStatus = (step: number) => {
        // Vérifier d'abord si on est dans un état d'erreur
        if (currentStatus === Status.WRAPPER_ERROR) {
            if (step < 3) {
                return 'completed';
            }
            if (step === 3) {
                return 'error';
            }
            return '';
        }
        if (currentStatus === Status.ENRICHMENT_ERROR) {
            if (step < 4) {
                return 'completed';
            }
            if (step === 4) {
                return 'error';
            }
            return '';
        }
        if (currentStatus === Status.FINISHED_ERROR) {
            if (step < 5) {
                return 'completed';
            }
            if (step === 5) {
                return 'error';
            }
            return '';
        }

        // Si pas d'erreur, gérer les états normaux
        switch (step) {
            case 1: // Initialisé
                return currentStatus >= Status.STARTING ? 'completed' : '';
            case 2: // Démarrage
                if (currentStatus === Status.STARTING) {
                    return 'current';
                }
                return currentStatus > Status.STARTING ? 'completed' : '';
            case 3: // Conversion
                if (currentStatus === Status.WRAPPER_RUNNING) {
                    return 'current';
                }
                return currentStatus > Status.WRAPPER_RUNNING ? 'completed' : '';
            case 4: // Traitement en cours
                if (
                    [Status.ENRICHMENT_RUNNING, Status.WAITING_WEBHOOK, Status.PROCESSING_WEBHOOK].includes(
                        currentStatus,
                    )
                ) {
                    return 'current';
                }
                return currentStatus === Status.FINISHED ? 'completed' : '';
            case 5: // Traitement terminé
                return currentStatus === Status.FINISHED ? 'completed' : '';
            default:
                return '';
        }
    };

    const getStatusMessage = () => {
        // Créer un objet avec des clés de type string pour éviter les erreurs TypeScript
        const messages: Record<number, string> = {
            [Status.WRAPPER_ERROR]:
                'Erreur lors de la conversion du fichier. Veuillez vérifier le format de votre fichier.',
            [Status.ENRICHMENT_ERROR]: "Erreur lors du traitement des données. L'enrichissement a échoué.",
            [Status.FINISHED_ERROR]: 'Erreur lors de la finalisation du traitement.',
            [Status.FINISHED]: 'Traitement terminé avec succès',
            [Status.STARTING]: 'Initialisation du traitement...',
            [Status.WRAPPER_RUNNING]: 'Conversion du fichier en cours...',
            [Status.ENRICHMENT_RUNNING]: 'Traitement des données en cours...',
            [Status.WAITING_WEBHOOK]: 'En attente de traitement...',
            [Status.PROCESSING_WEBHOOK]: 'Finalisation du traitement...',
        };

        return messages[currentStatus] || 'Traitement en cours...';
    };

    const isErrorStatus = (status: number): boolean => {
        return [Status.WRAPPER_ERROR, Status.ENRICHMENT_ERROR, Status.FINISHED_ERROR].includes(status);
    };

    const isTerminalStatus = (status: number): boolean => {
        return [Status.WRAPPER_ERROR, Status.ENRICHMENT_ERROR, Status.FINISHED_ERROR, Status.FINISHED].includes(status);
    };

    return (
        <div className="confirmation-container">
            <div className="confirmation-header">
                <CheckIcon className="success-icon" />
                <span>Le traitement de votre fichier a commencé</span>
            </div>

            <div className="file-details-container">
                <div className="detail-item">
                    <span className="label">Nom du fichier :</span>
                    <span className="value">{fileName}</span>
                </div>
                <div className="detail-item">
                    <span className="label">N° de traitement :</span>
                    <span className="value">{processingId}</span>
                </div>
            </div>

            <h3 className="status-title">Statut du traitement de votre fichier</h3>
            <div
                className={`status-message ${isTerminalStatus(currentStatus) ? 'terminal' : ''} ${isErrorStatus(currentStatus) ? 'error' : ''}`}
            >
                {getStatusMessage()}
            </div>

            <div className="status-timeline">
                <div className={`status-step ${getStepStatus(1)}`}>
                    <div className="step-icon">{getStepIcon(1)}</div>
                    <span>Initialisé</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(2)}`}>
                    <div className="step-icon">{getStepIcon(2)}</div>
                    <span>Démarrage</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(3)}`}>
                    <div className="step-icon">{getStepIcon(3)}</div>
                    <span>Conversion</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(4)}`}>
                    <div className="step-icon">{getStepIcon(4)}</div>
                    <span>Traitement en cours</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(5)}`}>
                    <div className="step-icon">{getStepIcon(5)}</div>
                    <span>Traitement terminé</span>
                </div>
            </div>

            <Button variant="contained" className="new-processing-button" onClick={() => (window.location.href = '/')}>
                Nouveau traitement
            </Button>
        </div>
    );
};

export default memo(ProcessingFormConfirmation);
