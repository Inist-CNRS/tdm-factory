import { StatusEnum } from './StatusEnum';
import type { Request } from './Request';

export class Traitment {
    wrapper: Request = { url: '' };
    enrichment: Request = { url: '' };
    mail = '';
    file = '';
    timestamp?: number;
    retrieveValue?: string;
    status: StatusEnum = StatusEnum.UNKNOWN;
}

const currentTraitments: Traitment[] = [];

export default currentTraitments;
