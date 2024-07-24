import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

import type { Files } from '~/app/util/type';

export const files = async (): Promise<Files> => {
    const response = await fetch(createQuery(environment.get.files), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return { download: [], tmp: [], upload: [] };
    }
    return await json<Files>(response);
};
