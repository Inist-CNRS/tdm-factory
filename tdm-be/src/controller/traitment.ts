import express from 'express';
import multer from 'multer';
import fs from 'fs';
import type { Request, Response } from 'express';
import type { Traitment } from '~/model/Traitment';
import environment from '~/lib/config';
import { sendEmail } from '~/lib/email-sender';
import { randomFileName } from '~/lib/files';
import logger from '~/lib/logger';
import Status from '~/model/Status';
import { addTraitement, getTraitement } from '~/model/Traitment';
import { wrapper } from '~/worker/wrapper';

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
        traitment.status = Status.WRAPPER_RUNNING;

        const statusPanelUrl = `${
            environment.hosts.external.isHttps ? 'https' : 'http'
        }://${environment.hosts.external.host}?id=${traitment.timestamp}`;

        res.send({
            message: `Enrichissement démarré vous allez recevoir un email.`,
            url: statusPanelUrl,
        });

        sendEmail({
            to: req.body.mail,
            subject: 'Votre traitement a bien démarré',
            text: `Un suivi est disponible à l'url ${statusPanelUrl}`,
        }).then(() => {
            logger.info('mail envoyer pour début de traitement');
        });

        wrapper(url, fileData, traitment, urlEnrichment).then(undefined);
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
    let status: Status = Status.UNKNOWN;
    if (traitment) {
        status = traitment.status;
    }
    res.send({
        message: `Status du traitement ${id} ${status === Status.UNKNOWN ? ': Inconnu' : ''}`,
        errorType: status,
    });
});

export default router;
