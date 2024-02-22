import database from '~/lib/database';
import Status from '~/model/Status';

export type Processing = {
    id: string;
    status: Status;
    email: string | null;
    wrapper: string | null;
    enrichment: string | null;
    uploadFile: string | null;
    tmpFile: string | null;
    resultFile: string | null;
};

/**
 * Helper function use to compare two value and set a default value if both are null or undefined
 * @param first First value to compare
 * @param second Second value to compare
 */
const defaultNull = <T>(first: T | null | undefined, second: T | null | undefined): T | null => {
    if (first !== null && first !== undefined) {
        return first;
    }

    if (second !== null && second !== undefined) {
        return second;
    }

    return null;
};

/**
 * Create a new processing
 * @param id ID of the processing
 * @param uploadFile Source file of processing
 */
export const createProcessing = (id: string, uploadFile: string): Processing | undefined => {
    const stmt = database.prepare<[string, number, string]>(`
        insert into processing (id, status, uploadFile) values (?, ?, ?);
    `);

    const result = stmt.run(id, Status.UNKNOWN, uploadFile);

    if (result.changes !== 0) {
        return {
            id,
            status: Status.UNKNOWN,
            uploadFile: uploadFile,
            email: null,
            tmpFile: null,
            resultFile: null,
            wrapper: null,
            enrichment: null,
        } satisfies Processing;
    }

    return undefined;
};

/**
 * Find a processing
 * @param id ID of the processing
 */
export const findProcessing = (id: string): Processing | undefined => {
    const stmt = database.prepare<[string]>(`
        select 
            id, status, email,
            wrapper, enrichment, uploadFile,
            tmpFile, resultFile
        from processing 
        where id = ?;
    `);

    return stmt.get(id) as Processing | undefined;
};

/**
 * Update a processing entry
 * @param id ID of the processing
 * @param processing Content to update
 */
export const updateProcessing = (id: string, processing: Partial<Processing>): Processing | undefined => {
    const previousValue = findProcessing(id);

    if (previousValue === undefined) {
        return undefined;
    }

    const newValue: Processing = {
        ...previousValue,
        status: defaultNull<number>(processing.status, previousValue.status) ?? Status.UNKNOWN,
        email: defaultNull<string>(processing.email, previousValue.email),
        wrapper: defaultNull<string>(processing.wrapper, previousValue.wrapper),
        enrichment: defaultNull<string>(processing.enrichment, previousValue.enrichment),
        tmpFile: defaultNull<string>(processing.tmpFile, previousValue.tmpFile),
        resultFile: defaultNull<string>(processing.resultFile, previousValue.resultFile),
    };

    const stmt = database.prepare<
        [number, string | null, string | null, string | null, string | null, string | null, string | null]
    >(`
        update processing
        set
            status = ?,
            email = ?,
            wrapper = ?,
            enrichment = ?,
            tmpFile = ?,
            resultFile = ?
        where id = ?;
    `);

    const result = stmt.run(
        newValue.status,
        newValue.email,
        newValue.wrapper,
        newValue.enrichment,
        newValue.tmpFile,
        newValue.resultFile,
        id,
    );

    if (result.changes !== 0) {
        return newValue;
    }

    return previousValue;
};