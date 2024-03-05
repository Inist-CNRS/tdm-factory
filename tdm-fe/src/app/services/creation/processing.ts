import type { Operation } from '~/app/shared/data.types';
import { createQuery, environment, json } from '~/app/services/Environment';

export type ProcessingStartParams = {
    wrapper: Operation;
    enrichment: Operation;
    mail: string;
    file: string;
};

export const start = async (form: ProcessingStartParams) => {
    const response = await fetch(createQuery(environment.post.processing.start), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
    });

    switch (response.status) {
        case 200:
            return 200;
        case 400:
            return 400;
        case 428:
            return 428;
        default:
            return 500;
    }
};
