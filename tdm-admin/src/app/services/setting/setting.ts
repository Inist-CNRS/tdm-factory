import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

import type { Config } from '~/app/util/type';

export const config = async () => {
    const response = await fetch(createQuery(environment.get.config), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return undefined;
    }
    return await json<Config>(response);
};
