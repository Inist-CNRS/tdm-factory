import '~/app/pages/ProcessingCreationForm.scss';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { ChangeConfiguration } from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormStepper, {
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_CONFIRMATION_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_VALIDATION_STEP,
} from '~/app/components/form/ProcessingFormStepper';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import FileUpload from '~/app/components/progress/FileUpload';
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

    const { data: uploadResult, isError: uploadFailed } = useQuery({
        queryKey: [currentStep],
        queryFn: () => {
            if (currentStep !== PROCESSING_UPLOAD_STEP) {
                return null;
            }

            if (!configuration.file) {
                return null;
            }

            return upload(configuration.file);
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
            default:
                return false;
        }
    };

    const handleConfigurationChange = (newConfiguration: ChangeConfiguration) => {
        setConfiguration(newConfiguration);
    };

    const handleNextStep = () => {
        const newStep = currentStep + 1;
        if (newStep <= PROCESSING_CONFIRMATION_STEP) {
            setCurrentStep(newStep);
        }
    };

    const handlePreviousStep = () => {
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
