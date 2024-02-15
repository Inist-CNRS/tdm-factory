import logger from './logger';
import md5 from 'md5';
import fs from 'node:fs/promises';

export const randomFileName = () => {
    return md5(`${Date.now()}-${Math.round(Math.random() * 1e9)}`);
};

export const initFilesSystem = async () => {
    logger.debug('Initializing files system');
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('public/downloads', { recursive: true });
    logger.debug('Files system initialized');
};
