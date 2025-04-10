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

const ProcessingFormConfirmation = ({ processingId, fileName = '', status: initialStatus, isPending }: ProcessingFormConfirmationProps) => {
    const [currentStatus, setCurrentStatus] = useState<number>(() => {
        if (initialStatus === 400 || initialStatus === 409) {
            return Status.WRAPPER_ERROR;
        } else if (initialStatus === 428) {
            return Status.ENRICHMENT_ERROR;
        } else if (initialStatus === 500) {
            return Status.FINISHED_ERROR;
        }
        return Status.STARTING;
    });

    useEffect(() => {
        if (!processingId || isPending) {
            return;
        }

        let isMounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const checkStatus = async () => {
            if (!isMounted) {
                return;
            }

            try {
                const result = await status(processingId);
                if (result !== undefined && isMounted) {
                    setCurrentStatus(result);

                    if (isTerminalStatus(result)) {
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
                if (isMounted) {
                    setCurrentStatus(Status.FINISHED_ERROR);
                }
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        };

        checkStatus();

        intervalId = setInterval(checkStatus, 5000);

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [processingId, isPending]);

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
        if (currentStatus === Status.WRAPPER_ERROR) {
            return step === 3 ? 'error' : step < 3 ? 'completed' : '';
        }
        if (currentStatus === Status.ENRICHMENT_ERROR) {
            return step === 4 ? 'error' : step < 4 ? 'completed' : '';
        }
        if (currentStatus === Status.FINISHED_ERROR) {
            return step === 5 ? 'error' : step < 5 ? 'completed' : '';
        }

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
                if ([Status.ENRICHMENT_RUNNING, Status.WAITING_WEBHOOK, Status.PROCESSING_WEBHOOK].includes(currentStatus)) {
                    return 'current';
                }
                return currentStatus > Status.PROCESSING_WEBHOOK ? 'completed' : '';
            case 5: // Traitement terminé
                return currentStatus === Status.FINISHED ? 'completed' : '';
            default:
                return '';
        }
    };

    const getStatusMessage = () => {
        const messages: Record<number, string> = {
            [Status.WRAPPER_ERROR]: 'Erreur lors de la conversion du fichier. Veuillez vérifier le format de votre fichier.',
            [Status.ENRICHMENT_ERROR]: "Erreur lors du traitement des données. L'enrichissement a échoué.",
            [Status.FINISHED_ERROR]: 'Erreur lors de la finalisation du traitement.',
        };

        return messages[currentStatus] || '';
    };

    const isErrorStatus = (status: number): boolean => {
        return [Status.WRAPPER_ERROR, Status.ENRICHMENT_ERROR, Status.FINISHED_ERROR].includes(status);
    };

    const isTerminalStatus = (status: number): boolean => {
        return [
            Status.WRAPPER_ERROR,
            Status.ENRICHMENT_ERROR,
            Status.FINISHED_ERROR,
            Status.FINISHED
        ].includes(status);
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

            <div className="status-timeline">
                <div className={`status-step ${getStepStatus(1)}`}>
                    <div className="step-icon">{getStepIcon(1)}</div>
                    <span>Initialisé</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(2)}`}>
                    <div className="step-icon">{getStepIcon(2)}</div>
                    <span>{getStepStatus(2) === 'error' ? getStatusMessage() : 'Démarrage'}</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(3)}`}>
                    <div className="step-icon">{getStepIcon(3)}</div>
                    <span>{getStepStatus(3) === 'error' ? getStatusMessage() : 'Conversion'}</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(4)}`}>
                    <div className="step-icon">{getStepIcon(4)}</div>
                    <span>{getStepStatus(4) === 'error' ? getStatusMessage() : 'Traitement en cours'}</span>
                </div>
                <div className="step-separator">›</div>
                <div className={`status-step ${getStepStatus(5)}`}>
                    <div className="step-icon">{getStepIcon(5)}</div>
                    <span>{getStepStatus(5) === 'error' ? getStatusMessage() : 'Traitement terminé'}</span>
                </div>
            </div>

            <Button variant="contained" className="new-processing-button" onClick={() => (window.location.href = '/')}>
                Nouveau traitement
            </Button>
        </div>
    );
};

export default memo(ProcessingFormConfirmation);
