import { ProcessingStatus } from '~/app/util/type';

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
        default:
            return 'Erreur 404';
    }
};

export const getDatabaseStatus = (status: ProcessingStatus) => {
    switch (status) {
        case ProcessingStatus.UNKNOWN: {
            return 'UNKNOWN';
        }
        case ProcessingStatus.STARTING: {
            return 'STARTING';
        }
        case ProcessingStatus.WRAPPER_RUNNING: {
            return 'WRAPPER_RUNNING';
        }
        case ProcessingStatus.WRAPPER_ERROR: {
            return 'WRAPPER_ERROR';
        }
        case ProcessingStatus.ENRICHMENT_RUNNING: {
            return 'ENRICHMENT_RUNNING';
        }
        case ProcessingStatus.ENRICHMENT_ERROR: {
            return 'ENRICHMENT_ERROR';
        }
        case ProcessingStatus.WAITING_WEBHOOK: {
            return 'WAITING_WEBHOOK';
        }
        case ProcessingStatus.PROCESSING_WEBHOOK: {
            return 'PROCESSING_WEBHOOK';
        }
        case ProcessingStatus.FINISHED: {
            return 'FINISHED';
        }
        case ProcessingStatus.FINISHED_ERROR: {
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
