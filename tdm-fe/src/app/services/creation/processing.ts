import { createQuery, environment } from '~/app/services/Environment';

import type { Operation } from '~/app/shared/data.types';

export type ProcessingStartParams = {
    wrapper: Operation;
    wrapperParam?: string;
    enrichment: Operation;
    mail: string;
    id: string;
    flowId?: string;
    retrieve?: string;
    retrieveExtension?: string;
};

export const start = async ({
    wrapper,
    wrapperParam,
    enrichment,
    mail,
    id,
    flowId,
    retrieve,
    retrieveExtension,
}: ProcessingStartParams): Promise<202 | 400 | 409 | 428 | 500> => {
    const wrapperConfig = {
        url: wrapper.url,
        parameters: [wrapperParam || 'abstract']
    };

    const body = {
        wrapper: wrapperConfig,
        enrichment: {
            url: enrichment.url,
        },
        mail,
        file: id,
        flowId,
        retrieve,
        retrieveExtension,
    };

    const response = await fetch(createQuery(environment.post.processing.start), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    switch (response.status) {
        case 202:
            return 202;
        case 400:
            return 400;
        case 409:
            return 409;
        case 428:
            return 428;
        default:
            return 500;
    }
};
