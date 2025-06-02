import environment from '~/lib/config';
import { sendStartedMail } from '~/lib/email';
import { filesLocation, randomFileName, uploadFile } from '~/lib/files';
import {
    HTTP_ACCEPTED,
    HTTP_BAD_REQUEST,
    HTTP_CONFLICT,
    HTTP_CREATED,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_FOUND,
    HTTP_PRECONDITION_REQUIRED,
} from '~/lib/http';
import logger from '~/lib/logger';
import { createProcessing, findProcessing, updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';
import csvFields from '~/worker/fields/csvFields';
import wrapper from '~/worker/wrapper';

import express from 'express';
import multer from 'multer';

import type { Request, Response } from 'express';
import type { Processing } from '~/model/ProcessingModel';
import type { Traitment } from '~/model/Traitment';

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
    async (req: Request<unknown, unknown, Traitment>, res) => {
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

        if (processing.status !== Status.UNKNOWN) {
            res.status(HTTP_CONFLICT).send({
                status: HTTP_CONFLICT,
                message: 'Conflict - The processing as already been started',
            });
            return;
        }

        // --- Get processing params
        // Set default params as undefined
        let wrapperUrl: string | undefined = undefined;
        let wrapperParam: string | undefined = undefined;
        let urlEnrichment: string | undefined = undefined;
        let email: string | undefined = undefined;
        let flowId: string | undefined = undefined;

        // Get wrapper url
        if (traitement.wrapper && traitement.wrapper.url) {
            wrapperUrl = traitement.wrapper.url;
        }

        // Get wrapper param
        if (traitement.wrapper && traitement.wrapper.parameters) {
            if (traitement.wrapper.parameters.length >= 1) {
                wrapperParam = traitement.wrapper.parameters[0];
            }
        }

        // Get enrichment url
        if (traitement.enrichment && traitement.enrichment.url) {
            urlEnrichment = traitement.enrichment.url;
        }

        if (traitement.mail) {
            email = traitement.mail;
        }

        // Get flowId
        if (traitement.flowId) {
            flowId = traitement.flowId;
            logger.debug(`Received flowId: ${flowId}`);
        } else {
            logger.debug('No flowId received in request');
        }

        // Check if default params is pressent
        if (!wrapperUrl || !urlEnrichment || !wrapperParam || !email) {
            res.status(HTTP_BAD_REQUEST).send({
                status: HTTP_BAD_REQUEST,
                message: 'Bad Request - Required parameter cannot be null',
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
            email,
            flowId,
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
        // Create the confirmation page URL to return to the client
        // We use the process/:type route with a special query parameter to redirect to the confirmation step
        const confirmationUrl = `${
            environment.hosts.external.isHttps ? 'https' : 'http'
        }://${environment.hosts.external.host}/process/result?id=${updatedProcessing.id}&step=5`;
        // Wait for the notification email to be sent before starting the processing
        await sendStartedMail(
            updatedProcessing.id,
            updatedProcessing.originalName,
            updatedProcessing.wrapper as string,
            updatedProcessing.wrapperParam as string,
            updatedProcessing.enrichment as string,
            req.body.mail,
            updatedProcessing.flowId
        );

        // Start the processing only after sending the email
        wrapper(updatedProcessing.id);

        // Send an http response with code 202
        res.status(HTTP_ACCEPTED).send({
            status: HTTP_ACCEPTED,
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
        const processingId = req.body.processingId;
        const originalName = req.body.originalName;
        const uploadedFile = req.file.filename;

        const result = createProcessing(processingId, originalName, uploadedFile);
        if (result) {
            res.status(HTTP_CREATED).send({
                id: result.id,
            });
            return;
        }
        res.status(HTTP_INTERNAL_SERVER_ERROR).send({
            status: HTTP_INTERNAL_SERVER_ERROR,
        });
    }
});

router.get('/fields', (req, res) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    const initialProcessing = findProcessing(id);

    // Check if the processing existe
    if (!initialProcessing) {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    if (initialProcessing.uploadFile.endsWith('csv')) {
        csvFields(uploadFile(initialProcessing.uploadFile)).then((fields) => {
            res.send({
                fields,
            });
        });
        return;
    }

    res.send({
        fields: [],
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
 *           type: string
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

    if (!id || typeof id !== 'string') {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    const initialProcessing = findProcessing(id);

    // Check if the processing existe
    if (!initialProcessing) {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    res.send({
        message: `Status du traitement ${initialProcessing.id} ${initialProcessing.status === Status.UNKNOWN ? ': Inconnu' : ''}`,
        errorType: initialProcessing.status,
    });
});

/**
 * @swagger
 * /traitment/result-info:
 *   get:
 *     summary: get result file information
 *     description: get result file information including extension
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID parameter
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultUrl:
 *                   type: string
 *                 extension:
 *                   type: string
 *       '404':
 *         description: Processing not found or result not available
 */
//Route to retrieve result file information
router.get('/result-info', (req, res) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    const processing = findProcessing(id);

    // Check if the processing exists
    if (!processing) {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    // Check if the processing is finished and has a result file
    if (processing.status !== Status.FINISHED || !processing.resultFile) {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
            message: 'Result file not available',
        });
        return;
    }

    // Extract the extension from the result file path
    const resultFileName = processing.resultFile.split('/').pop() || '';
    const extension = resultFileName.split('.').pop() || '';

    const resultUrl = `${
        environment.hosts.external.isHttps ? 'https' : 'http'
    }://${environment.hosts.external.host}/downloads/${id}.${extension}`;

    res.send({
        resultUrl,
        extension,
    });
});

/**
 * @swagger
 * /traitment/info:
 *   get:
 *     summary: get processing information
 *     description: get processing information including original file name
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID parameter
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 originalName:
 *                   type: string
 *                 status:
 *                   type: number
 *                 wrapper:
 *                   type: string
 *                 wrapperParam:
 *                   type: string
 *                 enrichment:
 *                   type: string
 *       '404':
 *         description: Processing not found
 */
//Route to retrieve processing information
router.get('/info', (req, res) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    const processing = findProcessing(id);

    // Check if the processing exists
    if (!processing) {
        res.status(HTTP_NOT_FOUND).send({
            status: HTTP_NOT_FOUND,
        });
        return;
    }

    // Déterminer le type de traitement (article ou corpus) à partir du flowId
    let type = 'article'; // Par défaut, c'est un article
    if (processing.flowId && processing.flowId.startsWith('corpus-')) {
        type = 'corpus';
    }

    res.send({
        id: processing.id,
        originalName: processing.originalName,
        status: processing.status,
        wrapper: processing.wrapper,
        wrapperParam: processing.wrapperParam,
        enrichment: processing.enrichment,
        type: type,
        flowId: processing.flowId,
    });
});

export default router;
