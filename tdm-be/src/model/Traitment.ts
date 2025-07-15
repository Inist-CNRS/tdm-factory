import Status from '~/model/Status';

import type { Request } from '~/model/Request';

export class Traitment {
    wrapper: Request = { url: '' };
    mail = '';
    file = '';
    flowId?: string;
    timestamp?: number;
    id?: string;
    retrieveValue?: string;
    status: Status = Status.UNKNOWN;
}
