import '~/app/components/form/scss/ProcessingFormCommon.scss';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import type { ChangeEvent } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ChangeEmail = {
    email: string | null;
    invalidState: boolean;
};

export type ProcessingFormEmailProps = {
    email: string | null;
    onChange: (email: ChangeEmail) => void;
};

const ProcessingFormEmail = ({ email: emailIn, onChange }: ProcessingFormEmailProps) => {
    const [email, setEmail] = useState(emailIn);
    const [error, setError] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newEmail = event.target.value;
        const isNotValid = !emailRegex.test(newEmail);

        setEmail(newEmail);
        setError(isNotValid);
        onChange({
            email: newEmail,
            invalidState: isNotValid,
        });
    };

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <TextField
                value={email}
                onChange={handleChange}
                error={error}
                className="processing-form-field"
                label="Adresse électronique"
                fullWidth
            />
            {error ? (
                <div className="text processing-form-field-label error">
                    L&apos;adresse électronique n&apos;est pas valide
                </div>
            ) : null}
        </div>
    );
};

export default ProcessingFormEmail;
