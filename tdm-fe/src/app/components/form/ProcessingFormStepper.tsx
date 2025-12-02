import '~/app/components/form/scss/ProcessingFormStepper.scss';
import {
    PROCESSING_FORMAT_STEP,
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_CONFIRMATION_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_VALIDATION_STEP,
} from '~/app/pages/ProcessingCreationForm';

import CheckIcon from '@mui/icons-material/Check';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import { memo, useMemo } from 'react';

import type { StepIconProps } from '@mui/material/StepIcon';

export type ProcessingFormStepperProps = {
    step?: number;
};

/**
 * List of all steps
 */
const steps = [
    {
        id: 'format-step',
        title: 'Format',
    },
    {
        id: 'upload-step',
        title: 'Téléversement',
    },
    {
        id: 'configuration-step',
        title: 'Configuration',
    },
    {
        id: 'validation-step',
        title: 'Vérification',
    },
    {
        id: 'confirmation-step',
        title: 'Confirmation',
    },
];

/**
 * Istex themed step label
 */
const IstexStepLabel = styled(StepLabel)(() => ({
    // Styles are now managed in the CSS file
}));

/**
 * Step Icon with Istex theme
 * @param icon Default icon use
 * @param completed Boolean indicating if we have completed the current step
 * @param active Boolean indicating if we are currently on the current step
 */
const StepLabelIcon = ({ icon, completed, active }: StepIconProps) => {
    const className = useMemo(() => {
        if (completed || active) {
            return 'processing-form-stepper-icon processing-form-stepper-icon-active';
        }
        return 'processing-form-stepper-icon';
    }, [completed, active]);

    return <div className={className}>{completed ? <CheckIcon /> : <p>{icon}</p>}</div>;
};

/**
 * Mui Stepper with the Istex theme
 */
const ProcessingFormStepper = ({ step = 0 }: ProcessingFormStepperProps) => {
    const activeStep = useMemo(() => {
        switch (step) {
            case PROCESSING_FORMAT_STEP:
                return 0;
            case PROCESSING_UPLOAD_STEP:
                return 1;
            case PROCESSING_CONFIGURATION_STEP:
                return 2;
            case PROCESSING_VALIDATION_STEP:
                return 3;
            case PROCESSING_CONFIRMATION_STEP:
                return 4;
            default:
                return 0;
        }
    }, [step]);

    return (
        <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((stepEntry) => (
                <Step key={stepEntry.id}>
                    <IstexStepLabel StepIconComponent={StepLabelIcon}>{stepEntry.title}</IstexStepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default memo(ProcessingFormStepper);
