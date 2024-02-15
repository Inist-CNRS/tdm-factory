import logger from '../lib/logger';
import configModel from '../model/Config';
import { StatusEnum } from '../model/StatusEnum';
import { getTraitement, setTraitement } from '../model/Traitment';
import { sendEmail } from '../service/email-sender';
import axios from 'axios';
import express from 'express';
import fs from 'fs';
import type { SwaggerApi } from '../model/Config';
import type { Traitment } from '../model/Traitment';
import type { EmailOptions } from '../service/email-sender';

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
                        traitment.status = StatusEnum.FINISHED;
                        // Process the payload as needed
                        const bin: Buffer = Buffer.from(retrieveRes.data, 'binary');
                        fs.writeFileSync(`public/downloads/${traitment.timestamp}.tar.gz`, bin);
                        logger.info('mail sent to smtp');
                        const mailOptions: EmailOptions = {
                            to: traitment.mail,
                            subject: config.mailSuccess.subject,
                            text:
                                config.mailSuccess.text +
                                `\n ${req.protocol}://${req.hostname}/downloads/${traitment.timestamp}.tar.gz`,
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
        traitment.status = StatusEnum.FINISHED_ERROR;
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
