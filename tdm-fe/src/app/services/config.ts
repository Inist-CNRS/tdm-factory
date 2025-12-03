// import { createQuery, json } from '~/app/services/Environment';

import type { StaticConfig } from '~/lib/config';

// export const getStaticConfig = async (): Promise<StaticConfig> => {
//     const response = await fetch(createQuery('/config-static'));
//     if (!response.ok) {
//         throw new Error('Failed to fetch static configuration');
//     }
//     return await json<StaticConfig>(response);
// };

export const getStaticConfig = async (): Promise<StaticConfig> => {
    let response = await fetch('/config-static');
    // TODO: detect when we are in dev mode and use the localhost url
    if (!response.ok) {
        throw new Error('Failed to fetch static configuration');
    }
    let data = await response.json();
    if (!data) {
        response = await fetch('http://localhost:3000/config-static');
        if (!response.ok) {
            throw new Error('Failed to fetch static configuration from localhost');
        }
        data = await response.json();
    }
    return data;
};
