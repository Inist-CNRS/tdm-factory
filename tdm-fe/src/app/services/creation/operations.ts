import { createQuery, environment, json } from '~/app/services/Environment';

import type { WrapperList } from '~/app/shared/data.types';

export const wrapper = async () => {
    const response = await fetch(createQuery(environment.get.list.wrapper));
    return json<WrapperList>(response);
};
