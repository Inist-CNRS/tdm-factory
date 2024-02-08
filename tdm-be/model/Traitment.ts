import { Request } from './Request';
import { StatusEnum } from './StatusEnum';

export class Traitment {
  wrapper: Request = { url: '' };
  enrichment: Request = { url: '' };
  mail: string = '';
  file: string = '';
  timestamp?: number;
  retrieveValue?: string;
  status: StatusEnum = StatusEnum.UNKNOWN;
}



const currentTraitments: Traitment[] = [];

module.exports = currentTraitments;
