import { createQuery, json } from '~/app/services/Environment';
import type { Config } from '~/lib/config';

export const getStaticConfig = async (): Promise<Config> => {
    const response = await fetch(createQuery('/config/static'));
    if (!response.ok) {
        throw new Error('Failed to fetch static configuration');
    }
    return await json<Config>(response);
};
