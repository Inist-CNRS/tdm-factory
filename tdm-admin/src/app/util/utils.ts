import { DatabaseStatus } from '~/app/util/type';

import type { Page } from '~/app/util/type';

export const getPageTitle = (page: Page) => {
    switch (page) {
        case 'home':
            return 'Tableau de bord';
        case 'database':
            return 'Enrichissements';
        case 'file':
            return 'Fichiers';
        case 'log':
            return 'Journaux';
        case 'setting':
            return 'Paramètres';
        default:
            return 'Erreur 404';
    }
};

export const getDatabaseStatus = (status: DatabaseStatus) => {
    switch (status) {
        case DatabaseStatus.UNKNOWN: {
            return 'UNKNOWN';
        }
        case DatabaseStatus.STARTING: {
            return 'STARTING';
        }
        case DatabaseStatus.WRAPPER_RUNNING: {
            return 'WRAPPER_RUNNING';
        }
        case DatabaseStatus.WRAPPER_ERROR: {
            return 'WRAPPER_ERROR';
        }
        case DatabaseStatus.ENRICHMENT_RUNNING: {
            return 'ENRICHMENT_RUNNING';
        }
        case DatabaseStatus.ENRICHMENT_ERROR: {
            return 'ENRICHMENT_ERROR';
        }
        case DatabaseStatus.WAITING_WEBHOOK: {
            return 'WAITING_WEBHOOK';
        }
        case DatabaseStatus.PROCESSING_WEBHOOK: {
            return 'PROCESSING_WEBHOOK';
        }
        case DatabaseStatus.FINISHED: {
            return 'FINISHED';
        }
        case DatabaseStatus.FINISHED_ERROR: {
            return 'FINISHED_ERROR';
        }
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
