import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

import type { Dashboard } from '~/app/util/type';

export const dashboard = async (): Promise<Dashboard> => {
    const response = await fetch(createQuery(environment.get.dashboard), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return { status: {}, storage: { download: [], tmp: [], upload: [] } };
    }
    return await json<Dashboard>(response);
};
