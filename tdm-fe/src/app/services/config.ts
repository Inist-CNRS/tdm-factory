import type { StaticConfig } from '~/lib/config';

export const getStaticConfig = async (): Promise<StaticConfig> => {
    let response = null;
    response = await fetch('/config-static');
    if (!response.ok) {
        throw new Error('Failed to fetch static configuration');
    }
    // detect when we are in dev mode and use the localhost url
    const content = await response.text();
    if (content.startsWith('<!DOCTYPE html>')) {
        response = await fetch('http://localhost:3000/config-static');
        if (!response.ok) {
            throw new Error('Failed to fetch static configuration from localhost');
        }
    } else {
        response = await fetch('/config-static');
        if (!response.ok) {
            throw new Error('Failed to fetch static configuration');
        }
    }
    const data = await response.json();
    return data;
};
