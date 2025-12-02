/**
 * Temporary cache for uploaded files before processing is started
 * This stores uploaded file metadata in the database to ensure persistence across server restarts
 */

import {
    createPendingUpload,
    deletePendingUpload,
    findPendingUpload,
    cleanOldPendingUploads,
    type PendingUpload,
} from '~/model/PendingUploadModel';

type UploadedFile = PendingUpload;

/**
 * Store uploaded file information
 */
export const storeUploadedFile = (processingId: string, originalName: string, uploadedFile: string): void => {
    createPendingUpload(processingId, originalName, uploadedFile);
};

/**
 * Get uploaded file information
 */
export const getUploadedFile = (processingId: string): UploadedFile | undefined => {
    return findPendingUpload(processingId);
};

/**
 * Remove uploaded file from cache
 */
export const removeUploadedFile = (processingId: string): void => {
    deletePendingUpload(processingId);
};

/**
 * Clean old entries from cache (older than 24 hours)
 */
export const cleanOldUploads = (): number => {
    return cleanOldPendingUploads();
};
