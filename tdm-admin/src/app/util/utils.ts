import type { Page } from '~/app/util/type';

export const getPageTitle = (page: Page) => {
    switch (page) {
        case 'home':
            return 'Tableau de bord';
        case 'processing':
            return 'Enrichissement';
        case 'database':
            return 'Base de donnée';
        case 'file':
            return 'Fichier';
        case 'log':
            return 'Journal';
        case 'setting':
            return 'Paramètre';
        default:
            return 'Erreur 404';
    }
};

export const isValidHttpUrl = (url: string) => {
    try {
        const newUrl = new URL(url);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
        return false;
    }
};
