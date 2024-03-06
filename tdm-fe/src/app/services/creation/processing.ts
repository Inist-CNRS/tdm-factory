import type { Operation } from '~/app/shared/data.types';
import { createQuery, environment } from '~/app/services/Environment';

export type ProcessingStartParams = {
    wrapper: Operation;
    wrapperParam: string;
    enrichment: Operation;
    mail: string;
    id: string;
};

export const start = async ({ wrapper, wrapperParam, enrichment, mail, id }: ProcessingStartParams) => {
    const response = await fetch(createQuery(environment.post.processing.start), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            wrapper: {
                url: wrapper.url,
                parameters: [wrapperParam],
            },
            enrichment: {
                url: enrichment.url,
            },
            mail,
            file: id,
        }),
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
