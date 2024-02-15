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

let currentTraitments: Traitment[] = [];

export const addTraitement = (traitement: Traitment) => {
    currentTraitments.push(traitement);
};

export const getTraitement = () => {
    return currentTraitments;
};

export const setTraitement = (traitements: Traitment[]) => {
    currentTraitments = traitements;
};
