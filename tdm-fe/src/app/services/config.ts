import type { StaticConfig } from '~/lib/config';

export const getStaticConfig = async (): Promise<StaticConfig> => {
    let response = await fetch('/config-static');
    if (!response.ok) {
        throw new Error('Failed to fetch static configuration');
    }
    let data;
    try {
        data = await response.json();
    } catch {
        // when we are in dev mode, use the localhost url
        response = await fetch('http://localhost:3000/config-static');
        if (!response.ok) {
            throw new Error('Failed to fetch static configuration from localhost');
        }
        data = await response.json();
    }
    return data;
};
