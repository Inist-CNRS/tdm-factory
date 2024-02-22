import axios from 'axios';
import logger from '~/lib/logger';
import Status from '~/model/Status';

export const enrichment = (urlEnrichment, fd, conf, traitment) => {
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
            res.status(500).send(error.response.data.message);
        },
    );
};
