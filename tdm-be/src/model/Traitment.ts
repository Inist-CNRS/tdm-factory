import Status from '~/model/Status';

import type { Request } from '~/model/Request';

export class Traitment {
    wrapper: Request = { url: '' };
    enrichment: Request = { url: '' };
    mail = '';
    file = '';
    timestamp?: number;
    id?: string;
    retrieveValue?: string;
    status: Status = Status.UNKNOWN;
}
