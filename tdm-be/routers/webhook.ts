import { StatusEnum } from '../model/StatusEnum';
import { sendEmail } from '../service/email-sender';
import axios from 'axios';
import express from 'express';
import fs from 'fs';
import type { SwaggerApi } from '../model/Config';
import type { Traitment } from '../model/Traitment';
import type { EmailOptions } from '../service/email-sender';

const router = express.Router();
const configModel = require('../model/Config');
let currentTraitments: Traitment[] = require('../model/Traitment');

const config = configModel.getConfig();

//Webhook of success after traitment done
router.post(
    '/success',
    (req, res) => {
        const { id } = req.query;
        const traitment: Traitment = currentTraitments.filter(
            (t) => t.timestamp + '' === id,
        )[0];
        const enrichment = config.enrichments.filter(
            (enrichment: SwaggerApi) =>
                traitment.enrichment.url.indexOf(enrichment.url) > -1,
        )[0];
        if (traitment) {
            axios
                .post(
                    enrichment.url + enrichment.retrieveUrl,
                    [{ value: traitment.retrieveValue }],
                    { responseType: 'arraybuffer' },
                )
                .then(
                    (retrieveRes) => {
                        traitment.status = StatusEnum.FINISHED;
                        // Process the payload as needed
                        const bin: Buffer = Buffer.from(
                            retrieveRes.data,
                            'binary',
                        );
                        fs.writeFileSync(
                            `public/downloads/${traitment.timestamp}.tar.gz`,
                            bin,
                        );
                        console.log('mail sent to smtp');
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
                        console.log(error);
                        res.status(500).send('Error retrieving file');
                    },
                );
        } else {
            console.log(
                `This traitment doesn't exist on current process id=${id}`,
            );
            res.status(404).send(
                `This traitment doesn't exist on current process id=${id}`,
            );
        }
    },
    (error) => {
        console.log(error);
    },
);

//Webhook of failure after traitment done
router.post(
    '/failure',
    (req, res) => {
        const { id } = req.query;
        const traitment: Traitment = currentTraitments.filter(
            (traitment) => traitment.timestamp === id,
        )[0];
        traitment.status = StatusEnum.FINISHED_ERROR;
        if (traitment) {
            currentTraitments = currentTraitments.filter(
                (t) => t.timestamp !== traitment.timestamp,
            );
            // Process the payload as needed
            console.log('Received webhook error:', id);
            const mailOptions: EmailOptions = {
                to: traitment.mail,
                subject: config.mailError.subject,
                text: config.mailError.text,
            };
            sendEmail(mailOptions);
        }
    },
    (error) => {
        console.log(error);
    },
);

module.exports = router;
