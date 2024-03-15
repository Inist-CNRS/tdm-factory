import type { ProcessingFields } from '~/app/shared/data.types';
import { createQuery, environment, json } from '~/app/services/Environment';

export const fields = async (id: string) => {
    const response = await fetch(createQuery(environment.get.processing.fields, { id }));
    if (response.status !== 200) {
        return undefined;
    }
    return json<ProcessingFields>(response);
};
