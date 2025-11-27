/**
 * Temporary cache for uploaded files before processing is started
 * This avoids creating database entries for files that are never confirmed
 */

type UploadedFile = {
    processingId: string;
    originalName: string;
    uploadedFile: string;
    timestamp: number;
};

const uploadCache = new Map<string, UploadedFile>();

/**
 * Store uploaded file information
 */
export const storeUploadedFile = (processingId: string, originalName: string, uploadedFile: string): void => {
    uploadCache.set(processingId, {
        processingId,
        originalName,
        uploadedFile,
        timestamp: Date.now(),
    });
};

/**
 * Get uploaded file information
 */
export const getUploadedFile = (processingId: string): UploadedFile | undefined => {
    return uploadCache.get(processingId);
};

/**
 * Remove uploaded file from cache
 */
export const removeUploadedFile = (processingId: string): void => {
    uploadCache.delete(processingId);
};

/**
 * Clean old entries from cache (older than 24 hours)
 */
export const cleanOldUploads = (): number => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;

    for (const [key, value] of uploadCache.entries()) {
        if (now - value.timestamp > maxAge) {
            uploadCache.delete(key);
            cleaned++;
        }
    }

    return cleaned;
};
