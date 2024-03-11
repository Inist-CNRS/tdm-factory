import type { Operation } from '~/app/shared/data.types';
import { createQuery, environment } from '~/app/services/Environment';

export type ProcessingStartParams = {
    wrapper: Operation;
    wrapperParam?: string;
    enrichment: Operation;
    mail: string;
    id: string;
};

export const start = async ({
    wrapper,
    wrapperParam,
    enrichment,
    mail,
    id,
}: ProcessingStartParams): Promise<202 | 400 | 409 | 428 | 500> => {
    const response = await fetch(createQuery(environment.post.processing.start), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            wrapper: wrapperParam
                ? {
                      url: wrapper.url,
                      parameters: [wrapperParam],
                  }
                : {
                      url: wrapper.url,
                  },
            enrichment: {
                url: enrichment.url,
            },
            mail,
            file: id,
        }),
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
