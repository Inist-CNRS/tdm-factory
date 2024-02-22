import axios from 'axios';
import type { Traitment } from '~/model/Traitment';
import logger from '~/lib/logger';
import Status from '~/model/Status';

export const enrichment = (urlEnrichment: string, fd: Buffer, conf: any, traitment: Traitment) => {
    axios.post(urlEnrichment, fd, conf).then(
        (enrichmentRes) => {
            traitment.status = Status.WAITING_WEBHOOK;
            logger.info(`Traitment Done for ${traitment.timestamp}`);
            traitment.retrieveValue = enrichmentRes.data[0].value;
        },
        (error) => {
            traitment.status = Status.ENRICHMENT_ERROR;
            logger.error(`Traitment Error for ${traitment.timestamp}`);
            logger.error(error);
        },
    );
};
