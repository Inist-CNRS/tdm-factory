import database from '~/lib/database';

export type PendingUpload = {
    processingId: string;
    originalName: string;
    uploadedFile: string;
    timestamp: number;
};

/**
 * Create a new pending upload entry
 * @param processingId ID of the processing
 * @param originalName Original name of the uploaded file
 * @param uploadedFile Name of the uploaded file on disk
 */
export const createPendingUpload = (
    processingId: string,
    originalName: string,
    uploadedFile: string,
): PendingUpload | undefined => {
    const timestamp = Date.now();
    const stmt = database.prepare<[string, string, string, number], PendingUpload>(`
        insert into pending_uploads (processingId, originalName, uploadedFile, timestamp)
        values (?, ?, ?, ?);
    `);

    const result = stmt.run(processingId, originalName, uploadedFile, timestamp);

    if (result.changes !== 0) {
        return {
            processingId,
            originalName,
            uploadedFile,
            timestamp,
        } satisfies PendingUpload;
    }

    return undefined;
};

/**
 * Find a pending upload by processing ID
 * @param processingId ID of the processing
 */
export const findPendingUpload = (processingId: string): PendingUpload | undefined => {
    const stmt = database.prepare<[string], PendingUpload>(`
        select processingId, originalName, uploadedFile, timestamp
        from pending_uploads
        where processingId = ?;
    `);

    return stmt.get(processingId);
};

/**
 * Delete a pending upload entry
 * @param processingId ID of the processing
 */
export const deletePendingUpload = (processingId: string): boolean => {
    const stmt = database.prepare<[string]>(`
        delete from pending_uploads
        where processingId = ?;
    `);

    const result = stmt.run(processingId);
    return result.changes !== 0;
};

/**
 * Clean old pending uploads (older than 24 hours)
 * @returns Number of entries cleaned
 */
export const cleanOldPendingUploads = (): number => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoffTime = now - maxAge;

    const stmt = database.prepare<[number]>(`
        delete from pending_uploads
        where timestamp < ?;
    `);

    const result = stmt.run(cutoffTime);
    return result.changes;
};
