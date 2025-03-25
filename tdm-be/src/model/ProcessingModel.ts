import database from '~/lib/database';
import { defaultNull } from '~/lib/utils';
import Status from '~/model/Status';

export type Processing = {
    createdAt: any;
    updatedAt: any;
    id: string;
    status: Status;
    email: string | null;
    wrapper: string | null;
    wrapperParam: string | null;
    enrichment: string | null;
    enrichmentHook: string | null;
    originalName: string;
    uploadFile: string;
    tmpFile: string | null;
    resultFile: string | null;
};

/**
 * Create a new processing
 * @param id ID of the processing
 * @param originalName Name of the original file
 * @param uploadFile Source file of processing
 */
export const createProcessing = (id: string, originalName: string, uploadFile: string): Processing | undefined => {
    const stmt = database.prepare<[string, number, string, string], Processing>(`
        insert into processing (id, status, uploadFile, originalName)
        values (?, ?, ?, ?);
    `);

    const result = stmt.run(id, Status.UNKNOWN, uploadFile, originalName);

    if (result.changes !== 0) {
        return {
            id,
            status: Status.UNKNOWN,
            uploadFile,
            originalName,
            email: null,
            tmpFile: null,
            resultFile: null,
            wrapper: null,
            wrapperParam: null,
            enrichment: null,
            enrichmentHook: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } satisfies Processing;
    }

    return undefined;
};

export const countAllProcessing = (): number => {
    const stmt = database.prepare<unknown[], { total: number }>(`
        select count(id) as total from processing;
    `);

    const res = stmt.get();

    if (res) {
        return res.total;
    }

    return 0;
};

export const findAllStatus = (): Array<{ status: number }> => {
    const stmt = database.prepare<unknown[], { status: number }>(`
        select status from processing;
    `);

    return stmt.all();
};

export const findAllProcessing = (page: number): { page: number; total: number; results: Processing[] } => {
    const stmt = database.prepare<[number], Processing>(`
        select id,
               status,
               email,
               wrapper,
               wrapperParam,
               enrichment,
               enrichmentHook,
               uploadFile,
               originalName,
               tmpFile,
               resultFile
        from processing
        limit 10
        offset ?;
    `);

    return {
        page,
        total: countAllProcessing(),
        results: stmt.all((page - 1) * 10),
    };
};

/**
 * Find a processing
 * @param id ID of the processing
 */
export const findProcessing = (id: string): Processing | undefined => {
    const stmt = database.prepare<[string], Processing>(`
        select id,
               status,
               email,
               wrapper,
               wrapperParam,
               enrichment,
               enrichmentHook,
               uploadFile,
               originalName,
               tmpFile,
               resultFile
        from processing
        where id = ?;
    `);

    return stmt.get(id);
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
        wrapperParam: defaultNull<string>(processing.wrapperParam, previousValue.wrapperParam),
        enrichment: defaultNull<string>(processing.enrichment, previousValue.enrichment),
        enrichmentHook: defaultNull<string>(processing.enrichmentHook, previousValue.enrichmentHook),
        tmpFile: defaultNull<string>(processing.tmpFile, previousValue.tmpFile),
        resultFile: defaultNull<string>(processing.resultFile, previousValue.resultFile),
    };

    const stmt = database.prepare<
        [
            number,
            string | null,
            string | null,
            string | null,
            string | null,
            string | null,
            string | null,
            string | null,
            string | null,
        ],
        Processing
    >(`
        update processing
        set status         = ?,
            email          = ?,
            wrapper        = ?,
            wrapperParam   = ?,
            enrichment     = ?,
            enrichmentHook = ?,
            tmpFile        = ?,
            resultFile     = ?
        where id = ?;
    `);

    const result = stmt.run(
        newValue.status,
        newValue.email,
        newValue.wrapper,
        newValue.wrapperParam,
        newValue.enrichment,
        newValue.enrichmentHook,
        newValue.tmpFile,
        newValue.resultFile,
        id,
    );

    if (result.changes !== 0) {
        return newValue;
    }

    return previousValue;
};
