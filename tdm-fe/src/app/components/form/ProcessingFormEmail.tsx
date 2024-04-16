import '~/app/components/form/scss/ProcessingFormCommon.scss';

import TextField from '@mui/material/TextField';
import { memo, useCallback, useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProcessingFormEmailProps = {
    value: string | null;
    onChange: (value: string | null) => void;
};

const ProcessingFormEmail = ({ value, onChange }: ProcessingFormEmailProps) => {
    const [email, setEmail] = useState<string>(value ?? '');
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        let invalid = false;

        if (!email || !EMAIL_REGEX.test(email)) {
            invalid = true;
        }

        setIsInvalid(invalid);
        if (!invalid) {
            onChange(email);
        }
    }, [email, onChange]);

    const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
    }, []);

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <TextField
                value={email}
                onChange={handleEmailChange}
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

export default memo(ProcessingFormEmail);
