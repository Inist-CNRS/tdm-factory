import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

export const logList = async (): Promise<string[]> => {
    const response = await fetch(createQuery(environment.get.logs), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return [];
    }
    return await json<string[]>(response);
};

export const logs = async (name: string, level: string): Promise<string> => {
    const response = await fetch(createQuery(`${environment.get.logs}/${name}/${level}`), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return '';
    }
    return await response.text();
};
