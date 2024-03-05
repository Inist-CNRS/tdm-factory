import '~/app/components/form/ProcessingFormStepper.scss';
import CheckIcon from '@mui/icons-material/Check';
import Step from '@mui/material/Step';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import StepLabel, { stepLabelClasses } from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import type { StepIconProps } from '@mui/material/StepIcon';
import { colors } from '~/app/shared/theme';

/**
 * List of all step available
 */
const steps = [
    { id: 'processing-configuration-step', title: 'Configuration' },
    { id: 'processing-validation-step', title: 'Vérification' },
    { id: 'processing-confirmation-step', title: 'Confirmation' },
];

/**
 * Istex themed step connector
 */
const IstexStepConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 16,
        left: 'calc(-50% + 18px)',
        right: 'calc(50% + 18px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.colors.blue,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.colors.blue,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.colors.grey,
        borderTopWidth: 2,
    },
}));

/**
 * Istex themed step label
 */
const IstexStepLabel = styled(StepLabel)(() => ({
    [`& .${stepLabelClasses.label}`]: {
        [`&.${stepLabelClasses.completed}`]: {
            color: colors.blue,
        },
        [`&.${stepLabelClasses.active}`]: {
            color: colors.blue,
        },
    },
}));

/**
 * Step Icon with Istex theme
 * @param icon Default icon use
 * @param completed Boolean indicating if we have completed the current step
 * @param active Boolean indicating if we have currently on the current step
 */
const StepLabelIcon = ({ icon, completed, active }: StepIconProps) => {
    const className = useMemo(() => {
        if (completed || active) {
            return 'processing-form-stepper-icon processing-form-stepper-icon-active';
        }
        return 'processing-form-stepper-icon';
    }, [completed, active]);

    if (completed) {
        return (
            <div className={className}>
                <CheckIcon />
            </div>
        );
    }

    return (
        <div className={className}>
            <p>{icon}</p>
        </div>
    );
};

/**
 * Mui Stepper with the Istex theme
 */
const ProcessingFormStepper = () => {
    return (
        <div>
            <Stepper activeStep={1} alternativeLabel connector={<IstexStepConnector />}>
                {steps.map((step) => (
                    <Step key={step.id}>
                        <IstexStepLabel StepIconComponent={StepLabelIcon}>{step.title}</IstexStepLabel>
                    </Step>
                ))}
            </Stepper>
        </div>
    );
};

export default ProcessingFormStepper;
