import {
    ERROR_MESSAGE_FILE_SYSTEM_ERROR,
    ERROR_MESSAGE_WRAPPER_UNEXPECTED_ERROR,
    ERROR_MESSAGE_WRAPPER_BAD_USER_INPUT,
    ERROR_MESSAGE_WRAPPER_UNREACHABLE_ERROR,
} from '~/lib/codes';
import crash from '~/lib/crash';
import { tmpFile, uploadFile } from '~/lib/files';
import { workerLogger } from '~/lib/logger';
import { errorEmail } from '~/lib/utils';
import { findProcessing, updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';
import enrichment from '~/worker/enrichment';

import axios, { type AxiosResponse } from 'axios';

import { readFile, writeFile } from 'node:fs/promises';

const info = (id: string, message: string) => {
    workerLogger.info(`[wrapper/${id}] ${message}`);
};

const error = (id: string, message: string) => {
    workerLogger.error(`[wrapper/${id}] ${message}`);
};

const debug = (id: string, message: string) => {
    workerLogger.debug(`[wrapper/${id}] ${message}`);
};

const wrapper = async (processingId: string) => {
    info(processingId, 'Wrapper process started');

    // --- Get processing information
    debug(processingId, 'Getting processing information');

    // Find the processing in the cache db
    const initialProcessing = updateProcessing(processingId, {
        status: Status.WRAPPER_RUNNING,
    });

    // Check if the processing existe
    if (!initialProcessing) {
        error(processingId, 'Wrapper initial processing is undefined');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Wrapper initial processing is undefined');
    }

    // Get wrapper variable from the processing
    const { uploadFile: file, wrapper: wrapperUrl, wrapperParam } = initialProcessing;

    // Check if the variable existe
    if (!file || !wrapperUrl || !wrapperParam) {
        error(processingId, 'Wrapper value are undefined or null');
        // Send error the global catcher because this is normally impossible
        throw new Error('This is normally impossible - Wrapper value are undefined or null');
    }

    // --- Start wrapper process
    debug(processingId, 'Starting wrapper process');

    // Load file into a buffer
    let fileBuffer: Buffer;
    try {
        fileBuffer = await readFile(uploadFile(file));
    } catch (e) {
        const message = "Can't read uploaded file";
        error(processingId, message);
        errorEmail(initialProcessing, ERROR_MESSAGE_FILE_SYSTEM_ERROR);
        crash(e, message, initialProcessing);
        return;
    }

    // Convert JSONL to JSON if needed
    let actualWrapperUrl = wrapperUrl;
    if (file.endsWith('.jsonl') && wrapperUrl.includes('/v1/jsonl')) {
        try {
            const jsonlContent = fileBuffer.toString('utf8');
            const lines = jsonlContent.split('\n').filter((l) => l.trim());
            const jsonArray = lines
                .map((line, i) => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        debug(processingId, `Skipping invalid JSON line ${i + 1}`);
                        return null;
                    }
                })
                .filter((obj) => obj !== null);

            fileBuffer = Buffer.from(JSON.stringify(jsonArray), 'utf8');
            actualWrapperUrl = wrapperUrl.replace('/v1/jsonl', '/v1/json');
        } catch (e) {
            const message = "Can't convert JSONL to JSON";
            error(processingId, message);
            crash(e, message, initialProcessing);
            errorEmail(initialProcessing, ERROR_MESSAGE_FILE_SYSTEM_ERROR);
            return;
        }
    }

    // Call wrapper api
    let response: AxiosResponse;
    try {
        response = await axios.post(actualWrapperUrl, fileBuffer, {
            responseType: 'arraybuffer',
            params: {
                value: wrapperParam,
            },
            timeout: 600000,
        });
    } catch (e) {
        const message = 'Impossible to contact wrapper api';
        error(processingId, message);
        crash(e, message, initialProcessing);
        errorEmail(initialProcessing, ERROR_MESSAGE_WRAPPER_UNREACHABLE_ERROR);
        updateProcessing(processingId, {
            status: Status.WRAPPER_ERROR,
        });
        return;
    }

    // --- Save wrapper result
    debug(processingId, 'Saving wrapper result');

    // Check if we receive a non 200 status code
    if (response.status !== 200) {
        error(processingId, 'Wrapper api return an non 200 status');
        errorEmail(initialProcessing, ERROR_MESSAGE_WRAPPER_BAD_USER_INPUT);
        updateProcessing(processingId, {
            status: Status.WRAPPER_ERROR,
        });
        return;
    }

    // Get tmp file name
    const dumpFile = tmpFile(`${processingId}.tar.gz`);

    // Save the tmp file
    try {
        const resultBuffer = new Uint8Array(Buffer.from(response.data, 'binary'));
        await writeFile(dumpFile, resultBuffer);
    } catch (e) {
        const message = "Can't write tmp file";
        error(processingId, message);
        crash(e, message, initialProcessing);
        errorEmail(initialProcessing, ERROR_MESSAGE_FILE_SYSTEM_ERROR);
        return;
    }

    // Update processing information
    updateProcessing(processingId, {
        tmpFile: dumpFile,
    });

    // Start the enrichment step
    enrichment(processingId);
};

const catchWrapper = (processingId: string) => {
    const wrapperPromise = wrapper(processingId);
    wrapperPromise.catch((e) => {
        const message = 'Receive an un-catch error from wrapper';
        error(processingId, 'Receive an un-catch error from wrapper');
        crash(e, message, processingId);
        try {
            const processing = findProcessing(processingId);
            if (!processing) {
                return;
            }
            errorEmail(processing, ERROR_MESSAGE_WRAPPER_UNEXPECTED_ERROR);
            updateProcessing(processingId, {
                status: Status.WRAPPER_ERROR,
            });
        } catch {
            /* empty */
        }
    });
};

export default catchWrapper;
