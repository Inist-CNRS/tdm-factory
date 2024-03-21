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
import type { Processing } from '~/model/ProcessingModel';
import { createProcessing, findProcessing, updateProcessing } from '~/model/ProcessingModel';
import type { Parameter } from '~/model/Request';
import Status from '~/model/Status';
import type { Traitment } from '~/model/Traitment';
import csvFields from '~/worker/fields/csvFields';
import wrapper from '~/worker/wrapper';

import express from 'express';
import multer from 'multer';

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
        let wrapperParam = 'value';
        let urlEnrichment: string | undefined = undefined;
        let email: string | undefined = undefined;

        // Get wrapper url
        if (traitement.wrapper && traitement.wrapper.url) {
            wrapperUrl = traitement.wrapper.url;
        }

        // Get wrapper param
        if (traitement.wrapper && traitement.wrapper.parameters) {
            const tmpWrapperParam = traitement.wrapper.parameters
                .filter((param) => param !== undefined && param.value !== undefined && param.name !== undefined)
                .find((param) => (param as Required<Parameter>).name === 'value') as Required<Parameter> | undefined;
            if (tmpWrapperParam) {
                wrapperParam = tmpWrapperParam.value;
            }
        }

        // Get enrichment url
        if (traitement.enrichment && traitement.enrichment.url) {
            urlEnrichment = traitement.enrichment.url;
        }

        if (traitement.mail) {
            email = traitement.mail;
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
        }://${environment.hosts.external.host}/status/${updatedProcessing.id}`;

        // Start the processing by starting the wrapper
        wrapper(updatedProcessing.id);

        // Send a mail with the processing information
        sendStartedMail({
            email: req.body.mail,
            data: {
                processingId: updatedProcessing.id,
                originalName: updatedProcessing.originalName,
                wrapper: updatedProcessing.wrapper as string,
                wrapperParam: updatedProcessing.wrapperParam as string,
                enrichment: updatedProcessing.enrichment as string,
                statusPage: statusPanelUrl,
            },
        }).then(undefined);

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

export default router;
