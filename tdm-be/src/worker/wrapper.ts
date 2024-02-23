import axios from 'axios';
import { readFile, writeFile } from 'node:fs/promises';
import type { AxiosResponse } from 'axios';
import crash from '~/lib/crash';
import { randomFileName, tmpFile, uploadFile } from '~/lib/files';
import { workerLogger } from '~/lib/logger';
import { updateProcessing } from '~/model/ProcessingModel';
import Status from '~/model/Status';
import enrichment from '~/worker/enrichment';

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
        // TODO Send an error email
        crash(e, message, initialProcessing);
        return;
    }

    // Call wrapper api
    let response: AxiosResponse;
    try {
        response = await axios.post(wrapperUrl, fileBuffer, {
            responseType: 'arraybuffer',
            params: {
                value: wrapperParam,
            },
            timeout: 600000,
        });
    } catch (e) {
        const message = 'Impossible to contact wrapper api';
        error(processingId, message);
        // TODO Send an error email
        crash(e, message, initialProcessing);
        return;
    }

    // --- Save wrapper result
    debug(processingId, 'Saving wrapper result');

    // Check if we receive a non 200 status code
    if (response.status !== 200) {
        error(processingId, 'Wrapper api return an non 200 status');
        // TODO Send an error email
        return;
    }

    // Get tmp file name
    const dumpFile = tmpFile(`${randomFileName()}.tar.gz`);

    // Save the tmp file
    try {
        const resultBuffer = Buffer.from(response.data, 'binary');
        await writeFile(dumpFile, resultBuffer);
    } catch (e) {
        const message = "Can't write tmp file";
        error(processingId, message);
        // TODO Send an error email
        crash(e, message, initialProcessing);
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
        // TODO Send an error email
        crash(e, message, processingId);
    });
};

export default catchWrapper;
