import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NODE_ENV = import.meta.env.MODE;

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    // Faire défiler la page vers le haut lorsque le composant est monté
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, []);

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="md" sx={{ my: 5 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToHome} sx={{ mb: 3 }} variant="outlined">
                Retour à l&rsquo;accueil
            </Button>

            <Typography variant="h4" component="h1" gutterBottom>
                Politique de confidentialité
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Introduction
            </Typography>
            <Typography paragraph>
                TDM Factory s&rsquo;engage à protéger la vie privée des utilisateurs de son site web. Cette politique de
                confidentialité explique comment nous collectons, utilisons et protégeons vos données lors de votre
                utilisation de notre plateforme.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Responsable du traitement
            </Typography>
            <Typography paragraph>
                Le responsable du traitement des données à caractère personnel est l&rsquo;Inist-CNRS :
            </Typography>
            <Box component="address" sx={{ mb: 2, fontStyle: 'normal' }}>
                <Typography>Institut de l&rsquo;Information Scientifique et Technique (Inist-CNRS)</Typography>
                <Typography>2, rue Jean Zay</Typography>
                <Typography>CS 10310</Typography>
                <Typography>54519 Vandœuvre-lès-Nancy</Typography>
            </Box>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Données personnelles collectées
            </Typography>
            <Typography paragraph>
                TDM Factory ne collecte aucune donnée personnelle permettant de vous identifier directement, sauf
                lorsque vous nous contactez volontairement par email.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Mesures d&rsquo;audience et cookies
            </Typography>
            <Typography paragraph>
                TDM Factory utilise Matomo (anciennement Piwik), un outil d&rsquo;analyse web open source et respectueux
                de la vie privée, pour analyser l&rsquo;utilisation qui est faite du site. Cet outil nous aide à
                améliorer l&rsquo;ergonomie du site et la qualité de nos services.
            </Typography>
            <Typography paragraph>
                Matomo utilise des cookies, qui sont des fichiers texte placés sur votre ordinateur, pour aider le site
                à analyser l&rsquo;utilisation du site par ses utilisateurs. Les informations générées par les cookies
                concernant votre utilisation du site sont transmises et stockées par Matomo sur des serveurs situés en
                France.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                Données collectées via Matomo
            </Typography>
            <Typography paragraph>Les informations collectées par Matomo incluent :</Typography>
            <List>
                <ListItem>
                    <ListItemText primary="L'adresse IP anonymisée (les derniers chiffres sont masqués)" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="La date et l'heure de la visite" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Le titre et l'URL des pages visitées" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Le site référent (site depuis lequel vous avez cliqué sur un lien menant à TDM Factory)" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Le type d'appareil, de navigateur et de système d'exploitation utilisés" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="La résolution de l'écran" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="La langue du navigateur" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Les fichiers sur lesquels vous avez cliqué et que vous avez téléchargés" />
                </ListItem>
            </List>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                Durée de conservation des données
            </Typography>
            <Typography paragraph>
                Les données collectées par Matomo sont conservées pour une durée de 13 mois maximum.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Vos droits
            </Typography>
            <Typography paragraph>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits
                suivants concernant vos données :
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Droit d'accès" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Droit de rectification" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Droit à l'effacement" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Droit à la limitation du traitement" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Droit d'opposition" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Droit à la portabilité des données" />
                </ListItem>
            </List>
            <Typography paragraph>
                Vous pouvez exercer ces droits en nous contactant à l&rsquo;adresse email indiquée ci-dessous.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                Opposition au suivi
            </Typography>
            <Typography paragraph>Vous pouvez vous opposer au suivi de votre navigation sur ce site :</Typography>
            <List>
                <ListItem>
                    <ListItemText primary="En cliquant sur « Refuser » dans la fenêtre de consentement qui s'affiche lors de votre première visite" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="En supprimant les cookies de votre navigateur et en rechargeant le site" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="En configurant votre navigateur pour qu'il refuse les cookies de Matomo" />
                </ListItem>
            </List>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Sécurité des données
            </Typography>
            <Typography paragraph>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès,
                modification, divulgation ou destruction non autorisés.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Modifications de la politique de confidentialité
            </Typography>
            <Typography paragraph>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute
                modification sera publiée sur cette page avec une date de mise à jour.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Contact
            </Typography>
            <Typography paragraph>
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, veuillez
                nous contacter à l&rsquo;adresse suivante : contact@inist.fr
            </Typography>

            {/* Matomo Image Tracker */}
            {NODE_ENV === 'production' ? (
                <Box
                    component="img"
                    src="https://piwik2.inist.fr/matomo.php?idsite=95&rec=1"
                    sx={{ border: 0, display: 'none' }}
                    alt=""
                />
            ) : null}
        </Container>
    );
};

export default PrivacyPolicy;
