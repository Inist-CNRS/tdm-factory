import environment from '../lib/config';
import { randomFileName, tmpFile } from '../lib/files';
import logger from '../lib/logger';
import { StatusEnum } from '../model/StatusEnum';
import { addTraitement, getTraitement } from '../model/Traitment';
import { sendEmail } from '../service/email-sender';
import axios from 'axios';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import type { Traitment } from '../model/Traitment';
import type { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Traitment:
 *       type: object
 *       properties:
 *         wrapper:
 *           $ref: '#/components/schemas/Request'
 *         enrichment:
 *           $ref: '#/components/schemas/Request'
 *         mail:
 *           type: string
 *         file:
 *           type: string
 *
 */

/**
 * @swagger
 * /traitment/start:
 *   post:
 *     summary: Set configuration data
 *     description: Endpoint to set configuration data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Traitment'
 *     responses:
 *       '200':
 *         description: File uploaded successfully
 *         content:
 *           application/json:  # Define the content type as text/plain
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message.
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: URL associated with the message.
 *       '400':
 *         description: Bad request, file upload failed
 *       '500':
 *         description: Internal server error
 */
//Route to start traitment wrapping and then enrichment
router.post(
    '/start',
    (req: Request<unknown, unknown, Traitment>, res) => {
        const traitment: Traitment = req.body;
        addTraitement(traitment);
        const url = traitment.wrapper?.url ? traitment.wrapper?.url : '';
        const urlEnrichment = traitment.enrichment?.url ? traitment.enrichment?.url : '';
        const fileData = fs.readFileSync(`${environment.fileFolder}${traitment.file}`);
        traitment.timestamp = new Date().getTime();
        traitment.status = StatusEnum.WRAPPER_RUNNING;
        res.send({
            message: `Enrichissement démarré vous allez recevoir un email.`,
            url: `Un suivi est disponible à l\'url https://${req.hostname}?id=${traitment.timestamp}`,
        });
        sendEmail({
            to: req.body.mail,
            subject: 'Votre traitement a bien démarré',
            text: `Un suivi est disponible à l\'url http://${req.hostname}?id=${traitment.timestamp}`,
        }).then(() => {
            logger.info('mail envoyer pour début de traitement');
        });
        axios
            .post(url, fileData, {
                responseType: 'arraybuffer',
                params: {
                    value: traitment.wrapper.parameters?.find((p) => p.name === 'value')?.value,
                },
                timeout: 600000,
            })
            .then(
                (wrapperRes) => {
                    const bin: Buffer = Buffer.from(wrapperRes.data, 'binary');
                    const dumpFilePath = tmpFile(`${randomFileName()}.tar.gz`);
                    fs.writeFileSync(dumpFilePath, bin);
                    const fd = fs.readFileSync(dumpFilePath);
                    logger.info(`Wrapper Done for ${traitment.timestamp}`);
                    const conf = {
                        headers: {
                            'X-Webhook-Success': `${
                                environment.hosts.internal.isHttps ? 'https' : 'http'
                            }://${environment.hosts.internal.host}/webhook/success?id=${traitment.timestamp}`,
                            'X-Webhook-Failure': `${
                                environment.hosts.internal.isHttps ? 'https' : 'http'
                            }://${environment.hosts.internal.host}/webhook/failure?id=${traitment.timestamp}`,
                        },
                        timeout: 600000,
                    };
                    traitment.status = StatusEnum.TRAITMENT_RUNNING;
                    axios.post(urlEnrichment, fd, conf).then(
                        (enrichmentRes) => {
                            traitment.status = StatusEnum.WAITING_WEBHOOK;
                            logger.info(`Traitment Done for ${traitment.timestamp}`);
                            traitment.retrieveValue = enrichmentRes.data[0].value;
                        },
                        (error) => {
                            traitment.status = StatusEnum.TRAITMENT_ERROR;
                            logger.error(`Traitment Error for ${traitment.timestamp}`);
                            logger.error(error);
                            res.status(500).send(error.response.data.message);
                        },
                    );
                },
                (error) => {
                    traitment.status = StatusEnum.WRAPPER_ERROR;
                    logger.error(`Wrapper Error for ${traitment.timestamp}`);
                    logger.error(error);
                    res.status(500).send(error.message);
                },
            );
    },
    (error) => {
        logger.error(error);
    },
);

//Function to store file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set your desired destination folder
        cb(null, environment.fileFolder);
    },
    filename: function (req, file, cb) {
        const uniqueName = randomFileName();
        // Set the file name
        cb(null, `${uniqueName}.${file.originalname.split('.').pop() ?? ''}`);
    },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /traitment/upload:
 *   post:
 *     summary: Upload a file
 *     description: Endpoint to upload a file to the server
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filename:
 *                   type: string
 *       '400':
 *         description: Bad request, file upload failed
 *       '500':
 *         description: Internal server error
 */
// Route to handle file upload
router.post('/upload', upload.single('file'), (req, res: Response) => {
    res.send({
        filename: req.file?.filename,
    });
});

/**
 * @swagger
 * /traitment/status:
 *   get:
 *     summary: get status
 *     description: get status
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID parameter
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorType:
 *                   type: number
 */
//Route to retrieve traitment status
router.get('/status', (req, res) => {
    const { id } = req.query;
    const traitment: Traitment = getTraitement().filter((t) => t.timestamp + '' === id)[0];
    let status: StatusEnum = StatusEnum.UNKNOWN;
    if (traitment) {
        status = traitment.status;
    }
    res.send({
        message: `Status du traitement ${id} ${status === StatusEnum.UNKNOWN ? ': Inconnu' : ''}`,
        errorType: status,
    });
});

export default router;
