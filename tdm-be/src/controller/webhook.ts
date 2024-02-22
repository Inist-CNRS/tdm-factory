import axios from 'axios';
import express from 'express';
import fs from 'fs';
import type { EmailOptions } from '~/lib/email-sender';
import type { SwaggerApi } from '~/model/Config';
import type { Traitment } from '~/model/Traitment';
import environment from '~/lib/config';
import { sendEmail } from '~/lib/email-sender';
import logger from '~/lib/logger';
import configModel from '~/model/Config';
import Status from '~/model/Status';
import { getTraitement, setTraitement } from '~/model/Traitment';

const router = express.Router();

const config = configModel.getConfig();

//Webhook of success after traitment done
router.post(
    '/success',
    (req, res) => {
        const { id } = req.query;
        const traitment: Traitment = getTraitement().filter((t) => t.timestamp + '' === id)[0];
        const enrichment = config.enrichments.filter(
            (enrichment: SwaggerApi) => traitment.enrichment.url.indexOf(enrichment.url) > -1,
        )[0];
        if (traitment) {
            axios
                .post(enrichment.url + enrichment.retrieveUrl, [{ value: traitment.retrieveValue }], {
                    responseType: 'arraybuffer',
                })
                .then(
                    (retrieveRes) => {
                        traitment.status = Status.FINISHED;
                        // Process the payload as needed
                        const bin: Buffer = Buffer.from(retrieveRes.data, 'binary');
                        fs.writeFileSync(`public/downloads/${traitment.timestamp}.tar.gz`, bin);
                        const resultUrl = `${
                            environment.hosts.external.isHttps ? 'https' : 'http'
                        }://${environment.hosts.external.host}/downloads/${traitment.timestamp}.tar.gz`;
                        logger.info('mail sent to smtp');
                        const mailOptions: EmailOptions = {
                            to: traitment.mail,
                            subject: config.mailSuccess.subject,
                            text: config.mailSuccess.text + `\n ${resultUrl}`,
                        };
                        sendEmail(mailOptions);
                        res.send('Email envoyé');
                    },
                    (error) => {
                        logger.error(error);
                        res.status(500).send('Error retrieving file');
                    },
                );
        } else {
            logger.error(`This traitment doesn't exist on current process id=${id}`);
            res.status(404).send(`This traitment doesn't exist on current process id=${id}`);
        }
    },
    (error) => {
        logger.error(error);
    },
);

//Webhook of failure after traitment done
router.post(
    '/failure',
    (req, res) => {
        const { id } = req.query;
        const traitment: Traitment = getTraitement().filter((traitment) => traitment.timestamp === id)[0];
        traitment.status = Status.FINISHED_ERROR;
        if (traitment) {
            setTraitement(getTraitement().filter((t) => t.timestamp !== traitment.timestamp));
            // Process the payload as needed
            logger.info('Received webhook error:', id);
            const mailOptions: EmailOptions = {
                to: traitment.mail,
                subject: config.mailError.subject,
                text: config.mailError.text,
            };
            sendEmail(mailOptions);
        }
    },
    (error) => {
        logger.error(error);
    },
);

export default router;
