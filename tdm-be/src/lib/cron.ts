import environment from '~/lib/config';
import { customFile, filesLocation } from '~/lib/files';
import { cronLogger } from '~/lib/logger';

import cron from 'node-cron';

import fs from 'node:fs/promises';

const deleteOldFiles = async (directory: string) => {
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
    cronLogger.debug('Creating upload files cron');
    cron.schedule(environment.cron.schedule, () => {
        deleteOldFiles(filesLocation.upload)
            .then(() => {
                cronLogger.info('Upload files cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Upload files cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.debug('Creating temporary files cron');
    cron.schedule(environment.cron.schedule, () => {
        deleteOldFiles(filesLocation.tmp)
            .then(() => {
                cronLogger.info('Temporary files cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Temporary files cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.debug('Creating download files cron');
    cron.schedule(environment.cron.schedule, () => {
        deleteOldFiles(filesLocation.download)
            .then(() => {
                cronLogger.info('Download files cron ended successfully');
            })
            .catch((reason) => {
                cronLogger.error('Download files cron ended with a crash');
                cronLogger.error(reason);
            });
    });

    cronLogger.info('Cron initialized');
};

export default initCron;
