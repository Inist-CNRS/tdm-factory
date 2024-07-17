import logger from '~/lib/logger';

import md5 from 'md5';

import fs from 'node:fs/promises';
import path from 'path';

export const filesLocation = {
    app: process.cwd(),
    tmp: 'tmp',
    upload: 'uploads',
    crash: 'crash',
    download: 'public/downloads',
    templates: 'src/templates',
};

export const readDir = async (directory: string) => {
    const dirContent = await fs.readdir(path.join(filesLocation.app, directory));
    return Promise.all(
        dirContent.map(async (file) => {
            return {
                file,
                stats: await fs.stat(path.join(filesLocation.app, directory, file)),
            };
        }),
    );
};

export const randomFileName = (): string => {
    return md5(`${Date.now()}-${Math.round(Math.random() * 1e9)}`);
};

export const tmpFile = (fileName: string): string => {
    return path.join(filesLocation.app, filesLocation.tmp, fileName);
};

export const dbFile = (fileName: string): string => {
    return path.join(filesLocation.app, fileName);
};

export const uploadFile = (fileName: string): string => {
    return path.join(filesLocation.app, filesLocation.upload, fileName);
};

export const crashFile = (fileName: string): string => {
    return path.join(filesLocation.app, filesLocation.crash, fileName);
};

export const downloadFile = (fileName: string): string => {
    return path.join(filesLocation.app, filesLocation.download, fileName);
};

export const templatesFiles = () => {
    return path.join(filesLocation.app, filesLocation.templates);
};

export const initFilesSystem = async (): Promise<void> => {
    logger.debug('Initializing files system');
    await fs.mkdir(filesLocation.upload, { recursive: true });
    await fs.mkdir(filesLocation.download, { recursive: true });
    await fs.mkdir(filesLocation.tmp, { recursive: true });
    await fs.mkdir(filesLocation.crash, { recursive: true });
    logger.debug('Files system initialized');
};
