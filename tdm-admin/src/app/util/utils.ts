import type { Page } from '~/app/util/type';

const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

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
