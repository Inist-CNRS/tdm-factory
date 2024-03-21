import {
    ERROR_MESSAGE_ENRICHMENT_PAYLOAD_NOT_ACCEPTED_ERROR,
    ERROR_MESSAGE_ENRICHMENT_UNEXPECTED_ERROR,
    ERROR_MESSAGE_ENRICHMENT_UNREACHABLE_ERROR,
    ERROR_MESSAGE_FILE_SYSTEM_ERROR,
} from '~/lib/codes';
import environment from '~/lib/config';
import crash from '~/lib/crash';
import { workerLogger } from '~/lib/logger';
import { errorEmail } from '~/lib/utils';
import { findProcessing } from '~/model/ProcessingModel';
import { updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';

import axios from 'axios';

import { readFile } from 'node:fs/promises';

import type { AxiosResponse } from 'axios';

const info = (id: string, message: string) => {
    workerLogger.info(`[enrichment/${id}] ${message}`);
};

const error = (id: string, message: string) => {
    workerLogger.error(`[enrichment/${id}] ${message}`);
};

const debug = (id: string, message: string) => {
    workerLogger.debug(`[enrichment/${id}] ${message}`);
};

const enrichment = async (processingId: string) => {
    info(processingId, 'Enrichment process started');

    // --- Get processing information
    debug(processingId, 'Getting processing information');

    // Find the processing in the cache db
    const initialProcessing = updateProcessing(processingId, {
        status: Status.ENRICHMENT_RUNNING,
    });

    // Check if the processing existe
    if (!initialProcessing) {
        error(processingId, 'Enrichment initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment initial processing is undefined');
    }

    // Get wrapper variable from the processing
    const { tmpFile: file, enrichment: enrichmentUrl } = initialProcessing;

    // Check if the variable existe
    if (!file || !enrichmentUrl) {
        error(processingId, 'Enrichment value are undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment value are undefined or null');
    }

    // --- Start enrichment process
    debug(processingId, 'Starting enrichment process');

    // Load file into a buffer
    let fileBuffer: Buffer;
    try {
        fileBuffer = await readFile(file);
    } catch (e) {
        const message = "Can't read tmp file";
        error(processingId, message);
        crash(e, message, initialProcessing);
        errorEmail(initialProcessing, ERROR_MESSAGE_FILE_SYSTEM_ERROR);
        return;
    }

    // Call enrichment api
    let response: AxiosResponse;
    try {
        response = await axios.post(enrichmentUrl, fileBuffer, {
            headers: {
                'X-Webhook-Success': `${
                    environment.hosts.internal.isHttps ? 'https' : 'http'
                }://${environment.hosts.internal.host}/webhook/success?id=${processingId}`,
                'X-Webhook-Failure': `${
                    environment.hosts.internal.isHttps ? 'https' : 'http'
                }://${environment.hosts.internal.host}/webhook/failure?id=${processingId}`,
            },
            timeout: 600000,
        });
    } catch (e) {
        const message = 'Impossible to contact enrichment api';
        error(processingId, message);
        crash(e, message, initialProcessing);
        errorEmail(initialProcessing, ERROR_MESSAGE_ENRICHMENT_UNREACHABLE_ERROR);
        return;
    }

    // --- Save enrichment result
    debug(processingId, 'Saving enrichment status');

    // Check if we receive a non 200 status code
    if (response.status !== 200) {
        error(processingId, 'Enrichment api return an non 200 status');
        errorEmail(initialProcessing, ERROR_MESSAGE_ENRICHMENT_PAYLOAD_NOT_ACCEPTED_ERROR);
        return;
    }

    // Update processing information
    updateProcessing(processingId, {
        status: Status.WAITING_WEBHOOK,
        enrichmentHook: response.data[0].value,
    });
};

const catchEnrichment = (processingId: string) => {
    const enrichmentPromise = enrichment(processingId);
    enrichmentPromise.catch((e) => {
        const message = 'Receive an un-catch error from enrichment';
        error(processingId, 'Receive an un-catch error from enrichment');
        crash(e, message, processingId);
        try {
            const processing = findProcessing(processingId);
            if (!processing) {
                return;
            }
            errorEmail(processing, ERROR_MESSAGE_ENRICHMENT_UNEXPECTED_ERROR);
        } catch (ignored) {}
    });
};

export default catchEnrichment;
