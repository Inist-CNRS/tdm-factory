import '~/app/components/form/scss/ProcessingFormCommon.scss';

import TextField from '@mui/material/TextField';
import { memo, useCallback, useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cookie helper functions
const saveEmailToCookie = (email: string) => {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 6); // Cookie expires in 6 months
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

    const [hasAttemptedInput, setHasAttemptedInput] = useState(false);

    const isInvalid = email.trim() !== '' && !EMAIL_REGEX.test(email);

    useEffect(() => {
        // Toujours retourner l'email
        onChange(email || null);

        // Sauvegarder en cookie seulement si valide et non-vide
        if (!isInvalid && email.trim() !== '') {
            saveEmailToCookie(email);
        }
    }, [email, onChange, isInvalid]);

    const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
        setHasAttemptedInput(true);
    }, []);

    // Message d'aide dynamique
    const getHelperText = () => {
        if (isInvalid && hasAttemptedInput) {
            return "L'adresse électronique n'est pas valide";
        }
        if (!email.trim()) {
            return 'Sans e-mail, vous devrez rester sur cette page pour suivre le traitement. Sinon, vous recevrez une notification une fois terminé.';
        }
        return 'Vous recevrez une notification une fois le traitement terminé.';
    };

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <h3>Adresse e-mail (optionnel)</h3>
            <TextField
                value={email}
                onChange={handleEmailChange}
                error={isInvalid ? hasAttemptedInput : false}
                className="processing-form-field"
                label="Adresse électronique (optionnel)"
                fullWidth
                helperText={getHelperText()}
            />
        </div>
    );
};

export default memo(ProcessingFormEmail);
