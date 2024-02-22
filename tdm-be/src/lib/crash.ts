import { writeFile } from 'node:fs/promises';
import { crashFile } from '~/lib/files';
import logger from '~/lib/logger';

/**
 * Crash handler use to crash a crash report for event who are normally unindented
 * @param error Error catch during the crash
 * @param message Message associated with the action who cause the crash
 * @param data Stats or additional data use before the crash
 */
const crashHandler = (error: Error | unknown, message: string, data: unknown) => {
    try {
        const crashReport = crashFile(`${new Date().toString()}.json`);
        const crashContent = JSON.stringify(
            {
                message,
                data,
                error,
            },
            null,
            2,
        );
        writeFile(crashReport, crashContent)
            .then()
            .catch(() => {
                logger.warn("Can't create crash dump!");
            });
    } catch (ignore) {
        logger.warn("Can't create crash dump!");
    }
};

export default crashHandler;
