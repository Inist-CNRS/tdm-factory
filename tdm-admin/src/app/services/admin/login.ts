import { createQuery, environment, getAuthHeader, json } from '~/app/services/Environment';

export const login = async () => {
    const response = await fetch(createQuery(environment.get.login), {
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    if (response.status !== 200) {
        return false;
    }
    const result = await json<{ status: number }>(response);
    return result.status === 200;
};
