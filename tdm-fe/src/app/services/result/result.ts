import { createQuery, environment, json } from '~/app/services/Environment';

import type { ResultInfo } from '~/app/shared/data.types';

export const getResultInfo = async (id: string): Promise<ResultInfo | undefined> => {
    try {
        const response = await fetch(createQuery(environment.get.processing.resultInfo, { id }));
        if (response.status !== 200) {
            return undefined;
        }
        return await json<ResultInfo>(response);
    } catch (error) {
        console.error('Error fetching result info:', error);
        return undefined;
    }
};
