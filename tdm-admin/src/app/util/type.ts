import type { Stats } from 'node:fs';

export type Page = 'database' | 'file' | 'home' | 'log';

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
export enum ProcessingStatus {
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
    status: ProcessingStatus;
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

export type StorageDashboard = {
    date: string;
    size: number;
};

export type Dashboard = {
    status: Partial<Record<ProcessingStatus, number>>;
    storage: {
        free: number;
        used: number;
        files: {
            upload: StorageDashboard[];
            tmp: StorageDashboard[];
            download: StorageDashboard[];
        };
    };
};
