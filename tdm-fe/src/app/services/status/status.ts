import { createQuery, environment, json } from '~/app/services/Environment';

import type { ProcessingStatus } from '~/app/shared/data.types';

export const status = async (id: string) => {
    const response = await fetch(
        createQuery(environment.get.processing.status, { id }),
    );
    if (response.status !== 200) {
        return undefined;
    }
    return parseInt((await json<ProcessingStatus>(response)).errorType, 10);
};
