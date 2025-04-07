import { createQuery, json } from '~/app/services/Environment';

import type { StaticConfig } from '~/lib/config';

export const getStaticConfig = async (): Promise<StaticConfig> => {
    const response = await fetch(createQuery('/config-static'));
    if (!response.ok) {
        throw new Error('Failed to fetch static configuration');
    }
    return await json<StaticConfig>(response);
};
