import { useEffect } from 'react';

declare global {
    interface Window {
        _paq?: unknown[];
        _matomoInitialized?: boolean;
    }
}

export default function Matomo() {
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        // Empêche l'injection multiple du script et des pushes
        if (!window._matomoInitialized) {
            window._paq = window._paq || [];
            window._paq.push(['trackPageView']);
            window._paq.push(['enableLinkTracking']);
            window._paq.push(['setTrackerUrl', '//piwik2.inist.fr/matomo.php']);
            window._paq.push(['setSiteId', '95']);

            if (!document.getElementById('matomo-script')) {
                const g = document.createElement('script');
                g.type = 'text/javascript';
                g.async = true;
                g.defer = true;
                g.src = '//piwik2.inist.fr/matomo.js';
                g.id = 'matomo-script';
                const s = document.getElementsByTagName('script')[0];
                s.parentNode?.insertBefore(g, s);
            }
            window._matomoInitialized = true;
        }
    }, []);
    
    return (
        <img
            src="https://piwik2.inist.fr/matomo.php?idsite=95&rec=1"
            style={{ border: 0, width: 0, height: 0, position: 'absolute' }}
            alt=""
        />
    );
}
