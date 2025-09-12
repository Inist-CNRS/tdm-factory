import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

export default function CookieConsent({ onAccept }: { onAccept: () => void }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent !== 'true') setShow(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShow(false);
        onAccept();
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'false');
        setShow(false);
    };

    if (!show) return null;

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1400,
                borderRadius: 0,
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Consentement aux cookies
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Ce site utilise Matomo pour analyser la navigation et améliorer son contenu. Nous recueillons des
                    données anonymisées sur votre navigation.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Pour en savoir plus, consultez notre{' '}
                    <Link to="/privacy-policy" style={{ textDecoration: 'underline' }}>
                        politique de confidentialité
                    </Link>
                    .
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                <Button onClick={handleDecline} color="inherit">
                    Refuser
                </Button>
                <Button onClick={handleAccept} variant="contained" color="primary">
                    Accepter
                </Button>
            </Box>
        </Paper>
    );
}