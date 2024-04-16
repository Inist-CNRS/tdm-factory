import { createQuery, environment, json } from '~/app/services/Environment';

export const upload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(createQuery(environment.post.processing.upload), {
        method: 'POST',
        body: formData,
    });

    if (response.status !== 201) {
        throw new Error(response.status.toString(10));
    }

    return (await json<{ id: string }>(response)).id;
};
