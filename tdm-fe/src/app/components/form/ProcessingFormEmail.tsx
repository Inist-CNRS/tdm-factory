import '~/app/components/form/scss/ProcessingFormCommon.scss';
import { ProcessingFormContext } from '~/app/provider/ProcessingFormContextProvider';

import TextField from '@mui/material/TextField';
import { useContext } from 'react';

import type { ChangeEvent } from 'react';

const ProcessingFormEmail = () => {
    const { email, setEmail, isInvalid } = useContext(ProcessingFormContext);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
    };

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <TextField
                value={email ?? ''}
                onChange={handleChange}
                error={isInvalid}
                className="processing-form-field"
                label="Adresse électronique"
                fullWidth
            />
            {isInvalid ? (
                <div className="text processing-form-field-label error">
                    L&apos;adresse électronique n&apos;est pas valide
                </div>
            ) : null}
        </div>
    );
};

export default ProcessingFormEmail;
