import '~/app/components/form/scss/ProcessingFormCommon.scss';

import TextField from '@mui/material/TextField';
import { memo, useCallback, useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cookie helper functions
const saveEmailToCookie = (email: string) => {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 6); // Cookie expires in 6 month
    document.cookie = `userEmail=${encodeURIComponent(email)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
};

const getEmailFromCookie = (): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userEmail') {
            return decodeURIComponent(value);
        }
    }
    return null;
};

type ProcessingFormEmailProps = {
    value: string | null;
    onChange: (value: string | null) => void;
};

const ProcessingFormEmail = ({ value, onChange }: ProcessingFormEmailProps) => {
    // Initialize with cookie value or passed value
    const [email, setEmail] = useState<string>(() => {
        const cookieEmail = getEmailFromCookie();
        return value ?? cookieEmail ?? '';
    });
    const [isInvalid, setIsInvalid] = useState(false);
    const [hasAttemptedInput, setHasAttemptedInput] = useState(false);

    useEffect(() => {
        let invalid = false;

        if (!email || !EMAIL_REGEX.test(email)) {
            invalid = true;
        }

        setIsInvalid(invalid);
        onChange(invalid ? null : email);
        
        // Save valid email to cookie
        if (!invalid && email) {
            saveEmailToCookie(email);
        }
    }, [email, onChange]);

    const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
        setHasAttemptedInput(true);
    }, []);

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <h3> Adresse e-mail </h3>
            <TextField
                value={email}
                onChange={handleEmailChange}
                error={isInvalid ? hasAttemptedInput : false}
                className="processing-form-field"
                label="Adresse électronique"
                fullWidth
            />
            {isInvalid && hasAttemptedInput ? (
                <div className="text processing-form-field-label error">
                    L&apos;adresse électronique n&apos;est pas valide
                </div>
            ) : null}
        </div>
    );
};

export default memo(ProcessingFormEmail);
