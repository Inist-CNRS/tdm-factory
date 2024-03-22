import { createQuery, environment, json } from '~/app/services/Environment';

import type { EnrichmentList, WrapperList } from '~/app/shared/data.types';

export const wrapper = async () => {
    const response = await fetch(createQuery(environment.get.list.wrapper));
    return json<WrapperList>(response);
};

export const enrichment = async () => {
    const response = await fetch(createQuery(environment.get.list.enrichment));
    return json<EnrichmentList>(response);
};
