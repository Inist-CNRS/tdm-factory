import md5 from 'md5';
import fs from 'node:fs/promises';
import path from 'path';
import logger from '~/lib/logger';

const filesLocation = {
    app: process.cwd(),
    tmp: 'tmp',
};

export const randomFileName = (): string => {
    return md5(`${Date.now()}-${Math.round(Math.random() * 1e9)}`);
};

export const tmpFile = (fileName: string): string => {
    return path.join(filesLocation.app, filesLocation.tmp, fileName);
};

export const initFilesSystem = async (): Promise<void> => {
    logger.debug('Initializing files system');
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('public/downloads', { recursive: true });
    await fs.mkdir('tmp', { recursive: true });
    logger.debug('Files system initialized');
};
