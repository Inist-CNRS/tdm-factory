import environment from '~/lib/config';
import { customFile, filesLocation } from '~/lib/files';
import { cronLogger } from '~/lib/logger';

import cron from 'node-cron';

import fs from 'node:fs/promises';

const createFileCron = async (directory: string) => {
    const oneWeekAgo = new Date(); // Date actuelle
    oneWeekAgo.setDate(oneWeekAgo.getDate() - environment.cron.deleteFileOlderThan);

    const files = await fs.readdir(customFile(directory));

    for (const file of files) {
        const filePath = customFile(directory, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile() && stats.mtime < oneWeekAgo) {
            await fs.unlink(filePath);
            cronLogger.info(`${filePath} has been delete`);
        }
    }
};

const initCron = () => {
    cronLogger.debug('Creating upload file cron');
    cron.schedule(environment.cron.schedule, () => {
        createFileCron(filesLocation.upload)
            .then(() => {
                cronLogger.info('Upload file cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Upload file cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.debug('Creating temporary file cron');
    cron.schedule(environment.cron.schedule, () => {
        createFileCron(filesLocation.tmp)
            .then(() => {
                cronLogger.info('Temporary file cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Temporary file cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.debug('Creating download file cron');
    cron.schedule(environment.cron.schedule, () => {
        createFileCron(filesLocation.download)
            .then(() => {
                cronLogger.info('Download file cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Download file cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.info('Cron initialized');
};

export default initCron;
