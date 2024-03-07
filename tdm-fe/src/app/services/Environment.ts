export const environment = {
    host: import.meta.env.VITE_TDM_FACTORY_HOST,
    get: {
        list: {
            wrapper: '/api/data-wrappers/list',
            enrichment: '/api/data-enrichments/list',
        },
        processing: {
            status: '/api/traitment/status',
        },
    },
    post: {
        processing: {
            upload: '/api/traitment/upload',
            start: '/api/traitment/start',
        },
    },
} as const;

const internalHost = environment.host === '' ? window.location.origin : environment.host;

export const createQuery = (uri: string, param?: Record<string, string> | undefined): URL => {
    const url = new URL(internalHost + uri);
    if (param !== undefined) {
        const query = new URLSearchParams(param);
        url.search = query.toString();
    }
    return url;
};

export const json = <T>(response: Response): Promise<T> => {
    return response.json() as Promise<T>;
};
