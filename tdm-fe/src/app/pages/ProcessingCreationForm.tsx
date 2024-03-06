import '~/app/pages/ProcessingCreationForm.scss';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { ChangeConfiguration } from '~/app/components/form/ProcessingFormConfiguration';
import type { ChangeEmail } from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
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

const ProcessingCreationForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [configuration, setConfiguration] = useState<ChangeConfiguration>({
        enrichment: null,
        file: null,
        invalidState: true,
        wrapper: null,
        wrapperParam: null,
    });
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [email, setEmail] = useState<ChangeEmail>({ email: null, invalidState: true });

    const { data: uploadResult, isError: uploadFailed } = useQuery({
        queryKey: [currentStep, processingId], // use processingId to avoid cache when redoing the form
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
    });

    const {} = useQuery({
        queryKey: [currentStep, processingId], // use processingId to avoid cache when redoing the form,
        queryFn: () => {
            if (currentStep !== PROCESSING_CONFIRMATION_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (
                !processingId ||
                !configuration.wrapper ||
                !configuration.wrapperParam ||
                !configuration.enrichment ||
                !email.email
            ) {
                return null;
            }

            return start({
                id: processingId,
                wrapper: configuration.wrapper,
                wrapperParam: configuration.wrapperParam,
                enrichment: configuration.enrichment,
                mail: email.email,
            });
        },
    });

    useEffect(() => {
        if (uploadResult) {
            setProcessingId(uploadResult);
            setCurrentStep(PROCESSING_VALIDATION_STEP);
        }
    }, [uploadResult]);

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

    const handleConfigurationChange = (newConfiguration: ChangeConfiguration) => {
        setConfiguration(newConfiguration);
    };

    const handleEmailChange = (newEmail: ChangeEmail) => {
        setEmail(newEmail);
    };

    const handleNextStep = () => {
        const newStep = currentStep + 1;
        if (newStep <= PROCESSING_CONFIRMATION_STEP) {
            setCurrentStep(newStep);
        }
    };

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

    return (
        <div id="processing-form">
            <ProcessingFormStepper step={currentStep} />
            <div id="processing-form-content">
                {currentStep === PROCESSING_CONFIGURATION_STEP ? (
                    <ProcessingFormConfiguration value={configuration} onChange={handleConfigurationChange} />
                ) : null}
                {currentStep === PROCESSING_UPLOAD_STEP ? <FileUpload showError={uploadFailed} /> : null}
                {currentStep === PROCESSING_VALIDATION_STEP ? (
                    <ProcessingFormEmail email={email.email} onChange={handleEmailChange} />
                ) : null}
                <div id="processing-form-navigation">
                    <Button onClick={handlePreviousStep} variant="outlined" disabled={currentStep === 0}>
                        Précédent
                    </Button>
                    <Button onClick={handleNextStep} variant="outlined" disabled={isNextDisable()}>
                        Suivant
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
