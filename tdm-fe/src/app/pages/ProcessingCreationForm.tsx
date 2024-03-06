import '~/app/pages/ProcessingCreationForm.scss';
import { useState } from 'react';
import type { ProcessingFormConfigurationProps } from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';

const ProcessingCreationForm = () => {
    const [configuration, setConfiguration] = useState<ProcessingFormConfigurationProps['value']>({});

    const handleConfigurationChange = (newConfiguration: ProcessingFormConfigurationProps['value']) => {
        setConfiguration(newConfiguration);
    };

    return (
        <div id="processing-form">
            <ProcessingFormStepper />
            <div id="processing-form-content">
                <ProcessingFormConfiguration value={configuration} onChange={handleConfigurationChange} />
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
