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
