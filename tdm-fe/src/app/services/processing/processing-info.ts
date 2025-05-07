import { createQuery, environment, json } from '~/app/services/Environment';

import type { ProcessingInfo } from '~/app/shared/data.types';

export const getProcessingInfo = async (id: string): Promise<ProcessingInfo | undefined> => {
    try {
        const response = await fetch(createQuery(environment.get.processing.info, { id }));
        if (response.status !== 200) {
            return undefined;
        }
        return await json<ProcessingInfo>(response);
    } catch (error) {
        console.error('Error fetching processing info:', error);
        return undefined;
    }
};
