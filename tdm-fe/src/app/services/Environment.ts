import { getStaticConfig } from '~/app/services/config';

const config = await getStaticConfig();

export const environment = {
    host: import.meta.env.VITE_TDM_FACTORY_HOST,
    get: {
        list: {
            wrapper: '/api/data-wrappers/list',
        },
        processing: {
            status: '/api/traitment/status',
            fields: '/api/traitment/fields',
            resultInfo: '/api/traitment/result-info',
            info: '/api/traitment/info',
        },
        config: {
            static: '/config-static',
        },
    },
    post: {
        processing: {
            upload: '/api/traitment/upload',
            start: '/api/traitment/start',
        },
    },
} as const;

export const host = config.hosts.backend.host;

export const createQuery = (uri: string, param?: Record<string, string> | undefined): URL => {
    const url = new URL(host + uri);
    if (param !== undefined) {
        const query = new URLSearchParams(param);
        url.search = query.toString();
    }
    return url;
};

export const json = <T>(response: Response): Promise<T> => {
    return response.json() as Promise<T>;
};
