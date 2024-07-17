import type { Stats } from 'node:fs';

export type Page = 'database' | 'file' | 'home' | 'log' | 'processing' | 'setting';

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
