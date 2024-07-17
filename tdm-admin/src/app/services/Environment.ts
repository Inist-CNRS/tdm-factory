export const environment = {
    host: import.meta.env.VITE_TDM_FACTORY_HOST,
    get: {
        login: '/api/admin',
        config: '/config',
        files: '/api/admin/files',
    },
    post: {
        config: '/config/set',
    },
} as const;

const auth = ['user', ''];

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

export const setAuth = (username: string, password: string) => {
    auth[0] = username;
    auth[1] = password;
};

export const getAuthHeader = () => {
    return `Basic ${btoa(auth.join(':'))}`;
};
