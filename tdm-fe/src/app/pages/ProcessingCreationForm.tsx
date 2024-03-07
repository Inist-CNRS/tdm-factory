import '~/app/pages/ProcessingCreationForm.scss';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { ChangeConfiguration } from '~/app/components/form/ProcessingFormConfiguration';
import type { ChangeEmail } from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfirmation from '~/app/components/form/ProcessingFormConfirmation';
import ProcessingFormEmail from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormStepper, {
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_CONFIRMATION_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_VALIDATION_STEP,
} from '~/app/components/form/ProcessingFormStepper';
import FileUpload from '~/app/components/progress/FileUpload';
import { start } from '~/app/services/creation/processing';
import { upload } from '~/app/services/creation/upload';

const initialConfiguration = {
    enrichment: null,
    file: null,
    invalidState: true,
    wrapper: null,
    wrapperParam: null,
} as const;

const ProcessingCreationForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [configuration, setConfiguration] = useState<ChangeConfiguration>(initialConfiguration);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [email, setEmail] = useState<ChangeEmail>({ email: null, invalidState: true });

    /**
     * Query handler use to upload the file
     */
    const { data: uploadResult, isError: uploadFailed } = useQuery({
        queryKey: ['upload', currentStep, processingId], // use processingId to avoid cache when redoing the form
        queryFn: () => {
            if (currentStep !== PROCESSING_UPLOAD_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!configuration.file) {
                return null;
            }

            return upload(configuration.file);
        },
        staleTime: 3600000,
        gcTime: 3600000,
    });

    /**
     * Query handle use to start the processing
     */
    const { data: startResponse, isPending: startPending } = useQuery({
        queryKey: ['start', currentStep, processingId], // use processingId to avoid cache when redoing the form,
        queryFn: () => {
            if (currentStep !== PROCESSING_CONFIRMATION_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!processingId || !configuration.wrapper || !configuration.enrichment || !email.email) {
                return null;
            }

            return start({
                id: processingId,
                wrapper: configuration.wrapper,
                wrapperParam: configuration.wrapperParam ?? undefined,
                enrichment: configuration.enrichment,
                mail: email.email,
            });
        },
        staleTime: 3600000,
        gcTime: 3600000,
    });

    /**
     * Handler use to update the processing id resived at the end of the upload
     */
    useEffect(() => {
        if (uploadResult) {
            setProcessingId(uploadResult);
            setCurrentStep(PROCESSING_VALIDATION_STEP);
        }
    }, [uploadResult]);

    /**
     * Utils function use to enable or not the previous button
     */
    const isPreviousDisable = () => {
        switch (currentStep) {
            case PROCESSING_CONFIGURATION_STEP: {
                return true;
            }
            case PROCESSING_CONFIRMATION_STEP: {
                return true;
            }
            default: {
                return false;
            }
        }
    };

    /**
     * Utils function use to enable or not the next button
     */
    const isNextDisable = () => {
        switch (currentStep) {
            case PROCESSING_CONFIGURATION_STEP: {
                return configuration.invalidState;
            }
            case PROCESSING_UPLOAD_STEP: {
                return true;
            }
            case PROCESSING_VALIDATION_STEP: {
                return email.invalidState;
            }
            default:
                return false;
        }
    };

    /**
     * Event handler use to update the configuration state
     */
    const handleConfigurationChange = (newConfiguration: ChangeConfiguration) => {
        setConfiguration(newConfiguration);
    };

    /**
     * Event handler use to update the email state
     */
    const handleEmailChange = (newEmail: ChangeEmail) => {
        setEmail(newEmail);
    };

    /**
     * Event handle use to handle the previous step
     */
    const handlePreviousStep = () => {
        if (currentStep === PROCESSING_VALIDATION_STEP) {
            setCurrentStep(PROCESSING_CONFIGURATION_STEP);
            return;
        }

        const newStep = currentStep - 1;
        if (newStep >= PROCESSING_CONFIGURATION_STEP) {
            setCurrentStep(newStep);
        }
    };

    /**
     * Event handle use to handle the next step
     */
    const handleNextStep = () => {
        if (currentStep === PROCESSING_CONFIRMATION_STEP) {
            setCurrentStep(PROCESSING_CONFIGURATION_STEP);
            setConfiguration(initialConfiguration);
            return;
        }

        const newStep = currentStep + 1;
        if (newStep <= PROCESSING_CONFIRMATION_STEP) {
            setCurrentStep(newStep);
        }
    };

    return (
        <div id="processing-form">
            {/* Visual stepper use to indicate the current step of the form */}
            <ProcessingFormStepper step={currentStep} />

            {/* Content of the form */}
            <div id="processing-form-content">
                {/* Configuration step */}
                {currentStep === PROCESSING_CONFIGURATION_STEP ? (
                    <ProcessingFormConfiguration value={configuration} onChange={handleConfigurationChange} />
                ) : null}

                {/* Waiting step (Upload) */}
                {currentStep === PROCESSING_UPLOAD_STEP ? <FileUpload showError={uploadFailed} /> : null}

                {/* Validation step */}
                {currentStep === PROCESSING_VALIDATION_STEP ? (
                    <ProcessingFormEmail email={email.email} onChange={handleEmailChange} />
                ) : null}

                {/* Confirmation step */}
                {currentStep === PROCESSING_CONFIRMATION_STEP ? (
                    <ProcessingFormConfirmation
                        processingId={processingId as string}
                        state={{
                            status: startResponse,
                            pending: startPending,
                        }}
                    />
                ) : null}

                {/* Navigation button */}
                <div id="processing-form-navigation">
                    <Button onClick={handlePreviousStep} variant="outlined" disabled={isPreviousDisable()}>
                        Précédent
                    </Button>
                    <Button onClick={handleNextStep} variant="outlined" disabled={isNextDisable()}>
                        {currentStep === PROCESSING_CONFIRMATION_STEP ? 'Nouveau traitement' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
