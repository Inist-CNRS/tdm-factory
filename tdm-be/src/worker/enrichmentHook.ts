import axios from 'axios';
import { writeFile } from 'node:fs/promises';
import path from 'path';
import type { AxiosResponse } from 'axios';
import type { EmailOptions } from '~/lib/email-sender';
import environment from '~/lib/config';
import crash from '~/lib/crash';
import { sendEmail } from '~/lib/email-sender';
import { downloadFile, randomFileName } from '~/lib/files';
import logger, { workerLogger } from '~/lib/logger';
import configModel from '~/model/Config';
import { updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';

const info = (id: string, message: string) => {
    workerLogger.info(`[enrichment-hook/${id}] ${message}`);
};

const error = (id: string, message: string) => {
    workerLogger.error(`[enrichment-hook/${id}] ${message}`);
};

const debug = (id: string, message: string) => {
    workerLogger.debug(`[enrichment-hook/${id}] ${message}`);
};

/**
 * Enrichment WebHook success handler
 * @param processingId
 */
const enrichmentHookSuccess = async (processingId: string) => {
    info(processingId, 'Enrichment-Hook process started');

    // --- Get processing information
    debug(processingId, 'Getting processing information');

    // Find the processing in the cache db
    const initialProcessing = updateProcessing(processingId, {
        status: Status.PROCESSING_WEBHOOK,
    });

    // Check if the processing existe
    if (!initialProcessing) {
        error(processingId, 'Enrichment-Hook initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook initial processing is undefined');
    }

    // Get wrapper variable from the processing
    const { enrichment: enrichmentUrl, enrichmentHook, email, status } = initialProcessing;

    // Check if we still wait for webhook
    if (status !== Status.WAITING_WEBHOOK) {
        return;
    }

    // Check if the variable existe
    if (!enrichmentUrl || !enrichmentHook || !email) {
        error(processingId, 'Enrichment-Hook value are undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook value are undefined or null');
    }

    // Get dynamic config
    const config = configModel.getConfig();

    // Get the enrichment config
    const enrichmentEntry = config.enrichments.find((entry) => {
        return enrichmentUrl.includes(entry.url);
    });

    // Check if enrichment entry existe
    if (!enrichmentEntry || !enrichmentEntry.url || !enrichmentEntry.retrieveUrl) {
        error(processingId, 'Enrichment-Hook config dos not contait the enrichment url');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook config dos not contait the enrichment url');
    }

    let response: AxiosResponse;
    try {
        response = await axios.post(
            path.join(enrichmentEntry.url, enrichmentEntry.retrieveUrl),
            [{ value: enrichmentHook }],
            {
                responseType: 'arraybuffer',
            },
        );
    } catch (e) {
        const message = 'Impossible to contact enrichment-hook api';
        error(processingId, message);
        // TODO Send an error email
        crash(e, message, initialProcessing);
        return;
    }

    // --- Save enrichment-hook result
    debug(processingId, 'Saving enrichment-hook result');

    // Check if we receive a non 200 status code
    if (response.status !== 200) {
        error(processingId, 'Enrichment-hook api return an non 200 status');
        // TODO Send an error email
        return;
    }

    // Get tmp file name
    const finalFileName = `${randomFileName()}.tar.gz`;
    const finalFile = downloadFile(finalFileName);

    // Save the tmp file
    try {
        const resultBuffer = Buffer.from(response.data, 'binary');
        await writeFile(finalFile, resultBuffer);
    } catch (e) {
        const message = "Can't write tmp file";
        error(processingId, message);
        // TODO Send an error email
        crash(e, message, initialProcessing);
        return;
    }

    const resultUrl = `${
        environment.hosts.external.isHttps ? 'https' : 'http'
    }://${environment.hosts.external.host}/downloads/${finalFileName}`;
    logger.info('mail sent to smtp');

    const mailOptions: EmailOptions = {
        to: email,
        subject: config.mailSuccess.subject,
        text: config.mailSuccess.text + `\n ${resultUrl}`,
    };

    sendEmail(mailOptions).then(undefined);

    // Update processing information
    updateProcessing(processingId, {
        status: Status.FINISHED,
        resultFile: finalFile,
    });
};

/**
 * Enrichment WebHook failure handler
 * @param processingId
 */
const enrichmentHookFailure = async (processingId: string) => {
    info(processingId, 'Enrichment-Hook process started');

    // --- Get processing information
    debug(processingId, 'Getting processing information');

    // Find the processing in the cache db
    const initialProcessing = updateProcessing(processingId, {
        status: Status.PROCESSING_WEBHOOK,
    });

    // Check if the processing existe
    if (!initialProcessing) {
        error(processingId, 'Enrichment-Hook initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook initial processing is undefined');
    }

    // Get wrapper variable from the processing
    const { email, status } = initialProcessing;

    // Check if we still wait for webhook
    if (status !== Status.WAITING_WEBHOOK) {
        return;
    }

    // Check if the variable existe
    if (!email) {
        error(processingId, 'Enrichment-Hook value are undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook value are undefined or null');
    }

    // Get dynamic config
    const config = configModel.getConfig();

    // --- Save enrichment-hook result
    debug(processingId, 'Saving enrichment-hook result');

    const mailOptions: EmailOptions = {
        to: email,
        subject: config.mailError.subject,
        text: config.mailError.text,
    };

    sendEmail(mailOptions).then(undefined);

    // Update processing information
    updateProcessing(processingId, {
        status: Status.FINISHED_ERROR,
    });
};

const catchEnrichmentHook = (enrichmentHook: { (processingId: string): Promise<void> }) => {
    return (processingId: string) => {
        const enrichmentPromise = enrichmentHook(processingId);
        enrichmentPromise.catch((e) => {
            const message = 'Receive an un-catch error from enrichment hook';
            error(processingId, 'Receive an un-catch error from enrichment hook');
            // TODO Send an error email
            crash(e, message, processingId);
        });
    };
};

export default {
    success: catchEnrichmentHook(enrichmentHookSuccess),
    failure: catchEnrichmentHook(enrichmentHookFailure),
};
