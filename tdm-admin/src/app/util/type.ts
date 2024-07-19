import type { Stats } from 'node:fs';

export type Page = 'database' | 'file' | 'home' | 'log' | 'setting';

export type ConfigTag = {
    name: string;
    excluded: string[];
};

export type ConfigWrapper = {
    url: string;
    tags: ConfigTag[];
};

export type ConfigEnrichment = {
    url: string;
    retrieveUrl: {
        url: string;
        fileExtension: string;
    };
    tags: ConfigTag[];
};

export type Config = {
    wrappers: ConfigWrapper[];
    enrichments: ConfigEnrichment[];
};

type StringStats = Stats & {
    atime: string;
    mtime: string;
    ctime: string;
    birthtime: string;
};

export type File = {
    file: string;
    stats: StringStats;
};

export type Files = {
    upload: File[];
    tmp: File[];
    download: File[];
};

// eslint-disable-next-line no-shadow
export enum DatabaseStatus {
    UNKNOWN,
    STARTING,
    WRAPPER_RUNNING,
    WRAPPER_ERROR,
    ENRICHMENT_RUNNING,
    ENRICHMENT_ERROR,
    WAITING_WEBHOOK,
    PROCESSING_WEBHOOK,
    FINISHED,
    FINISHED_ERROR,
}

export type Database = {
    id: string;
    status: DatabaseStatus;
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

export type Databases = {
    page: number;
    total: number;
    results: Database[];
};
