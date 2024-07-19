import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

import type { Databases } from '~/app/util/type';

export const database = async (page: number): Promise<Databases> => {
    const response = await fetch(createQuery(environment.get.database, { page: page.toString(10) }), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return { page: 0, results: [], total: 0 };
    }
    return await json<Databases>(response);
};
