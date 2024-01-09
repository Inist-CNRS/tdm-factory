import express from 'express';
import { sendEmail, EmailOptions } from '../service/email-sender';
import { Traitment } from '../model/Traitment';
import axios from 'axios';
import environment from '../environment';
import fs from 'fs';
import { StatusEnum } from '../model/StatusEnum';
const router = express.Router();
var currentTraitments: Traitment[] = require('../model/Traitment');
var config = require('../model/Config');

//Webhook of success after traitment done
router.post('/success', (req, res) => {
    const { id } = req.query;
    console.log(`Webhook ${id}`);
    const traitment: Traitment = currentTraitments.filter((t) => t.timestamp + '' === id)[0];
    if (traitment) {
        axios.post(environment.retrieveUrl, [{ value: traitment.retrieveValue }], { responseType: 'arraybuffer' }).then((retrieveRes) => {
            traitment.status = StatusEnum.FINISHED;
            // Process the payload as needed
            const bin: Buffer = Buffer.from(retrieveRes.data, 'binary');
            fs.writeFileSync(`public/downloads/${traitment.timestamp}.tar.gz`, bin);
            console.log('mail sent to smtp');
            const mailOptions: EmailOptions = {
                to: traitment.mail,
                subject: config.mailSuccess.subject,
                text: config.mailSuccess.text + `\n ${environment.url}/downloads/${traitment.timestamp}.tar.gz`,
            };
            sendEmail(mailOptions);
            res.send('Email envoyé');
        }, (error) => {
            traitment.status = StatusEnum.FINISHED_ERROR;
            console.log(error);
            res.status(500).send('Error retrieving file');
        });
    } else {
        res.status(404).send(`This traitment doesn't exist on current process id=${id}`);
    }
}, (error) => {
    console.log(error);
});


//Webhook of failure after traitment done
router.post('/failure', (req, res) => {
    const { id } = req.query;
    const traitment: Traitment = currentTraitments.filter((traitment) => traitment.timestamp === id)[0];
    if (traitment) {
        currentTraitments = currentTraitments.filter((t) => t.timestamp !== traitment.timestamp);
        // Process the payload as needed
        console.log('Received webhook error:', id);
        const mailOptions: EmailOptions = { to: traitment.mail, subject: config.mailError.subject, text: config.mailError.text };
        sendEmail(mailOptions);
    }
}, (error) => {
    console.log(error);
});



module.exports = router;