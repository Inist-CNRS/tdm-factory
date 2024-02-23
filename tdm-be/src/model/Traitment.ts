import type { Request } from '~/model/Request';
import Status from '~/model/Status';

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
