import {
    ERROR_MESSAGE_ENRICHMENT_HOOK_PAYLOAD_NOT_ACCEPTED_ERROR,
    ERROR_MESSAGE_ENRICHMENT_HOOK_UNEXPECTED_ERROR,
    ERROR_MESSAGE_ENRICHMENT_HOOK_UNREACHABLE_ERROR,
    ERROR_MESSAGE_FILE_SYSTEM_ERROR,
} from '~/lib/codes';
import environment from '~/lib/config';
import crash from '~/lib/crash';
import { sendErrorMail, sendFinishedMail } from '~/lib/email';
import { downloadFile, randomFileName } from '~/lib/files';
import { workerLogger } from '~/lib/logger';
import { errorEmail } from '~/lib/utils';
import dynamicConfig from '~/model/DynamicConfig';
import { findProcessing, updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';

import axios from 'axios';

import { writeFile } from 'node:fs/promises';

import type { AxiosResponse } from 'axios';

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

    // Check if the variable exist
    if (!enrichmentUrl || !enrichmentHook || !email) {
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
        response = await axios.post(
            fullUrl,
            [{ value: enrichmentHook }],
            {
                responseType: 'arraybuffer',
            },
        );
        debug(processingId, `Enrichment-Hook api call successful`);
    } catch (e) {
        const message = `Impossible to contact enrichment-hook api (${fullUrl})`;
        error(processingId, message);
        sendErrorMail({
            email,
            data: {
                processingId: initialProcessing.id,
                originalName: initialProcessing.originalName,
                wrapper: initialProcessing.wrapper as string,
                wrapperParam: initialProcessing.wrapperParam as string,
                enrichment: initialProcessing.enrichment as string,
                errorMessage: ERROR_MESSAGE_ENRICHMENT_HOOK_UNREACHABLE_ERROR,
            },
        }).then(undefined);
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
        sendErrorMail({
            email,
            data: {
                processingId: initialProcessing.id,
                originalName: initialProcessing.originalName,
                wrapper: initialProcessing.wrapper as string,
                wrapperParam: initialProcessing.wrapperParam as string,
                enrichment: initialProcessing.enrichment as string,
                errorMessage: ERROR_MESSAGE_ENRICHMENT_HOOK_PAYLOAD_NOT_ACCEPTED_ERROR,
            },
        }).then(undefined);
        updateProcessing(processingId, {
            status: Status.FINISHED_ERROR,
            flowId,
        });
        return;
    }

    // Get tmp file name
    const finalFileName = `${randomFileName()}.${enrichmentEntry.retrieveExtension}`;
    const finalFile = downloadFile(finalFileName);

    // Save the tmp file
    try {
        const resultBuffer = Buffer.from(response.data, 'binary');
        await writeFile(finalFile, resultBuffer);
    } catch (e) {
        const message = "Can't write tmp file";
        error(processingId, message);
        sendErrorMail({
            email,
            data: {
                processingId: initialProcessing.id,
                originalName: initialProcessing.originalName,
                wrapper: initialProcessing.wrapper as string,
                wrapperParam: initialProcessing.wrapperParam as string,
                enrichment: initialProcessing.enrichment as string,
                errorMessage: ERROR_MESSAGE_FILE_SYSTEM_ERROR,
            },
        }).then(undefined);
        updateProcessing(processingId, {
            status: Status.FINISHED_ERROR,
            flowId,
        });
        crash(e, message, initialProcessing);
        return;
    }

    const resultUrl = `${
        environment.hosts.external.isHttps ? 'https' : 'http'
    }://${environment.hosts.external.host}/downloads/${finalFileName}`;

    sendFinishedMail({
        email,
        data: {
            processingId: initialProcessing.id,
            originalName: initialProcessing.originalName,
            wrapper: initialProcessing.wrapper as string,
            wrapperParam: initialProcessing.wrapperParam as string,
            enrichment: initialProcessing.enrichment as string,
            resultFile: resultUrl,
        },
    }).then(undefined);

    // Update processing information
    updateProcessing(processingId, {
        status: Status.FINISHED,
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

    // Check if the variable exist
    if (!email) {
        error(processingId, 'Enrichment-Hook email is undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Enrichment-Hook email is undefined or null');
    }

    // --- Save enrichment-hook result
    debug(processingId, 'Saving enrichment-hook result');

    sendErrorMail({
        email,
        data: {
            processingId: initialProcessing.id,
            originalName: initialProcessing.originalName,
            wrapper: initialProcessing.wrapper as string,
            wrapperParam: initialProcessing.wrapperParam as string,
            enrichment: initialProcessing.enrichment as string,
            errorMessage: "Une erreur s'est produite lors de l'enrichissement",
        },
    }).then(undefined);

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
            } catch (ignored) {
                /* empty */
            }
        }
    };
};

export default {
    success: catchEnrichmentHook(enrichmentHookSuccess),
    failure: catchEnrichmentHook(enrichmentHookFailure),
};
