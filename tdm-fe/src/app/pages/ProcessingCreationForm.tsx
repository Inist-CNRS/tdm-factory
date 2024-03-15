import '~/app/pages/scss/ProcessingCreationForm.scss';
import { Button } from '@mui/material';
import { useContext } from 'react';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfirmation from '~/app/components/form/ProcessingFormConfirmation';
import ProcessingFormEmail from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';
import ProcessingFormUpload from '~/app/components/form/ProcessingFormUpload';
import {
    ProcessingFormContext,
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_CONFIRMATION_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_VALIDATION_STEP,
    PROCESSING_UPLOADING_STEP,
} from '~/app/provider/ProcessingFormContextProvider';

const ProcessingCreationForm = () => {
    const { step, isInvalid, next } = useContext(ProcessingFormContext);

    return (
        <div id="processing-form">
            {/* Visual stepper use to indicate the current step of the form */}
            <ProcessingFormStepper step={step} />

            {/* Content of the form */}
            <div id="processing-form-content">
                {/* Upload step */}
                {step === PROCESSING_UPLOAD_STEP || step === PROCESSING_UPLOADING_STEP ? (
                    <ProcessingFormUpload />
                ) : null}

                {/* Configuration step */}
                {step === PROCESSING_CONFIGURATION_STEP ? <ProcessingFormConfiguration /> : null}

                {/* Validation step */}
                {step === PROCESSING_VALIDATION_STEP ? <ProcessingFormEmail /> : null}

                {/* Confirmation step */}
                {step === PROCESSING_CONFIRMATION_STEP ? <ProcessingFormConfirmation /> : null}

                {/* Navigation button */}
                <div id="processing-form-navigation">
                    <Button onClick={next} variant="outlined" disabled={isInvalid}>
                        {step === PROCESSING_CONFIRMATION_STEP ? 'Nouveau traitement' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
