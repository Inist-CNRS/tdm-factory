import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NODE_ENV = import.meta.env.MODE;

// Déclare _paq sur window pour TypeScript
declare global {
    type WindowWithPaq = typeof window & { _paq?: unknown[] };
}


const CookieConsent = () => {
    const [show, setShow] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        if (NODE_ENV === 'production') {
            const hasConsent = localStorage.getItem('cookieConsent');
            if (!hasConsent) {
                setShow(true);
            }
        } else {
            // Uncomment the next line to show the consent dialog in dev for testing
            // setShow(true);
        }
    }, []);

    const handleAccept = () => {
        if ((window as Window & { _paq?: unknown[] })._paq) {
            (window as Window & { _paq?: unknown[] })._paq!.push(['setConsentGiven']);
        }
        localStorage.setItem('cookieConsent', 'true');
        setShow(false);
    };

    const handleDecline = () => {
        if ((window as Window & { _paq?: unknown[] })._paq) {
            (window as Window & { _paq?: unknown[] })._paq!.push(['forgetConsentGiven']);
        }
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
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[8],
                p: { xs: 2, sm: 3 },
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
                    Ce site utilise Matomo pour analyser la navigation et améliorer son contenu. Nous recueillons des données anonymisées sur votre navigation.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Pour en savoir plus, consultez notre{' '}
                    <Link to="/privacy-policy" style={{ textDecoration: 'underline' }}>politique de confidentialité</Link>.
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
};

export default CookieConsent;
