import '~/app/components/form/scss/ProcessingFormStepper.scss';
import {
    PROCESSING_CONFIGURATION_STEP,
    PROCESSING_CONFIRMATION_STEP,
    PROCESSING_UPLOAD_STEP,
    PROCESSING_UPLOADING_STEP,
    PROCESSING_VALIDATION_STEP,
} from '~/app/provider/ProcessingFormContextProvider';
import { colors } from '~/app/shared/theme';

import CheckIcon from '@mui/icons-material/Check';
import Step from '@mui/material/Step';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import StepLabel, { stepLabelClasses } from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';

import type { StepConnectorProps } from '@mui/material/StepConnector';
import type { StepIconProps } from '@mui/material/StepIcon';

export type ProcessingFormStepperProps = {
    step?: number;
};

/**
 * List of all step available
 */
const steps = [
    { id: 'processing-upload-step', title: 'Téléversement' },
    { id: 'processing-configuration-step', title: 'Configuration' },
    { id: 'processing-validation-step', title: 'Vérification' },
    { id: 'processing-confirmation-step', title: 'Confirmation' },
];

/**
 * Istex themed step connector
 */
const IstexStepConnector = (
    props: StepConnectorProps & {
        isExtended?: boolean;
        isFirst?: boolean;
        isLast?: boolean;
    },
) => {
    const { isExtended, isFirst, isLast, ...rest } = props;

    const CustomStepConnector = useMemo(() => {
        let left = 'calc(-50% + 18px)';

        if (isExtended && (isFirst || isLast)) {
            left = '8px';
        }

        return styled(StepConnector)(({ theme }) => ({
            [`&.${stepConnectorClasses.alternativeLabel}`]: {
                top: 16,
                left: left,
                right: 'calc(50% + 18px)',
                transform: isExtended && isLast ? 'translateX(calc(100% + 36px))' : undefined,
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
                borderColor: theme.palette.colors.grey,
                borderTopWidth: 2,
            },
        }));
    }, [isExtended, isFirst, isLast]);

    return <CustomStepConnector {...rest} />;
};

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
            <>
                <div className={className}>
                    <CheckIcon />
                </div>
                <IstexStepConnector isExtended={icon === 1 || icon === 4} isFirst={icon === 1} isLast={icon === 4} />
            </>
        );
    }

    return (
        <>
            <div className={className}>
                <p>{icon}</p>
            </div>
            <IstexStepConnector isExtended={icon === 1 || icon === 4} isFirst={icon === 1} isLast={icon === 4} />
        </>
    );
};

/**
 * Mui Stepper with the Istex theme
 */
const ProcessingFormStepper = ({ step = 0 }: ProcessingFormStepperProps) => {
    const activeStep = useMemo(() => {
        switch (step) {
            case PROCESSING_UPLOAD_STEP:
            case PROCESSING_UPLOADING_STEP:
                return 0;
            case PROCESSING_CONFIGURATION_STEP:
                return 1;
            case PROCESSING_VALIDATION_STEP:
                return 2;
            case PROCESSING_CONFIRMATION_STEP:
                return 3;
        }
    }, [step]);

    return (
        <Stepper activeStep={activeStep} alternativeLabel connector={<IstexStepConnector />}>
            {steps.map((stepEntry) => (
                <Step key={stepEntry.id}>
                    <IstexStepLabel StepIconComponent={StepLabelIcon}>{stepEntry.title}</IstexStepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default ProcessingFormStepper;
