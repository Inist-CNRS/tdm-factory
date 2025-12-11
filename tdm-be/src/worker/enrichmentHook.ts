import { ERROR_MESSAGE_ENRICHMENT_HOOK_UNEXPECTED_ERROR } from '~/lib/codes';
import environment from '~/lib/config';
import crash from '~/lib/crash';
import { sendErrorMail, sendFinishedMail } from '~/lib/email';
import { downloadFile } from '~/lib/files';
import { workerLogger } from '~/lib/logger';
import { errorEmail } from '~/lib/utils';
import { findProcessing, updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';

import axios, { type AxiosResponse } from 'axios';

import { writeFile } from 'node:fs/promises';

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
    const initialProcessing = findProcessing(processingId);

    // Check if the processing exists
    if (!initialProcessing) {
        error(processingId, 'Enrichment-Hook initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook initial processing is undefined');
    }

    // Get wrapper variable from the processing
    const { enrichment: enrichmentUrl, enrichmentHook, email, status, flowId } = initialProcessing;

    // Check if we still wait for webhook
    if (status !== Status.WAITING_WEBHOOK) {
        return;
    }

    updateProcessing(processingId, {
        status: Status.PROCESSING_WEBHOOK,
        flowId,
    });

    // Check if the variable exist (email is optional)
    if (!enrichmentUrl || !enrichmentHook) {
        error(processingId, 'Enrichment-Hook value are undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook value are undefined or null');
    }

    // // Get dynamic config
    // const config = dynamicConfig.getConfig();

    // Get the enrichment config
    // const enrichmentEntry = config.enrichments.find((entry) => {
    //     return enrichmentUrl.includes(entry.url);
    // });

    // Get the enrichment config from static config using flowId
    debug(processingId, `Looking for flow with ID: ${flowId}`);
    const enrichmentEntry = environment.flows.find((flow) => flow.id === flowId);

    if (enrichmentEntry) {
        debug(processingId, `Found flow: ${enrichmentEntry.id} with extension: ${enrichmentEntry.retrieveExtension}`);
    } else {
        error(processingId, `Flow with ID ${flowId} not found in environment.flows`);
    }

    // Check if enrichment entry exists
    if (!enrichmentEntry || !enrichmentEntry.enricher || !enrichmentEntry.retrieve) {
        error(processingId, 'Enrichment-Hook config dos not contain the enricher url');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook config does not contain the enricher url');
    }

    let response: AxiosResponse;
    const enricherUrlObj = new URL(enrichmentEntry.enricher);
    const baseUrl = `${enricherUrlObj.protocol}//${enricherUrlObj.host}`;

    // Get the retrieve path, ensuring it starts with a slash
    const retrievePath = enrichmentEntry.retrieve.startsWith('/')
        ? enrichmentEntry.retrieve
        : '/' + enrichmentEntry.retrieve;

    // Construct the full URL
    const fullUrl = `${baseUrl}${retrievePath}`;
    debug(processingId, `Calling URL: ${fullUrl}`);

    try {
        response = await axios.post(fullUrl, [{ value: enrichmentHook }], {
            responseType: 'arraybuffer',
        });
        debug(processingId, `Enrichment-Hook api call successful`);
    } catch (e) {
        const message = `Impossible to contact enrichment-hook api (${fullUrl})`;
        error(processingId, message);
        if (email) {
            sendErrorMail(
                initialProcessing.id,
                initialProcessing.originalName,
                initialProcessing.wrapper as string,
                initialProcessing.wrapperParam as string,
                initialProcessing.enrichment as string,
                email,
                flowId,
                message,
            ).then(undefined);
        }
        updateProcessing(processingId, {
            status: Status.FINISHED_ERROR,
            flowId,
        });
        crash(e, message, initialProcessing);
        return;
    }

    // --- Save enrichment-hook result
    debug(processingId, 'Saving enrichment-hook result');

    // Check if we receive a non 200 status code
    if (response.status !== 200) {
        error(processingId, 'Enrichment-hook api return an non 200 status');
        if (email) {
            sendErrorMail(
                initialProcessing.id,
                initialProcessing.originalName,
                initialProcessing.wrapper as string,
                initialProcessing.wrapperParam as string,
                initialProcessing.enrichment as string,
                email,
                flowId,
                'Enrichment-hook api return an non 200 status',
            ).then(undefined);
        }
        updateProcessing(processingId, {
            status: Status.FINISHED_ERROR,
            flowId,
        });
        return;
    }

    // Get tmp file name
    const finalFileName = `${processingId}.${enrichmentEntry.retrieveExtension}`;
    const finalFile = downloadFile(finalFileName);

    // Save the tmp file
    try {
        const resultBuffer = new Uint8Array(Buffer.from(response.data, 'binary'));
        await writeFile(finalFile, resultBuffer);
    } catch (e) {
        const message = "Can't write tmp file";
        error(processingId, message);
        if (email) {
            sendErrorMail(
                initialProcessing.id,
                initialProcessing.originalName,
                initialProcessing.wrapper as string,
                initialProcessing.wrapperParam as string,
                initialProcessing.enrichment as string,
                email,
                flowId,
                message,
            ).then(undefined);
        }
        updateProcessing(processingId, {
            status: Status.FINISHED_ERROR,
            flowId,
        });
        crash(e, message, initialProcessing);
        return;
    }

    if (email) {
        sendFinishedMail(
            initialProcessing.id,
            initialProcessing.originalName,
            initialProcessing.wrapper as string,
            initialProcessing.wrapperParam as string,
            initialProcessing.enrichment as string,
            email,
            flowId,
        ).then(undefined);
    }

    // Remove the name part of the email
    const emailWithoutName = email?.split('@')[1];

    // Update processing information
    updateProcessing(processingId, {
        status: Status.FINISHED,
        email: emailWithoutName,
        resultFile: finalFile,
        flowId,
    });
};

/**
 * Enrichment WebHook failure handler
 * @param processingId
 */
const enrichmentHookFailure = async (processingId: string) => {
    info(processingId, 'Enrichment-Hook failure process started');

    // --- Get processing information
    debug(processingId, 'Getting processing information');

    // Find the processing in the cache db
    const initialProcessing = findProcessing(processingId);

    // Check if the processing exists
    if (!initialProcessing) {
        error(processingId, 'Enrichment-Hook initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook initial processing is undefined');
    }

    // Get email from the processing
    const { email } = initialProcessing;

    // --- Save enrichment-hook result
    debug(processingId, 'Saving enrichment-hook result');

    if (email) {
        sendErrorMail(
            initialProcessing.id,
            initialProcessing.originalName,
            initialProcessing.wrapper as string,
            initialProcessing.wrapperParam as string,
            initialProcessing.enrichment as string,
            email,
            initialProcessing.flowId,
            'Enrichment-Hook failure',
        ).then(undefined);
    }

    // Update processing information
    updateProcessing(processingId, {
        status: Status.ENRICHMENT_ERROR,
        flowId: initialProcessing.flowId,
    });
};

const catchEnrichmentHook = (enrichmentHook: { (processingId: string): Promise<void> }) => {
    return async (processingId: string) => {
        try {
            await enrichmentHook(processingId);
        } catch (e) {
            const message = 'Receive an un-catch error from enrichment hook';
            error(processingId, 'Receive an un-catch error from enrichment hook');
            crash(e, message, processingId);
            try {
                const processing = findProcessing(processingId);
                if (!processing) {
                    return;
                }
                errorEmail(processing, ERROR_MESSAGE_ENRICHMENT_HOOK_UNEXPECTED_ERROR);
            } catch {
                /* empty */
            }
        }
    };
};

export default {
    success: catchEnrichmentHook(enrichmentHookSuccess),
    failure: catchEnrichmentHook(enrichmentHookFailure),
};
