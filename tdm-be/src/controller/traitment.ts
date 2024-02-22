import express from 'express';
import multer from 'multer';
import type { Request, Response } from 'express';
import type { Processing } from '~/model/ProcessingModel';
import type { Parameter } from '~/model/Request';
import type { Traitment } from '~/model/Traitment';
import environment from '~/lib/config';
import { sendEmail } from '~/lib/email-sender';
import { filesLocation, randomFileName } from '~/lib/files';
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_INTERNAL_SERVER_ERROR, HTTP_PRECONDITION_REQUIRED } from '~/lib/http';
import logger from '~/lib/logger';
import { createProcessing, findProcessing, updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';
import { getTraitement } from '~/model/Traitment';
import wrapper from '~/worker/wrapper';

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
 *       '428':
 *         description: No processing are available for this id
 *       '500':
 *         description: Internal server error
 */
//Route to start traitment wrapping and then enrichment
router.post(
    '/start',
    (req: Request<unknown, unknown, Traitment>, res) => {
        const traitement: Traitment = req.body;

        // --- Find the processing associated with the uploaded file
        // Get the processing the sqlite cache db
        const processing = findProcessing(traitement.file);

        // Check if the processing exists
        if (!processing) {
            res.status(HTTP_PRECONDITION_REQUIRED).send({
                status: HTTP_PRECONDITION_REQUIRED,
                message: 'Precondition Required - No processing are available for this id',
            });
            return;
        }

        // --- Get processing webservices url
        // Set the wrapper and the enrichment as undefined
        let wrapperUrl: string | undefined = undefined;
        let wrapperParam = 'value';
        let urlEnrichment: string | undefined = undefined;

        // Get wrapper url
        if (traitement.wrapper && traitement.wrapper.url) {
            wrapperUrl = traitement.wrapper.url;
        }

        // Get wrapper param
        if (traitement.wrapper && traitement.wrapper.parameters) {
            const param = traitement.wrapper.parameters
                .filter((param) => param !== undefined && param.value !== undefined && param.name !== undefined)
                .find((param) => (param as Required<Parameter>).name === 'value') as Required<Parameter> | undefined;
            if (param) {
                wrapperParam = param.value;
            }
        }

        // Get enrichment url
        if (traitement.enrichment && traitement.enrichment.url) {
            urlEnrichment = traitement.enrichment.url;
        }

        // Check if the wrapper and the enrichment is pressent
        if (!wrapperUrl || !urlEnrichment) {
            res.status(HTTP_BAD_REQUEST).send({
                status: HTTP_BAD_REQUEST,
                message: 'Bad Request - Wrapper nor enrichment cannot be null',
            });
            return;
        }

        // --- Update the processing with the new webservices url
        // Create the partial processing use to update the cache db
        const processingSetting: Partial<Processing> = {
            wrapper: wrapperUrl,
            wrapperParam,
            enrichment: urlEnrichment,
            status: Status.STARTING,
        };

        // Update the cache db
        const updatedProcessing = updateProcessing(processing.id, processingSetting);

        // Check if the cache db return a valide processing
        if (!updatedProcessing) {
            res.status(HTTP_INTERNAL_SERVER_ERROR).send({
                status: HTTP_INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error - Something went wrong when updating the processing status',
            });
            return;
        }

        // --- Send a message to the user about the processing starting
        // Create the status url return to the client
        const statusPanelUrl = `${
            environment.hosts.external.isHttps ? 'https' : 'http'
        }://${environment.hosts.external.host}?id=${updatedProcessing.id}`;

        // Start the processing by starting the wrapper
        wrapper(updatedProcessing.id);

        // Send a mail with the processing information
        sendEmail({
            to: req.body.mail,
            subject: 'Votre traitement a bien démarré',
            text: `Un suivi est disponible à l'url ${statusPanelUrl}`,
        }).then(() => {
            logger.info('mail envoyer pour début de traitement');
        });

        // Send a http response with the processing information
        res.send({
            message: `Enrichissement démarré vous allez recevoir un email.`,
            url: statusPanelUrl,
        });
    },
    (error) => {
        logger.error(error);
    },
);

//Function to store file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set your desired destination folder
        cb(null, filesLocation.upload);
    },
    filename: function (req, file, cb) {
        const uniqueName = randomFileName();
        req.body.processingId = uniqueName;
        req.body.originalName = file.originalname;
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
 *       '201':
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       '400':
 *         description: Bad request, file upload failed
 *       '500':
 *         description: Internal server error
 */
// Route to handle file upload
router.post('/upload', upload.single('file'), (req, res: Response) => {
    if (req.body.processingId && req.body.originalName && req.file?.filename) {
        const result = createProcessing(req.body.processingId, req.body.originalName, req.file.filename);
        if (result) {
            res.status(HTTP_CREATED).send({
                id: result.id,
            });
            return;
        }
    }

    res.status(HTTP_INTERNAL_SERVER_ERROR).send({
        status: HTTP_INTERNAL_SERVER_ERROR,
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
