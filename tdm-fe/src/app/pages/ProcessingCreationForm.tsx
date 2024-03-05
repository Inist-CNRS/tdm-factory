import '~/app/pages/ProcessingCreationForm.scss';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';

const ProcessingCreationForm = () => {
    return (
        <div id="processing-form">
            <ProcessingFormStepper />
            <div id="processing-form-content">
                <ProcessingFormConfiguration />
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
